import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByChallenge = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) =>
    ctx.db
      .query("submissions")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect(),
});

// Ship = registrar el link + crear su evaluación pendiente.
export const ship = mutation({
  args: {
    challengeId: v.id("challenges"),
    builderId: v.id("users"),
    link: v.string(),
    mediaUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("submissions", {
      ...args,
      createdAt: Date.now(),
    });
    await ctx.db.insert("evaluations", {
      submissionId,
      authorshipStatus: "pending",
    });
    return submissionId;
  },
});
