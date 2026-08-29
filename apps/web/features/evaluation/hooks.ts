"use client";

import { useQuery } from "convex/react";
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
