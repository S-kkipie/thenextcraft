import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

/**
 * Insignias reales del usuario actual (reactivo, AGENTS §4). `skip` cuando no
 * hay sesión. `api.badges.listByUser` es paginado → devolvemos la página.
 */
export function useUserBadges(userId: Id<"users"> | null) {
  const res = useQuery(
    api.badges.listByUser,
    userId ? { userId, paginationOpts: { numItems: 50, cursor: null } } : "skip",
  );
  return res ? res.page : undefined;
}
