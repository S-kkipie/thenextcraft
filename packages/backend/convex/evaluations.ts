import { Output, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { peerReferenceValidator } from "./schema";
import type { Id } from "./_generated/dataModel";

// Convex actions expose process.env at runtime; declare it for the type-checker.
declare const process: { env: Record<string, string | undefined> };
const DEFAULT_MODEL = "gpt-4o-mini";

// Real AI Technical Judge (static repo review). Corre el pipeline technicalJudge
// para el repo de la submission; al completar puentea scores + findings a la fila
// `evaluations`. La plataforma NUNCA ejecuta código — el juez solo lee archivos.
export const evaluate = action({
  args: { submissionId: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.runQuery(api.submissions.get, { submissionId });
    if (!submission || !submission.repositoryUrl) return null;
    const repoUrl = submission.repositoryUrl;
    const challenge = await ctx.runQuery(api.challenges.get, {
      challengeId: submission.challengeId,
    });
    await ctx.runMutation(api.technicalJudge.start, {
      repoUrl,
      requestId: submissionId,
      submissionId,
      challenge: challenge
        ? {
            title: challenge.title,
            businessProblem: challenge.businessProblem,
            successCriteria: challenge.successCriteria,
          }
        : undefined,
    });
    return null;
  },
});

// ── Finalizar reto → feedback en batch ──────────────────────────────────────
// Al CERRAR un reto (challenges.close) se agenda esto. Marca cada evaluación como
// `generating` y dispara el judge para cada submission con repo. Cuando la última
// review termina, technicalJudge.complete agenda el pase comparativo (peer refs).
export const startChallengeFeedback = internalMutation({
  args: { challengeId: v.id("challenges") },
  returns: v.null(),
  handler: async (ctx, { challengeId }) => {
    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_challengeId_and_updatedAt", (q) =>
        q.eq("challengeId", challengeId),
      )
      .collect();
    const now = Date.now();
    for (const s of subs) {
      const ev = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) => q.eq("submissionId", s._id))
        .unique();
      const hasRepo = Boolean(s.repositoryUrl);
      if (ev) {
        await ctx.db.patch("evaluations", ev._id, {
          feedbackStatus: hasRepo ? "generating" : "failed",
          updatedAt: now,
        });
      }
      if (hasRepo) {
        await ctx.scheduler.runAfter(0, api.evaluations.evaluate, {
          submissionId: s._id,
        });
      }
    }
    return null;
  },
});

// Llamado desde technicalJudge.complete tras cada review. Si ya no quedan reviews
// `generating` en el reto, dispara el pase comparativo (una sola vez).
export const maybeGeneratePeerReferences = internalMutation({
  args: { challengeId: v.id("challenges") },
  returns: v.null(),
  handler: async (ctx, { challengeId }) => {
    const evals = await ctx.db
      .query("evaluations")
      .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
        q.eq("challengeId", challengeId),
      )
      .collect();
    const stillGenerating = evals.some((e) => e.feedbackStatus === "generating");
    if (stillGenerating) return null;
    const withFindings = evals.filter((e) => (e.findings?.length ?? 0) > 0);
    if (withFindings.length < 2) return null; // nada que comparar
    const alreadyDone = withFindings.every(
      (e) => e.peerReferences !== undefined,
    );
    if (alreadyDone) return null;
    await ctx.scheduler.runAfter(0, internal.evaluations.generatePeerReferences, {
      challengeId,
    });
    return null;
  },
});

