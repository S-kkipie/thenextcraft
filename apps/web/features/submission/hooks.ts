import { useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Wrappers finos sobre los hooks reactivos de Convex (AGENTS regla 4).

/** Mutación de ship (submit) → devuelve el Id de la submission creada. */
export function useShip() {
  return useMutation(api.submissions.submit);
}

/** Una submission + su reto (vista de resultado). `null` ⇒ skip. */
export function useSubmission(id: Id<"submissions"> | null) {
  return useQuery(api.views.submissionDetail, id ? { submissionId: id } : "skip");
}

/** Historial de ships de un builder (enriquecido). `null` ⇒ skip. */
export function useBuilderSubmissions(builderId: Id<"users"> | null) {
  return useQuery(
    api.views.builderSubmissions,
    builderId ? { builderId } : "skip",
  );
}
