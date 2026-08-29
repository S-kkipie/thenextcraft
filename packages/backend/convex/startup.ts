import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

// Startup dashboard: sus retos + conteos + vistas derivadas (submissions
// recientes, top candidatos, acciones pendientes, pipeline). Todo derivado de
// challenges/submissions/evaluations — sin tablas nuevas. El feedback line-level
// se genera al FINALIZAR (cerrar) el reto.
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

    const userCache = new Map<Id<"users">, Doc<"users"> | null>();
    const getBuilder = async (id: Id<"users">) => {
      if (!userCache.has(id)) userCache.set(id, await ctx.db.get("users", id));
      return userCache.get(id) ?? null;
    };

    let totalSubmissions = 0;
    let shortlisted = 0;
    let feedbackReady = 0;
    const rows = [];
    const recentSubmissions = [];
    const topCandidates = [];
    const pendingActions: {
      kind: "finalize" | "feedback";
      label: string;
      href: string;
    }[] = [];

    for (const c of challenges) {
      const subs = await ctx.db
        .query("submissions")
        .withIndex("by_challengeId_and_updatedAt", (q) =>
          q.eq("challengeId", c._id),
        )
        .collect();
      const evals = await ctx.db
        .query("evaluations")
        .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
          q.eq("challengeId", c._id),
        )
        .collect();
      const evalBySub = new Map(evals.map((e) => [e.submissionId, e]));

      const completed = evals.filter((e) => e.status === "completed");
      const shortlistedCount = Math.min(completed.length, 10);
      totalSubmissions += subs.length;
      shortlisted += shortlistedCount;
      feedbackReady += evals.filter((e) => e.feedbackStatus === "ready").length;

      rows.push({
        _id: c._id,
        title: c.title,
        status: c.status,
        reward: c.reward ?? null,
        submissionsCount: subs.length,
        shortlistedCount,
      });

      for (const s of subs) {
        const ev = evalBySub.get(s._id);
        const builder = await getBuilder(s.builderId);
        const builderName = builder?.name ?? "Builder";
        const builderHandle = builder?.githubHandle ?? null;
        recentSubmissions.push({
          submissionId: s._id,
          challengeId: c._id,
          challengeTitle: c.title,
          builderName,
          builderHandle,
          score: ev?.totalScore ?? null,
          feedbackStatus: ev?.feedbackStatus ?? "pending",
          submittedAt: s.submittedAt,
        });
        if (ev && ev.totalScore != null) {
          topCandidates.push({
            submissionId: s._id,
            challengeId: c._id,
            challengeTitle: c.title,
            builderName,
            builderHandle,
            aiMatch: ev.fitScore ?? ev.totalScore,
            score: ev.totalScore,
            feedbackStatus: ev.feedbackStatus ?? "pending",
          });
        }
      }

      // Acción pendiente: reto abierto con submissions → finalizar para feedback.
      if (c.status === "open" && subs.length > 0) {
        pendingActions.push({
          kind: "finalize",
          label: `Finaliza “${c.title}” para generar feedback (${subs.length} submission${subs.length === 1 ? "" : "s"})`,
          href: `/startup/shortlist/${c._id}`,
        });
      }
      // Reto cerrado con feedback aún corriendo.
      if (
        c.status === "closed" &&
        evals.some((e) => e.feedbackStatus === "generating")
      ) {
        pendingActions.push({
          kind: "feedback",
          label: `Generando feedback en “${c.title}”…`,
          href: `/startup/shortlist/${c._id}`,
        });
      }
    }

    recentSubmissions.sort((a, b) => b.submittedAt - a.submittedAt);
    topCandidates.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const closedRetos = challenges.filter((c) => c.status === "closed").length;

    return {
      stats: {
        activeRetos: challenges.filter((c) => c.status === "open").length,
        totalSubmissions,
        shortlisted,
      },
      challenges: rows,
      recentSubmissions: recentSubmissions.slice(0, 6),
      topCandidates: topCandidates.slice(0, 5),
      pendingActions: pendingActions.slice(0, 6),
      pipeline: {
        shortlisted,
        feedbackReady,
        closedRetos,
      },
    };
  },
});
