import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  cleanHttpUrl,
  cleanOptionalText,
  cleanPublicGithubRepositoryUrl,
  ensureChallengeAcceptsSubmissions,
  fail,
  requireChallenge,
  requireRole,
} from "./domain";
import { schema, submissionStatusValidator } from "./schema";

export const get = query({
  args: { submissionId: v.id("submissions") },
  returns: v.union(schema.doc("submissions"), v.null()),
  handler: async (ctx, args) =>
    await ctx.db.get("submissions", args.submissionId),
});

export const listByChallenge = query({
  args: {
    challengeId: v.id("challenges"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(submissionStatusValidator),
  },
  returns: paginationResultValidator(schema.doc("submissions")),
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("submissions")
        .withIndex("by_challengeId_and_status_and_updatedAt", (q) =>
          q.eq("challengeId", args.challengeId).eq("status", status),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", args.challengeId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByBuilder = query({
  args: {
    builderId: v.id("users"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(submissionStatusValidator),
  },
  returns: paginationResultValidator(schema.doc("submissions")),
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("submissions")
        .withIndex("by_builderId_and_status_and_updatedAt", (q) =>
          q.eq("builderId", args.builderId).eq("status", status),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("submissions")
      .withIndex("by_builderId_and_updatedAt", (q) =>
        q.eq("builderId", args.builderId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const submit = mutation({
  args: {
    challengeId: v.id("challenges"),
    builderId: v.id("users"),
    repositoryUrl: v.string(),
    demoUrl: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    pitch: v.optional(v.string()),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    await requireRole(ctx, args.builderId, "builder");
    const challenge = await requireChallenge(ctx, args.challengeId);
    ensureChallengeAcceptsSubmissions(challenge);

    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_builderId", (q) =>
        q
          .eq("challengeId", args.challengeId)
          .eq("builderId", args.builderId),
      )
      .unique();
    if (existing) {
      fail(
        "SUBMISSION_ALREADY_EXISTS",
        "A builder can submit only once per challenge",
      );
    }

    const now = Date.now();
    const submissionId = await ctx.db.insert("submissions", {
      challengeId: args.challengeId,
      builderId: args.builderId,
      repositoryUrl: cleanPublicGithubRepositoryUrl(args.repositoryUrl),
      demoUrl: cleanHttpUrl(args.demoUrl, "demoUrl") ?? undefined,
      mediaUrl: cleanHttpUrl(args.mediaUrl, "mediaUrl") ?? undefined,
      pitch: cleanOptionalText(args.pitch, "pitch", 2_000) ?? undefined,
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("evaluations", {
      challengeId: args.challengeId,
      submissionId,
      status: "pending",
      authorshipStatus: "pending",
      updatedAt: now,
    });
    await ctx.db.insert("badges", {
      userId: args.builderId,
      type: "shipped",
      challengeId: args.challengeId,
      awardedAt: now,
    });

    return submissionId;
  },
});

export const update = mutation({
  args: {
    submissionId: v.id("submissions"),
    builderId: v.id("users"),
    repositoryUrl: v.optional(v.string()),
    demoUrl: v.optional(v.union(v.string(), v.null())),
    mediaUrl: v.optional(v.union(v.string(), v.null())),
    pitch: v.optional(v.union(v.string(), v.null())),
  },
  returns: schema.doc("submissions"),
  handler: async (ctx, args) => {
    await requireRole(ctx, args.builderId, "builder");
    const submission = await ctx.db.get("submissions", args.submissionId);
    if (!submission) fail("SUBMISSION_NOT_FOUND", "Submission not found");
    if (submission.builderId !== args.builderId) {
      fail("NOT_SUBMISSION_OWNER", "The builder does not own this submission");
    }
    if (submission.status !== "submitted") {
      fail("SUBMISSION_NOT_EDITABLE", "Withdrawn submissions cannot be edited");
    }
    const challenge = await requireChallenge(ctx, submission.challengeId);
    ensureChallengeAcceptsSubmissions(challenge);

    const patch: {
      repositoryUrl?: string;
      demoUrl?: string;
      mediaUrl?: string;
      pitch?: string;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.repositoryUrl !== undefined) {
      patch.repositoryUrl = cleanPublicGithubRepositoryUrl(args.repositoryUrl);
    }
    if (args.demoUrl !== undefined) {
      patch.demoUrl = cleanHttpUrl(args.demoUrl, "demoUrl") ?? undefined;
    }
    if (args.mediaUrl !== undefined) {
      patch.mediaUrl = cleanHttpUrl(args.mediaUrl, "mediaUrl") ?? undefined;
    }
    if (args.pitch !== undefined) {
      patch.pitch = cleanOptionalText(args.pitch, "pitch", 2_000) ?? undefined;
    }

    await ctx.db.patch("submissions", args.submissionId, patch);
    const updated = await ctx.db.get("submissions", args.submissionId);
    if (!updated) fail("SUBMISSION_NOT_FOUND", "Submission not found");
    return updated;
  },
});

export const withdraw = mutation({
  args: {
    submissionId: v.id("submissions"),
    builderId: v.id("users"),
  },
  returns: schema.doc("submissions"),
  handler: async (ctx, args) => {
    await requireRole(ctx, args.builderId, "builder");
    const submission = await ctx.db.get("submissions", args.submissionId);
    if (!submission) fail("SUBMISSION_NOT_FOUND", "Submission not found");
    if (submission.builderId !== args.builderId) {
      fail("NOT_SUBMISSION_OWNER", "The builder does not own this submission");
    }
    if (submission.status !== "submitted") {
      fail("SUBMISSION_ALREADY_WITHDRAWN", "The submission is already withdrawn");
    }

    const now = Date.now();
    await ctx.db.patch("submissions", args.submissionId, {
      status: "withdrawn",
      updatedAt: now,
    });

    const evaluation = await ctx.db
      .query("evaluations")
      .withIndex("by_submissionId", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .unique();
    if (evaluation) {
      await ctx.db.patch("evaluations", evaluation._id, {
        status: "cancelled",
        updatedAt: now,
      });
    }

    const shippedBadge = await ctx.db
      .query("badges")
      .withIndex("by_userId_and_type_and_challengeId", (q) =>
        q
          .eq("userId", args.builderId)
          .eq("type", "shipped")
          .eq("challengeId", submission.challengeId),
      )
      .unique();
    if (shippedBadge) await ctx.db.delete("badges", shippedBadge._id);

    const withdrawn = await ctx.db.get("submissions", args.submissionId);
    if (!withdrawn) fail("SUBMISSION_NOT_FOUND", "Submission not found");
    return withdrawn;
  },
});
