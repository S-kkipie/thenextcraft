import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { challengeStatusValidator } from "./schema";

// Startup Shortlist — la IA filtra/rankea (N → 10, score comparable) y verifica
// autoría; la STARTUP toma la decisión final de contratación. La plataforma nunca
// corre código: el score es estático y la autoría es humana (video/entrevista).

// Tamaño del shortlist que la IA propone a la startup.
const SHORTLIST_SIZE = 10;

const authorshipStatusValidator = v.union(
  v.literal("pending"),
  v.literal("video"),
  v.literal("interview"),
  v.literal("approved"),
);

const rankedRowValidator = v.object({
  rank: v.number(),
  submissionId: v.id("submissions"),
  builder: v.object({
    name: v.string(),
    handle: v.string(),
    initials: v.string(),
  }),
  aiMatch: v.number(),
  score: v.number(),
  authorshipStatus: authorshipStatusValidator,
  strength: v.string(),
});

const summaryValidator = v.object({
  challenge: v.object({
    title: v.string(),
    status: challengeStatusValidator,
    reward: v.union(v.string(), v.null()),
  }),
  stats: v.object({
    submissions: v.number(),
    shortlisted: v.number(),
    evaluated: v.number(),
    average: v.number(),
  }),
});

// Tarjeta de builder para la tabla: nombre, @handle e iniciales del avatar.
function builderCard(user: Doc<"users">) {
  const name = user.name ?? user.githubHandle ?? "Builder";
  const handle = user.githubHandle ?? name.toLowerCase().replace(/\s+/g, "");
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join("") || "?";
  return { name, handle, initials };
}

// Shortlist rankeado por la IA: submissions del reto (index by_challenge), join
// de su evaluación (index by_submission) y del builder, orden por totalScore desc,
// top SHORTLIST_SIZE. Solo entran las submissions ya evaluadas (con totalScore).
export const ranked = query({
  args: { challengeId: v.id("challenges") },
  returns: v.array(rankedRowValidator),
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", args.challengeId),
      )
      .take(100);

    const scored = [];
    for (const submission of submissions) {
      const evaluation = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) =>
          q.eq("submissionId", submission._id),
        )
        .unique();
      if (!evaluation || evaluation.totalScore == null) continue;

      const builder = await ctx.db.get(submission.builderId);
      if (!builder) continue;

      scored.push({
        submissionId: submission._id,
        totalScore: evaluation.totalScore,
        aiMatch: Math.round(evaluation.fitScore ?? evaluation.totalScore),
        score: Math.round(evaluation.totalScore),
        authorshipStatus: evaluation.authorshipStatus,
        strength: evaluation.strengths?.[0] ?? "",
        builder: builderCard(builder),
      });
    }

    scored.sort((a, b) => b.totalScore - a.totalScore);

    return scored.slice(0, SHORTLIST_SIZE).map((row, index) => ({
      rank: index + 1,
      submissionId: row.submissionId,
      builder: row.builder,
      aiMatch: row.aiMatch,
      score: row.score,
      authorshipStatus: row.authorshipStatus,
      strength: row.strength,
    }));
  },
});

// Encabezado + tiles de la pantalla: título/estado del reto y contadores
// (submissions, shortlisted, evaluadas, promedio). Devuelve null si no existe.
export const summary = query({
  args: { challengeId: v.id("challenges") },
  returns: v.union(v.null(), summaryValidator),
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return null;

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", args.challengeId),
      )
      .take(100);

    let evaluated = 0;
    let scoreSum = 0;
    for (const submission of submissions) {
      const evaluation = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) =>
          q.eq("submissionId", submission._id),
        )
        .unique();
      if (evaluation && evaluation.totalScore != null) {
        evaluated += 1;
        scoreSum += evaluation.totalScore;
      }
    }

    return {
      challenge: {
        title: challenge.title,
        status: challenge.status,
        reward: challenge.reward ?? null,
      },
      stats: {
        submissions: submissions.length,
        shortlisted: Math.min(SHORTLIST_SIZE, evaluated),
        evaluated,
        average: evaluated ? Math.round(scoreSum / evaluated) : 0,
      },
    };
  },
});

// Cerrar el reto (deja de recibir ships). TODO(auth): validar que el caller es la
// startup dueña vía ctx.auth cuando exista GitHub OAuth; hoy es dev-auth stand-in.
export const close = mutation({
  args: { challengeId: v.id("challenges") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Reto no encontrado");
    await ctx.db.patch("challenges", args.challengeId, {
      status: "closed",
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});