// Contexto para el pase comparativo: cada submission con findings + su builder.
export const feedbackContext = internalQuery({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const evals = await ctx.db
      .query("evaluations")
      .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
        q.eq("challengeId", challengeId),
      )
      .collect();
    const out = [];
    for (const ev of evals) {
      if (!ev.findings || ev.findings.length === 0) continue;
      const sub = await ctx.db.get("submissions", ev.submissionId);
      const builder = sub ? await ctx.db.get("users", sub.builderId) : null;
      out.push({
        submissionId: ev.submissionId,
        builderName: builder?.name ?? "Builder",
        builderHandle: builder?.githubHandle ?? null,
        summary: ev.summary ?? ev.rankedReview ?? "",
        score: ev.totalScore ?? 0,
        // Incluimos snippet real → el pase comparativo puede CITAR código del
        // peer (prueba que la comparación fue real, no genérica).
        findings: ev.findings.slice(0, 6).map((f) => ({
          title: f.title,
          dimension: f.dimension,
          severity: f.severity,
          path: f.evidence[0]?.path ?? "",
          startLine: f.evidence[0]?.startLine ?? 0,
          snippet: (f.evidence[0]?.snippet ?? "").slice(0, 300),
        })),
      });
    }
    // Rank por score desc → el modelo sabe quién ganó y quién no.
    out.sort((a, b) => b.score - a.score);
    return out.map((c, i) => ({ ...c, rank: i + 1, total: out.length }));
  },
});

const peerOutputSchema = z.object({
  perSubmission: z
    .array(
      z.object({
        submissionId: z.string(),
        // Por qué quedó en este puesto vs las demás. Para el que NO ganó, di
        // explícitamente qué le faltó frente al líder (nombrando al peer).
        competitiveNote: z
          .string()
          .min(20)
          .max(600)
          .describe(
            "Por qué esta submission quedó en su puesto frente a las demás del reto. Si no es la #1, nombra al/los peer(s) que la superaron y en qué (concreto). Español, ecuánime.",
          ),
        references: z
          .array(
            z.object({
              peerBuilderHandle: z.string().nullable(),
              peerBuilderName: z.string(),
              path: z.string(),
              startLine: z.number().int().min(0),
              snippet: z
                .string()
                .max(300)
                .describe(
                  "Fragmento REAL del código del peer citado (de los datos provistos). Prueba que la comparación fue real.",
                ),
              note: z
                .string()
                .min(10)
                .max(400)
                .describe(
                  "Qué hizo el peer en ese código y cómo se compara con ESTA submission. Español.",
                ),
            }),
          )
          .max(3),
      }),
    )
    .max(20),
});

// Pase comparativo: compara todas las submissions del reto entre sí y produce,
// por submission, citas a los peers (qué hicieron mejor/distinto + archivo:línea).
export const generatePeerReferences = internalAction({
  args: { challengeId: v.id("challenges") },
  returns: v.null(),
  handler: async (ctx, { challengeId }) => {
    const context = await ctx.runQuery(
      internal.evaluations.feedbackContext,
      { challengeId },
    );
    if (context.length < 2) return null;
    if (!process.env.OPENAI_API_KEY) return null;

    const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let generation;
    try {
      generation = await generateText({
        model: openai.responses(model),
        output: Output.object({
          name: "peer_references",
          description:
            "Para cada submission, citas comparativas a OTRAS submissions del mismo reto.",
          schema: peerOutputSchema,
        }),
        system:
          "Comparas TODAS las soluciones al MISMO reto técnico (vienen rankeadas por score). Para CADA submission: (1) escribe competitiveNote diciendo por qué quedó en su puesto — si no es la #1, nombra al/los peer(s) que la superaron y en qué concreto; (2) cita 1-3 peers, cada uno con un fragmento REAL de su código (de los datos) y una nota de cómo contrasta con ESTA submission. Sé específico y ecuánime, en español. Nunca cites una submission a sí misma. Usa solo los datos provistos (paths, líneas y snippets dados); no inventes código.",
        prompt: JSON.stringify({
          task: "Genera competitiveNote + peer references por submission. Las submissions vienen con rank (1 = mejor score).",
          submissions: context,
        }),
        timeout: 120_000,
        maxRetries: 1,
      });
    } catch {
      return null; // el feedback base ya está; peer refs es best-effort
    }

    const validIds = new Set(context.map((c) => c.submissionId));
    for (const row of generation.output.perSubmission) {
      if (!validIds.has(row.submissionId as Id<"submissions">)) continue;
      const references = row.references.map((r) => ({
        builderName: r.peerBuilderName,
        builderHandle: r.peerBuilderHandle,
        path: r.path,
        startLine: r.startLine,
        note: r.note,
        snippet: r.snippet || undefined,
      }));
      await ctx.runMutation(internal.evaluations.savePeerReferences, {
        submissionId: row.submissionId as Id<"submissions">,
        competitiveNote: row.competitiveNote,
        references,
      });
    }
    return null;
  },
});

