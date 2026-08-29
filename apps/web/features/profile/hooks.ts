import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";

/** Resumen público del passport por handle de GitHub (reactivo). */
export function useProfileSummary(handle: string | undefined) {
  return useQuery(
    api.badges.profileSummary,
    handle ? { handle } : "skip",
  );
}
