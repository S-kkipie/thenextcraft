import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, query, type MutationCtx } from "./_generated/server";
import {
  cleanOptionalText,
  cleanRequiredText,
  ensureScore,
  fail,
} from "./domain";
import { schema } from "./schema";

async function getEvaluation(
  ctx: MutationCtx,
  submissionId: Id<"submissions">,
) {
  const submission = await ctx.db.get("submissions", submissionId);
  if (!submission) fail("SUBMISSION_NOT_FOUND", "Submission not found");
  const evaluation = await ctx.db
    .query("evaluations")
    .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
    .unique();
  if (!evaluation) fail("EVALUATION_NOT_FOUND", "Evaluation not found");
  return { evaluation, submission };
}

export const getForSubmission = query({
  args: { submissionId: v.id("submissions") },
  returns: v.union(schema.doc("evaluations"), v.null()),
  handler: async (ctx, args) =>
    await ctx.db
      .query("evaluations")
      .withIndex("by_submissionId", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .unique(),
});

export const listByChallenge = query({
  args: {
    challengeId: v.id("challenges"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("evaluations")),
  handler: async (ctx, args) =>
    await ctx.db
      .query("evaluations")
      .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
        q.eq("challengeId", args.challengeId).eq("status", "completed"),
      )
      .order("desc")
      .paginate(args.paginationOpts),
});

export const markStarted = internalMutation({
  args: { submissionId: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { evaluation, submission } = await getEvaluation(
      ctx,
      args.submissionId,
    );
    if (submission.status !== "submitted") {
      fail("SUBMISSION_WITHDRAWN", "Withdrawn submissions cannot be evaluated");
    }
    await ctx.db.patch("evaluations", evaluation._id, {
      status: "in_progress",
      failureReason: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const complete = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    fitScore: v.number(),
    qualityScore: v.number(),
    totalScore: v.number(),
    rankedReview: v.string(),
    aiEvidence: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { evaluation, submission } = await getEvaluation(
      ctx,
      args.submissionId,
    );
    if (submission.status !== "submitted") {
      fail("SUBMISSION_WITHDRAWN", "Withdrawn submissions cannot be evaluated");
    }
    await ctx.db.patch("evaluations", evaluation._id, {
      status: "completed",
      fitScore: ensureScore(args.fitScore, "fitScore"),
      qualityScore: ensureScore(args.qualityScore, "qualityScore"),
      totalScore: ensureScore(args.totalScore, "totalScore"),
      rankedReview: cleanRequiredText(
        args.rankedReview,
        "rankedReview",
        1,
        10_000,
      ),
      aiEvidence:
        cleanOptionalText(args.aiEvidence, "aiEvidence", 20_000) ?? undefined,
      failureReason: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const failEvaluation = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { evaluation } = await getEvaluation(ctx, args.submissionId);
    await ctx.db.patch("evaluations", evaluation._id, {
      status: "failed",
      failureReason: cleanRequiredText(args.reason, "reason", 1, 2_000),
      updatedAt: Date.now(),
    });
    return null;
  },
});

