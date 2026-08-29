import { useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Wrappers finos sobre los hooks reactivos de Convex (AGENTS regla 4).
// El `api` generado es la única fuente; nada de fetch/TanStack/REST.

/** Mutación de ship → devuelve el Id de la submission creada. */
export function useShip() {
  return useMutation(api.submissions.submit);
}

/** Una submission + su reto (vista de resultado). `null` ⇒ skip. */
export function useSubmission(id: Id<"submissions"> | null) {
  return useQuery(api.submissions.get, id ? { submissionId: id } : "skip");
}

/** Historial de ships de un builder. `null` ⇒ skip. */
export function useBuilderSubmissions(builderId: Id<"users"> | null) {
  const result = useQuery(
    api.submissions.listByBuilder,
    builderId
      ? { builderId, paginationOpts: { numItems: 100, cursor: null } }
      : "skip",
  );
  return result?.page;
}

/** Ships de un reto (ranking / lista de la startup). `null` ⇒ skip. */
export function useChallengeSubmissions(challengeId: Id<"challenges"> | null) {
  const result = useQuery(
    api.submissions.listByChallenge,
    challengeId
      ? { challengeId, paginationOpts: { numItems: 100, cursor: null } }
      : "skip",
  );
  return result?.page;
}
