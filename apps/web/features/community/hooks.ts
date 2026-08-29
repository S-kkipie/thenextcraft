"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";

// Tipo de vista derivado del retorno REAL de la query (no se re-declara a mano;
// se recalcula solo cuando el owner de convex regenera el api). AGENTS §1/§2.
export type FeedItem = FunctionReturnType<typeof api.feed.recent>[number];

/** Read reactivo del feed de comunidad (ships + badges). undefined mientras carga. */
export function useFeed(limit?: number) {
  return useQuery(api.feed.recent, limit === undefined ? {} : { limit });
}
