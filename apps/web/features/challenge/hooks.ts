"use client";

import { useQuery, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Tipos de vista derivados del retorno real de las queries (single source).
export type ChallengeListItem = FunctionReturnType<
  typeof api.views.challengesOpen
>[number];
export type ChallengeDetail = NonNullable<
  FunctionReturnType<typeof api.views.challengeDetail>
>;

// Retos abiertos (enriquecidos con la startup). undefined mientras carga.
export function useChallenges() {
  return useQuery(api.views.challengesOpen, {});
}

// Detalle por id. "skip" hasta tener un id. undefined=cargando, null=no existe.
export function useChallenge(id: Id<"challenges"> | undefined) {
  return useQuery(api.views.challengeDetail, id ? { challengeId: id } : "skip");
}

// Crear un reto (queda en "draft" hasta publicar).
export function useCreateChallenge() {
  return useMutation(api.challenges.create);
}

// Publicar un reto draft → "open".
export function usePublishChallenge() {
  return useMutation(api.challenges.publish);
}