// Backfill: reconstruye el feedback (findings/rationale/verdict/limitations) de
// las evaluaciones a partir de reviews `technicalReviews` YA completados. No
// llama a OpenAI — reutiliza el resultado del juez que ya existe. Útil para
// evals escritas por el bridge viejo o que quedaron `generating` por rate-limit.
export const backfillFromReviews = internalMutation({
  args: { challengeId: v.optional(v.id("challenges")) },
  returns: v.object({ patched: v.number(), missing: v.number() }),
  handler: async (ctx, { challengeId }) => {
    const evals = challengeId
      ? await ctx.db
          .query("evaluations")
          .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
            q.eq("challengeId", challengeId),
          )
          .collect()
      : await ctx.db.query("evaluations").collect();

    let patched = 0;
    let missing = 0;
    for (const ev of evals) {
      // El review usa requestId = submissionId.
      const reviews = await ctx.db
        .query("technicalReviews")
        .withIndex("by_request_id", (q) =>
          q.eq("requestId", ev.submissionId),
        )
        .collect();
      const done = reviews
        .filter((r) => r.status === "completed" && r.result)
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];
      if (!done || !done.result) {
        missing++;
        continue;
      }
      const r = done.result as {
        dimensions: Record<string, { score: number; rationale: string }>;
        overallScore: number;
        summary: string;
        verdict: string;
        strengths: string[];
        findings: {
          title: string;
          severity: string;
          dimension: string;
          description: string;
          evidence: {
            path: string;
            startLine: number;
            endLine: number;
            snippet: string;
          }[];
        }[];
        recommendations: { priority: string; title: string; description: string }[];
        limitations: string[];
      };
      const d = r.dimensions;
      await ctx.db.patch("evaluations", ev._id, {
        status: "completed",
        feedbackStatus: "ready",
        fitScore: d.correctness.score,
        qualityScore: d.codeQuality.score,
        architectureScore: d.architecture.score,
        securityScore: d.security.score,
        totalScore: r.overallScore,
        strengths: r.strengths.slice(0, 5),
        issues: r.findings.slice(0, 5).map((f) => f.title),
        rankedReview: r.summary,
        summary: r.summary,
        verdict: r.verdict,
        aiEvidence: `Veredicto: ${r.verdict}.`,
        limitations: r.limitations,
        dimensionNotes: [
          { key: "fit", label: "Fit al reto", score: d.correctness.score, rationale: d.correctness.rationale },
          { key: "quality", label: "Calidad del build", score: d.codeQuality.score, rationale: d.codeQuality.rationale },
          { key: "architecture", label: "Arquitectura", score: d.architecture.score, rationale: d.architecture.rationale },
          { key: "security", label: "Seguridad", score: d.security.score, rationale: d.security.rationale },
          { key: "performance", label: "Rendimiento", score: d.performance.score, rationale: d.performance.rationale },
        ],
        findings: r.findings.map((f) => ({
          title: f.title,
          severity: f.severity,
          dimension: f.dimension,
          description: f.description,
          evidence: f.evidence.map((e) => ({
            path: e.path,
            startLine: e.startLine,
            endLine: e.endLine,
            snippet: e.snippet,
          })),
        })),
        recommendations: r.recommendations.map((rec) => ({
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
        })),
        updatedAt: Date.now(),
      });
      patched++;
    }
    return { patched, missing };
  },
});

export const savePeerReferences = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    competitiveNote: v.optional(v.string()),
    references: v.array(peerReferenceValidator),
  },
  returns: v.null(),
  handler: async (ctx, { submissionId, competitiveNote, references }) => {
    const ev = await ctx.db
      .query("evaluations")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
      .unique();
    if (!ev) return null;
    await ctx.db.patch("evaluations", ev._id, {
      peerReferences: references,
      competitiveNote,
      updatedAt: Date.now(),
    });
    return null;
  },
});
