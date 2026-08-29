import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

/**
 * Todos los ships del builder actual (enriquecidos); el Skill Map deriva los
 * niveles de su `tech`. `skip` cuando no hay sesión.
 */
export function useBuilderShips(builderId: Id<"users"> | null) {
  return useQuery(
    api.views.builderSubmissions,
    builderId ? { builderId } : "skip",
  );
}
