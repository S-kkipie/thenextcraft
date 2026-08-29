"use client";

import { useQuery, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

// Forma de la tarjeta derivada del retorno real de la query (no un mirror a
// mano): se recalcula sola cuando el owner de convex regenera el api.
export type Opportunity = FunctionReturnType<
  typeof api.opportunities.byBuilder
>[number];

// Oportunidades recibidas por el builder. "skip" mientras no hay sesión;
// undefined mientras carga (AGENTS §4).
export function useOpportunities(builderId: Id<"users"> | null) {
  return useQuery(
    api.opportunities.byBuilder,
    builderId ? { builderId } : "skip",
  );
}

// Mutation: aceptar/descartar una oportunidad.
export function useRespondToOpportunity() {
  return useMutation(api.opportunities.respond);
}
