import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// AI Judge — evaluación ESTÁTICA. Analiza el repo/link, NUNCA ejecuta código.
// Sin métricas de latency/throughput/tests-ejecutados. Prioridad de scoring:
//   (1) Fit al reto [primaria] · (2) Calidad · (3) Arquitectura · (4) Seguridad.
// La etapa de autoría es una viva humana (video/entrevista), no automática.

// ── Read ────────────────────────────────────────────────────────────────
export const getBySubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) =>
    ctx.db
      .query("evaluations")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .unique(),
});

// ── Prueba de autoría (viva humana) ──────────────────────────────────────
// El fit y la calidad ya pasaron; el builder defiende su autoría. `pending`
// es el estado inicial (no seteable por el cliente).
export const setAuthorship = mutation({
  args: {
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("video"),
      v.literal("interview"),
      v.literal("approved"),
    ),
  },
  handler: async (ctx, args) => {
    const evaluation = await ctx.db
      .query("evaluations")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .unique();
    if (!evaluation) throw new Error("evaluación no encontrada");
    await ctx.db.patch(evaluation._id, { authorshipStatus: args.status });
  },
});

// ── Pipeline AI Judge (action → internalMutation) ────────────────────────
// Peso del total: Fit 0.40 · Calidad 0.25 · Arquitectura 0.20 · Seguridad 0.15
// (Fit es la señal primaria del reto).
const WEIGHTS = {
  fit: 0.4,
  quality: 0.25,
  architecture: 0.2,
  security: 0.15,
} as const;

export const evaluate = action({
  args: { submissionId: v.id("submissions") },
  returns: v.object({
    submissionId: v.id("submissions"),
    status: v.literal("not_implemented"),
  }),
  handler: async (_ctx, args) => {
    return {
      submissionId: args.submissionId,
      ...scores,
      totalScore,
    });
    return { submissionId: args.submissionId, totalScore };
  },
});

// Persiste los scores del juez, marca la submission como evaluada y recalcula
// el ranking del reto. Interno: solo lo invoca `evaluate`.
export const applyEvaluation = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    fitScore: v.number(),
    qualityScore: v.number(),
    architectureScore: v.number(),
    securityScore: v.number(),
    totalScore: v.number(),
    strengths: v.array(v.string()),
    issues: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("submission no encontrada");

    // Upsert: `ship` ya no siembra la fila de evaluación, así que el ciclo de
    // vida de `evaluations` vive en este dominio. Si no existe, la creamos.
    const evaluation = await ctx.db
      .query("evaluations")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .unique();

    const scores = {
      fitScore: args.fitScore,
      qualityScore: args.qualityScore,
      architectureScore: args.architectureScore,
      securityScore: args.securityScore,
      totalScore: args.totalScore,
      strengths: args.strengths,
      issues: args.issues,
      aiEvidence: "Análisis estático del repo/link (mock).",
    };

    if (evaluation) {
      await ctx.db.patch(evaluation._id, scores);
    } else {
      await ctx.db.insert("evaluations", {
        submissionId: args.submissionId,
        authorshipStatus: "pending",
        ...scores,
      });
    }
    await ctx.db.patch(args.submissionId, { status: "evaluated" });

    await recomputeRanks(ctx, submission.challengeId);
  },
});

// ── helpers (no son funciones Convex) ────────────────────────────────────

// Rank dentro del reto por totalScore desc; solo submissions ya evaluadas.
async function recomputeRanks(ctx: MutationCtx, challengeId: Id<"challenges">) {
  const submissions = await ctx.db
    .query("submissions")
    .withIndex("by_challenge", (q) => q.eq("challengeId", challengeId))
    .collect();

  const scored: Array<{ id: Id<"evaluations">; total: number }> = [];
  for (const s of submissions) {
    const ev = await ctx.db
      .query("evaluations")
      .withIndex("by_submission", (q) => q.eq("submissionId", s._id))
      .unique();
    if (ev && typeof ev.totalScore === "number") {
      scored.push({ id: ev._id, total: ev.totalScore });
    }
  }

  scored.sort((a, b) => b.total - a.total);
  for (let i = 0; i < scored.length; i++) {
    await ctx.db.patch(scored[i].id, { rank: i + 1 });
  }
}

// Hash determinista (FNV-1a) → scores estables por submission, ergo rank estable.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const STRENGTHS_POOL = [
  "Priorización clara del riesgo.",
  "UX legible en <30s.",
  "Buen manejo de 10k+ registros.",
  "Estructura de datos coherente con el reto.",
  "README claro con las decisiones de diseño.",
];
const ISSUES_POOL = [
  "Faltan estados vacíos.",
  "Tests ausentes en el módulo de scoring.",
  "Manejo de errores incompleto en los bordes.",
  "Nombres poco descriptivos en un módulo.",
];

// MOCK del juez estático: scores + fuertes/revisar deterministas por submission.
function mockEvaluation(submissionId: Id<"submissions">) {
  const dim = (salt: string, lo: number, hi: number) =>
    lo + (hashString(submissionId + salt) % (hi - lo + 1));
  const take = (pool: string[], salt: string, n: number) => {
    const start = hashString(submissionId + salt) % pool.length;
    return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]);
  };
  return {
    fitScore: dim(":fit", 78, 96),
    qualityScore: dim(":quality", 72, 92),
    architectureScore: dim(":arch", 70, 90),
    securityScore: dim(":sec", 74, 94),
    strengths: take(STRENGTHS_POOL, ":str", 3),
    issues: take(ISSUES_POOL, ":iss", 2),
  };
}
