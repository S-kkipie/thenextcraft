"use client";

import { useQuery, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Tipos de vista derivados del retorno real de las queries (no se re-declaran a
// mano): se recalculan solos cuando el owner de convex regenera el api.
export type ChallengeListItem = FunctionReturnType<
  typeof api.challenges.list
>[number];
export type ChallengeDetail = NonNullable<
  FunctionReturnType<typeof api.challenges.get>
>;

// Reactive read de todos los retos abiertos. undefined mientras carga.
export function useChallenges() {
  return useQuery(api.challenges.list, {});
}

// Detalle por id. "skip" hasta tener un id. undefined=cargando, null=no existe.
export function useChallenge(id: Id<"challenges"> | undefined) {
  return useQuery(api.challenges.get, id ? { id } : "skip");
}

// Retos de una startup (panel "Mis retos").
export function useChallengesByStartup(startupId: Id<"users"> | undefined) {
  return useQuery(
    api.challenges.listByStartup,
    startupId ? { startupId } : "skip",
  );
}

// Mutation para publicar un reto.
export function useCreateChallenge() {
  return useMutation(api.challenges.create);
}
