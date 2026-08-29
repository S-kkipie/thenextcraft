import { useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Wrappers finos sobre convex/shortlist.ts + el CRUD de challenges.
export function useShortlistRanked(challengeId: Id<"challenges">) {
  return useQuery(api.shortlist.ranked, { challengeId });
}

export function useShortlistSummary(challengeId: Id<"challenges">) {
  return useQuery(api.shortlist.summary, { challengeId });
}

// Cerrar el reto (dominio canónico de challenges; requiere el startup dueño).
export function useCloseChallenge() {
  return useMutation(api.challenges.close);
}
