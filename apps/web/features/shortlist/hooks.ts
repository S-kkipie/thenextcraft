import { useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Wrappers finos sobre los queries/mutation reactivos de convex/shortlist.ts.
export function useShortlistRanked(challengeId: Id<"challenges">) {
  return useQuery(api.shortlist.ranked, { challengeId });
}

export function useShortlistSummary(challengeId: Id<"challenges">) {
  return useQuery(api.shortlist.summary, { challengeId });
}

export function useCloseChallenge() {
  return useMutation(api.shortlist.close);
}
