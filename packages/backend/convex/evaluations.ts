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
        summary: ev.rankedReview ?? "",
        score: ev.totalScore ?? null,
        findings: ev.findings.slice(0, 6).map((f) => ({
          title: f.title,
          dimension: f.dimension,
          severity: f.severity,
          path: f.evidence[0]?.path ?? "",
          startLine: f.evidence[0]?.startLine ?? 0,
        })),
      });
    }
    return out;
  },
});

const peerOutputSchema = z.object({
  perSubmission: z
    .array(
      z.object({
        submissionId: z.string(),
        references: z
          .array(
            z.object({
              peerBuilderHandle: z.string().nullable(),
              peerBuilderName: z.string(),
              path: z.string(),
              startLine: z.number().int().min(0),
              note: z
                .string()
                .min(10)
                .max(400)
                .describe(
                  "Qué hizo el peer y cómo se compara con ESTA submission. Español.",
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
          "Comparas soluciones al MISMO reto técnico. Para cada submission, cita 1-3 peers cuyo enfoque en un archivo:línea concreto contrasta con el suyo (mejor, peor o alternativo). Sé específico y ecuánime, en español. Nunca cites una submission a sí misma. Usa solo los datos provistos; no inventes archivos ni líneas.",
        prompt: JSON.stringify({
          task: "Genera peer references comparativas por submission.",
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
      }));
      await ctx.runMutation(internal.evaluations.savePeerReferences, {
        submissionId: row.submissionId as Id<"submissions">,
        references,
      });
    }
    return null;
  },
});

export const savePeerReferences = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    references: v.array(peerReferenceValidator),
  },
  returns: v.null(),
  handler: async (ctx, { submissionId, references }) => {
    const ev = await ctx.db
      .query("evaluations")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
      .unique();
    if (!ev) return null;
    await ctx.db.patch("evaluations", ev._id, {
      peerReferences: references,
      updatedAt: Date.now(),
    });
    return null;
  },
});
