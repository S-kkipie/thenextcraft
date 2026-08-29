import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

/**
 * Insignias reales del usuario actual (reactivo, AGENTS §4). `skip` cuando no
 * hay sesión — la capa de engagement solo existe sobre un usuario real.
 */
export function useUserBadges(userId: Id<"users"> | null) {
  return useQuery(api.badges.byUser, userId ? { userId } : "skip");
}
