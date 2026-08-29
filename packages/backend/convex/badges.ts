import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

// Badges + public passport summary.
// PRODUCT TRUTH: el Builder Score es REPUTACIÓN derivada de señales reales
// (#shipped, startup-approved rate, avg AI Judge, autoría verificada). streak/
// level/xp (en users) son la capa de engagement — no entran aquí.

/** Insignias de un usuario (índice by_user). */
export const byUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) =>
    ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect(),
});

// Cada señal se normaliza a 0..100; el Builder Score es su media *10 (0..1000).
function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Resumen público del passport por handle de GitHub. Lee cross-table (todo por
 * índice): submissions by_builder, evaluations by_submission, badges by_user,
 * y challenges/users por id para los proyectos destacados.
 */
export const profileSummary = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_github", (q) => q.eq("githubHandle", args.handle))
      .unique();
    if (!user) return null;

    // Ships del builder (más recientes primero).
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_builder", (q) => q.eq("builderId", user._id))
      .order("desc")
      .take(50);

    // Evaluación (0..1) de cada ship.
    const evaluated = await Promise.all(
      submissions.map(async (submission) => {
        const evaluation = await ctx.db
          .query("evaluations")
          .withIndex("by_submission", (q) =>
            q.eq("submissionId", submission._id),
          )
          .unique();
        return { submission, evaluation };
      }),
    );

    const badges = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // ---- Señales reales ----
    const shipped = submissions.length;
    const scored = evaluated.filter(
      (e) => typeof e.evaluation?.totalScore === "number",
    );
    const avgJudge = scored.length
      ? Math.round(
          scored.reduce((a, e) => a + (e.evaluation!.totalScore ?? 0), 0) /
            scored.length,
        )
      : null;
    // startup-approved: insignias otorgadas por la startup.
    const approved = badges.filter((b) => b.type === "startup-approved").length;
    // autoría verificada: evaluación con autoría aprobada (etapa humana).
    const authorshipVerified = evaluated.filter(
      (e) => e.evaluation?.authorshipStatus === "approved",
    ).length;

    // ---- Builder Score (reputación derivada) ----
    const shipsSignal = clamp100(shipped * 10);
    const approvalSignal = shipped ? clamp100((approved / shipped) * 100) : 0;
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
      ((shipsSignal + approvalSignal + judgeSignal + authorshipSignal) / 4) * 10,
    );

    // ---- Proyectos destacados (top por score) ----
    const projects = (
      await Promise.all(
        evaluated.map(async ({ submission, evaluation }) => {
          const challenge = await ctx.db.get(submission.challengeId);
          const startup: Doc<"users"> | null = challenge
            ? await ctx.db.get(challenge.startupId)
            : null;
          return {
            submissionId: submission._id,
            title: challenge?.title ?? "Reto",
            startupName: startup?.companyName ?? startup?.name ?? "Startup",
            sector: startup?.sector ?? null,
            score: evaluation?.totalScore ?? null,
            authorshipApproved: evaluation?.authorshipStatus === "approved",
            shipUrl: submission.demoUrl ?? submission.repoUrl,
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
      badges: badges.map((b) => ({ id: b._id, type: b.type })),
      projects,
    };
  },
});
