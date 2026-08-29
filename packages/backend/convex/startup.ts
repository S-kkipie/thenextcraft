import { query } from "./_generated/server";
import { v } from "convex/values";

// Startup dashboard: sus retos + conteos. Read-only, indexado.
export const dashboard = query({
  args: { startupId: v.id("users") },
  handler: async (ctx, { startupId }) => {
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_startup", (q) => q.eq("startupId", startupId))
      .collect();

    let totalSubmissions = 0;
    let shortlisted = 0;
    const rows = [];
    for (const c of challenges) {
      const subs = await ctx.db
        .query("submissions")
        .withIndex("by_challenge", (q) => q.eq("challengeId", c._id))
        .collect();
      const evaluated = subs.filter((s) => s.status === "evaluated").length;
      const shortlistedCount = Math.min(evaluated, 10);
      totalSubmissions += subs.length;
      shortlisted += shortlistedCount;
      rows.push({
        _id: c._id,
        title: c.title,
        status: c.status,
        reward: c.reward ?? null,
        submissionsCount: subs.length,
        shortlistedCount,
      });
    }

    return {
      stats: {
        activeRetos: challenges.filter((c) => c.status === "open").length,
        totalSubmissions,
        shortlisted,
      },
      challenges: rows,
    };
  },
});
