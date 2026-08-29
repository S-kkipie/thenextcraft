"use client";

import { useState } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Doc } from "@thenextcraft/backend/dataModel";

import { useCompanyJobs, useScrapeCompany } from "@/features/job-scraper/hooks";

/**
 * Registers the submission copilot's context + tools. Renders nothing — it only
 * feeds the agent (via `useCopilotReadable`) the vacancy (challenge) and the
 * company that posted it, and exposes `scrapeCompany` so the agent can pull that
 * company's real LinkedIn job listings on demand. Must live under <CopilotKit>.
 */
export function ShipCopilot({
  challenge,
}: {
  challenge: Doc<"challenges"> | null;
}) {
  // Who posted the challenge (safe fields only — no email reaches the LLM).
  const company = useQuery(
    api.users.publicCompany,
    challenge?.startupId ? { userId: challenge.startupId } : "skip",
  );

  // The company whose jobs we currently show: the challenge's company by
  // default, or whatever the agent last scraped (when identity was missing).
  const [activeCompany, setActiveCompany] = useState<string | undefined>();
  const effectiveCompany =
    activeCompany ?? company?.companyName?.trim() ?? undefined;
  const jobs = useCompanyJobs(effectiveCompany);
  const scrape = useScrapeCompany();

  // The vacancy the builder is shipping against.
  useCopilotReadable(
    {
      description: "El reto/vacante que el builder está resolviendo ahora.",
      value: challenge
        ? {
            title: challenge.title,
            businessProblem: challenge.businessProblem,
            successCriteria: challenge.successCriteria,
            tech: challenge.tech ?? [],
            reward: challenge.reward ?? null,
            deadline: challenge.deadline ?? null,
          }
        : "Cargando el reto…",
    },
    [challenge],
  );

  // The company that posted it. Missing identity is the cue to ask the user.
  useCopilotReadable(
    {
      description:
        "La empresa que publicó este reto. Si companyName y linkedinUrl están vacíos, PREGUNTA al usuario de qué empresa se trata antes de usar herramientas.",
      value: company
        ? {
            companyName: company.companyName ?? null,
            linkedinUrl: company.linkedinUrl ?? null,
            sector: company.sector ?? null,
          }
        : { companyName: null, linkedinUrl: null, sector: null },
    },
    [company],
  );

  // Real LinkedIn listings already scraped for the company = live context.
  useCopilotReadable(
    {
      description:
        "Ofertas de LinkedIn ya scrapeadas de la empresa (contexto: qué roles y stack busca). Lista vacía = aún no se ha scrapeado.",
      value: (jobs ?? []).map((j) => ({
        title: j.title,
        location: j.location ?? null,
        snippet: j.snippet ?? null,
        url: j.url,
      })),
    },
    [jobs],
  );

  // On-demand tool: pull the company's LinkedIn jobs to build context.
  useCopilotAction(
    {
      name: "scrapeCompany",
      description:
        "Scrapea ofertas de LinkedIn de una empresa para entender su contexto (roles, stack, seniority). Úsalo cuando te falte contexto de la empresa. Si no sabes qué empresa es, pregúntale primero al usuario cuál es.",
      parameters: [
        {
          name: "company",
          type: "string",
          description:
            "Nombre de la empresa a scrapear (el companyName del reto, o el que indique el usuario).",
          required: true,
        },
        {
          name: "location",
          type: "string",
          description: "Ubicación opcional para acotar las ofertas.",
          required: false,
        },
      ],
      handler: async ({
        company: companyArg,
        location,
      }: {
        company: string;
        location?: string;
      }) => {
        const res = await scrape({
          company: companyArg,
          location: location || undefined,
        });
        setActiveCompany(companyArg);
        return `Scrapeadas ${res.total} ofertas (${res.inserted} nuevas) de "${companyArg}". Ya tienes ese contexto disponible.`;
      },
    },
    [scrape],
  );

  return null;
}
