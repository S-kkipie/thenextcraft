import { query } from "./_generated/server";
import { v } from "convex/values";

// Startup dashboard: sus retos + conteos. Sobre el schema de Alejandro.
export const dashboard = query({
  args: { startupId: v.id("users") },
  handler: async (ctx, { startupId }) => {
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_startupId_and_updatedAt", (q) =>
        q.eq("startupId", startupId),
      )
      .order("desc")
      .take(100);

    let totalSubmissions = 0;
    let shortlisted = 0;
    const rows = [];
    for (const c of challenges) {
      const subs = await ctx.db
        .query("submissions")
        .withIndex("by_challengeId_and_updatedAt", (q) =>
          q.eq("challengeId", c._id),
        )
        .collect();
      const completed = await ctx.db
        .query("evaluations")
        .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
          q.eq("challengeId", c._id).eq("status", "completed"),
        )
        .collect();
      const shortlistedCount = Math.min(completed.length, 10);
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
