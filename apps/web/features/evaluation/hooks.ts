"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Evaluación del AI Judge para una submission (reactiva). Devuelve
// `{ evaluation, rank, cohort }` o `null` si no existe fila todavía.
export function useEvaluation(submissionId: Id<"submissions"> | undefined) {
  return useQuery(
    api.views.evaluationForSubmission,
    submissionId ? { submissionId } : "skip",
  );
}

// La submission + su reto. `api.views.submissionDetail` devuelve
// `{ submission, challenge, company }` o `null`.
export function useSubmission(submissionId: Id<"submissions"> | undefined) {
  return useQuery(
    api.views.submissionDetail,
    submissionId ? { submissionId } : "skip",
  );
}

// El estado está intencionalmente acotado: la UI de la submission no necesita
// exponer la actividad interna ni los metadatos del worker.
export function useJudgeStatus(submissionId: Id<"submissions"> | undefined) {
  return useQuery(
    api.technicalJudge.statusForSubmission,
    submissionId ? { submissionId } : "skip",
  );
}

// Encola el pipeline estático del juez.
export function useRunJudge() {
  return useAction(api.evaluations.evaluate);
}
