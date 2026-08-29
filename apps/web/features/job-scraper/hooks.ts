"use client";

import { useAction, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";

// Tipo de vista derivado del retorno real de la query (single source).
export type CompanyJob = FunctionReturnType<typeof api.jobs.byCompany>[number];

// Dispara el scrape (action → Apify → Convex). Devuelve { inserted, total }.
export function useScrapeCompany() {
  return useAction(api.jobs.scrapeCompany);
}

// Ofertas persistidas de una empresa. Reactivo: se actualiza solo tras el scrape.
// "skip" hasta tener una empresa. undefined = cargando.
export function useCompanyJobs(company: string | undefined) {
  return useQuery(
    api.jobs.byCompany,
    company && company.trim().length >= 2 ? { company } : "skip",
  );
}
