import { useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Wrappers finos sobre los hooks reactivos de Convex (AGENTS regla 4).
// El `api` generado es la única fuente; nada de fetch/TanStack/REST.

/** Mutación de ship → devuelve el Id de la submission creada. */
export function useShip() {
  return useMutation(api.submissions.ship);
}

/** Una submission + su reto (vista de resultado). `null` ⇒ skip. */
export function useSubmission(id: Id<"submissions"> | null) {
  return useQuery(api.submissions.get, id ? { id } : "skip");
}

/** Historial de ships de un builder. `null` ⇒ skip. */
export function useBuilderSubmissions(builderId: Id<"users"> | null) {
  return useQuery(
    api.submissions.byBuilder,
    builderId ? { builderId } : "skip",
  );
}

/** Ships de un reto (ranking / lista de la startup). `null` ⇒ skip. */
export function useChallengeSubmissions(challengeId: Id<"challenges"> | null) {
  return useQuery(
    api.submissions.byChallenge,
    challengeId ? { challengeId } : "skip",
  );
}
