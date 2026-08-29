import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { fail, requireChallenge, requireUser } from "./domain";
import { badgeTypeValidator, schema } from "./schema";

const profileSummaryValidator = v.object({
  user: schema.doc("users"),
  stats: v.object({
    shipped: v.number(),
    approved: v.number(),
    avgJudge: v.union(v.number(), v.null()),
    badgeCount: v.number(),
  }),
  score: v.object({
    total: v.number(),
    breakdown: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        value: v.number(),
        primary: v.optional(v.boolean()),
      }),
    ),
  }),
  skills: v.array(v.string()),
  badges: v.array(
    v.object({
      id: v.id("badges"),
      type: badgeTypeValidator,
    }),
  ),
  projects: v.array(
    v.object({
      submissionId: v.id("submissions"),
      title: v.string(),
      startupName: v.string(),
      sector: v.union(v.string(), v.null()),
      score: v.union(v.number(), v.null()),
      authorshipApproved: v.boolean(),
      shipUrl: v.string(),
    }),
  ),
});

function clamp100(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export const listByUser = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("badges")),
  handler: async (ctx, args) =>
    await ctx.db
      .query("badges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts),
});

export const profileSummary = query({
  args: { handle: v.string() },
  returns: v.union(profileSummaryValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_githubHandle", (q) =>
        q.eq("githubHandle", args.handle.toLowerCase()),
      )
      .unique();
    if (!user) return null;

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_builderId_and_updatedAt", (q) =>
        q.eq("builderId", user._id),
      )
      .order("desc")
      .take(50);

    const evaluated = await Promise.all(
      submissions.map(async (submission) => ({
        submission,
        evaluation: await ctx.db
          .query("evaluations")
          .withIndex("by_submissionId", (q) =>
            q.eq("submissionId", submission._id),
          )
          .unique(),
      })),
    );

    const badges = await ctx.db
      .query("badges")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);

    const shipped = submissions.length;
    const scored = evaluated.filter(
      ({ evaluation }) => typeof evaluation?.totalScore === "number",
    );
    const avgJudge = scored.length
      ? Math.round(
          scored.reduce(
            (total, { evaluation }) => total + (evaluation?.totalScore ?? 0),
            0,
          ) / scored.length,
        )
      : null;
    const approved = badges.filter(
      (badge) => badge.type === "startup-approved",
    ).length;
    const authorshipVerified = evaluated.filter(
      ({ evaluation }) => evaluation?.authorshipStatus === "approved",
    ).length;

    const shipsSignal = clamp100(shipped * 10);
    const approvalSignal = shipped
      ? clamp100((approved / shipped) * 100)
      : 0;
    const judgeSignal = avgJudge ?? 0;
    const authorshipSignal = shipped
      ? clamp100((authorshipVerified / shipped) * 100)
      : 0;
    const breakdown = [
      { key: "ships", label: `Ships (${shipped})`, value: shipsSignal },
      {
        key: "approval",
        label: `Approval rate (${approved}/${shipped})`,
        value: approvalSignal,
      },
      { key: "judge", label: "Avg AI Judge", value: judgeSignal },
      {
        key: "authorship",
        label: "Autoría verificada",
        value: authorshipSignal,
        primary: true,
      },
    ];
    const total = Math.round(
      ((shipsSignal + approvalSignal + judgeSignal + authorshipSignal) / 4) *
        10,
    );

    const projects = (
      await Promise.all(
        evaluated.map(async ({ submission, evaluation }) => {
          const challenge = await ctx.db.get(
            "challenges",
            submission.challengeId,
          );
          const startup: Doc<"users"> | null = challenge
            ? await ctx.db.get("users", challenge.startupId)
            : null;
          return {
            submissionId: submission._id,
            title: challenge?.title ?? "Reto",
            startupName:
              startup?.companyName ?? startup?.name ?? "Startup",
            sector: startup?.sector ?? null,
            score: evaluation?.totalScore ?? null,
            authorshipApproved: evaluation?.authorshipStatus === "approved",
            shipUrl: submission.demoUrl ?? submission.repositoryUrl,
          };
        }),
      )
    )
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
      .slice(0, 3);

    return {
      user,
      stats: { shipped, approved, avgJudge, badgeCount: badges.length },
      score: { total, breakdown },
      skills: user.skills ?? [],
      badges: badges.map((badge) => ({ id: badge._id, type: badge.type })),
      projects,
    };
  },
});

export const award = internalMutation({
  args: {
    userId: v.id("users"),
    type: badgeTypeValidator,
    challengeId: v.id("challenges"),
  },
  returns: v.id("badges"),
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    await requireChallenge(ctx, args.challengeId);
    const existing = await ctx.db
      .query("badges")
      .withIndex("by_userId_and_type_and_challengeId", (q) =>
        q
          .eq("userId", args.userId)
          .eq("type", args.type)
          .eq("challengeId", args.challengeId),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("badges", {
      ...args,
      awardedAt: Date.now(),
    });
  },
});

export const revoke = internalMutation({
  args: {
    userId: v.id("users"),
    type: badgeTypeValidator,
    challengeId: v.id("challenges"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const badge = await ctx.db
      .query("badges")
      .withIndex("by_userId_and_type_and_challengeId", (q) =>
        q
          .eq("userId", args.userId)
          .eq("type", args.type)
          .eq("challengeId", args.challengeId),
      )
      .unique();
    if (!badge) return false;
    if (badge.userId !== args.userId) {
      fail("BADGE_OWNER_MISMATCH", "Badge owner mismatch");
    }
    await ctx.db.delete("badges", badge._id);
    return true;
  },
});
