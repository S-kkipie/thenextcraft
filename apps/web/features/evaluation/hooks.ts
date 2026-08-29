"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Evaluación del AI Judge para una submission (reactiva).
export function useEvaluation(submissionId: Id<"submissions"> | undefined) {
  return useQuery(
    api.evaluations.getBySubmission,
    submissionId ? { submissionId } : "skip",
  );
}

// La submission + su reto (dominio ajeno; solo lectura). `api.submissions.get`
// devuelve `{ submission, challenge }` o `null` si no existe.
export function useSubmission(submissionId: Id<"submissions"> | undefined) {
  const submission = useQuery(
    api.submissions.get,
    submissionId ? { submissionId } : "skip",
  );
  const challenge = useQuery(
    api.challenges.get,
    submission ? { challengeId: submission.challengeId } : "skip",
  );

  if (submission === undefined || (submission && challenge === undefined)) {
    return undefined;
  }
  if (submission === null) return null;
  return { submission, challenge: challenge ?? null };
}

// Cohorte del reto → para derivar N en el rank #n/N.
export function useCohort(challengeId: Id<"challenges"> | undefined) {
  const result = useQuery(
    api.submissions.listByChallenge,
    challengeId
      ? { challengeId, paginationOpts: { numItems: 100, cursor: null } }
      : "skip",
  );
  return result?.page;
}

export function useSetAuthorship() {
  return useMutation(api.evaluations.setAuthorship);
}

// Dispara el pipeline estático del juez (mock por ahora).
export function useRunJudge() {
  return useAction(api.evaluations.evaluate);
}
