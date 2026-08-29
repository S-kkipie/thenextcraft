import { query } from "./_generated/server";
import { v } from "convex/values";

// Startup shortlist: submissions rankeadas por la IA. La startup decide el hire.
export const ranked = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", challengeId),
      )
      .collect();

    const rows = [];
    for (const s of subs) {
      const ev = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) => q.eq("submissionId", s._id))
        .unique();
      if (!ev || ev.totalScore == null) continue;
      const u = await ctx.db.get("users", s.builderId);
      rows.push({
        submissionId: s._id,
        builder: {
          name: u?.name ?? "?",
          handle: u?.githubHandle ?? null,
          initials: (u?.name?.[0] ?? "?").toUpperCase(),
        },
        aiMatch: ev.fitScore ?? ev.totalScore,
        score: ev.totalScore,
        feedbackStatus: ev.feedbackStatus ?? "pending",
        strength: ev.strengths?.[0] ?? null,
      });
    }
    rows.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return rows.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 }));
  },
});

// Galería de ships del reto: TODAS las submissions (no solo el top-10
// rankeado) con sus URLs para renderizar el preview de la app + visitarla.
// Vista tipo crafter.run/ships pero por reto.
export const ships = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", challengeId),
      )
      .order("desc")
      .collect();

    const rows = [];
    for (const s of subs) {
      if (s.status === "withdrawn") continue;
      const ev = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) => q.eq("submissionId", s._id))
        .unique();
      const u = await ctx.db.get("users", s.builderId);
      rows.push({
        submissionId: s._id,
        builder: {
          name: u?.name ?? "?",
          handle: u?.githubHandle ?? null,
          avatarUrl: u?.avatarUrl ?? null,
          initials: (u?.name?.[0] ?? "?").toUpperCase(),
        },
        demoUrl: s.demoUrl ?? null,
        repositoryUrl: s.repositoryUrl,
        mediaUrl: s.mediaUrl ?? null,
        pitch: s.pitch ?? null,
        tech: s.tech ?? null,
        score: ev?.totalScore ?? null,
        status: s.status,
        submittedAt: s.submittedAt,
      });
    }

    // Con demo primero (previewables arriba), luego por score, luego recientes.
    rows.sort((a, b) => {
      const ad = a.demoUrl ? 1 : 0;
      const bd = b.demoUrl ? 1 : 0;
      if (ad !== bd) return bd - ad;
      const as = a.score ?? -1;
      const bs = b.score ?? -1;
      if (as !== bs) return bs - as;
      return b.submittedAt - a.submittedAt;
    });
    return rows;
  },
});

export const summary = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const ch = await ctx.db.get("challenges", challengeId);
    if (!ch) return null;
    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", challengeId),
      )
      .collect();
    const evals = await ctx.db
      .query("evaluations")
      .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
        q.eq("challengeId", challengeId).eq("status", "completed"),
      )
      .collect();
    const scores = evals
      .map((e) => e.totalScore ?? 0)
      .filter((x) => x > 0);
    const average = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return {
      challenge: { title: ch.title, status: ch.status, reward: ch.reward ?? null },
      stats: {
        submissions: subs.length,
        shortlisted: Math.min(evals.length, 10),
        evaluated: evals.length,
        average,
      },
    };
  },
});
