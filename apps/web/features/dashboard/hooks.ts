import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Thin Convex wrappers for the builder dashboard (AGENTS §4).

/** Every submission by the current builder (joined to its reto). `skip` when logged out. */
export function useBuilderSubmissions(userId: Id<"users"> | null) {
  return useQuery(
    api.views.builderSubmissions,
    userId ? { builderId: userId } : "skip",
  );
}

/** Retos abiertos para recomendar (enriquecidos). */
export function useOpenChallenges() {
  return useQuery(api.views.challengesOpen, {});
}
