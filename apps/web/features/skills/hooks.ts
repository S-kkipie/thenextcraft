import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

/**
 * Wrapper fino sobre Convex (AGENTS §4). Todos los ships del builder actual;
 * el Skill Map deriva los niveles de su `tech`. `skip` cuando no hay sesión.
 */
export function useBuilderShips(builderId: Id<"users"> | null) {
  return useQuery(
    api.submissions.byBuilder,
    builderId ? { builderId } : "skip",
  );
}
