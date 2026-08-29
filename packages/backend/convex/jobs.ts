import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, query } from "./_generated/server";

// Convex actions exponen process.env en runtime; lo declaramos para el
// type-checker (el tsconfig de convex no trae los globals de @types/node).
declare const process: { env: Record<string, string | undefined> };

// Actor público de LinkedIn Jobs en Apify. Configurable por si se cambia de
// actor (el input de abajo cubre el schema de bebity/linkedin-jobs-scraper).
const DEFAULT_ACTOR = "bebity~linkedin-jobs-scraper";
const MAX_ITEMS = 25;
const SNIPPET_MAX = 280;

// ── Helpers puros (testeables sin runtime de Convex) ─────────────────────────

// Clave normalizada por empresa: minúsculas, sin espacios extra.
export function normalizeCompany(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export type JobRow = {
  company: string;
  title: string;
  companyName: string;
  location?: string;
  url: string;
  externalId: string;
  source: "linkedin";
  postedAt?: number;
  snippet?: string;
  scrapedAt: number;
  scrapedBy?: Id<"users">;
};

type ApifyItem = Record<string, unknown>;

function str(x: unknown): string | undefined {
  return typeof x === "string" && x.trim() ? x : undefined;
}

function toPostedAt(x: unknown): number | undefined {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const t = Date.parse(x);
    return Number.isNaN(t) ? undefined : t;
  }
  return undefined;
}

// Un item del dataset de Apify → fila de `jobListings`. Tolerante a los
// distintos nombres de campo entre actores. Devuelve null si no hay título o url.
export function toListingRow(
  item: ApifyItem,
  opts: { company: string; scrapedAt: number; scrapedBy?: Id<"users"> },
): JobRow | null {
  const title = str(item.title) ?? str(item.jobTitle);
  const url = str(item.jobUrl) ?? str(item.link) ?? str(item.url);
  if (!title || !url) return null;

  const externalId =
    str(item.id) ?? str(item.jobId) ?? String(item.id ?? item.jobId ?? url);
  const snippetRaw = str(item.descriptionText) ?? str(item.description);

  return {
    company: opts.company,
    title,
    companyName:
      str(item.companyName) ?? str(item.company) ?? opts.company,
    location: str(item.location) ?? str(item.formattedLocation),
    url,
    externalId,
    source: "linkedin",
    postedAt: toPostedAt(item.postedAt ?? item.publishedAt ?? item.postedTime),
    snippet: snippetRaw ? snippetRaw.slice(0, SNIPPET_MAX) : undefined,
    scrapedAt: opts.scrapedAt,
    scrapedBy: opts.scrapedBy,
  };
}

// ── Convex ───────────────────────────────────────────────────────────────────

const jobRow = v.object({
  company: v.string(),
  title: v.string(),
  companyName: v.string(),
  location: v.optional(v.string()),
  url: v.string(),
  externalId: v.string(),
  source: v.literal("linkedin"),
  postedAt: v.optional(v.number()),
  snippet: v.optional(v.string()),
  scrapedAt: v.number(),
  scrapedBy: v.optional(v.id("users")),
});

// Persiste filas dedupeando por (company, externalId): si existe, patch; si no,
// insert. Devuelve cuántas se insertaron (nuevas). Interna: solo la llama la action.
export const saveListings = internalMutation({
  args: { rows: v.array(jobRow) },
  returns: v.number(),
  handler: async (ctx, { rows }) => {
    let inserted = 0;
    for (const row of rows) {
      const existing = await ctx.db
        .query("jobListings")
        .withIndex("by_company_and_externalId", (q) =>
          q.eq("company", row.company).eq("externalId", row.externalId),
        )
        .unique();
      if (existing) {
        await ctx.db.patch("jobListings", existing._id, row);
      } else {
        await ctx.db.insert("jobListings", row);
        inserted += 1;
      }
    }
    return inserted;
  },
});

// Ofertas de una empresa, más recientes primero. Reactiva.
export const byCompany = query({
  args: { company: v.string() },
  handler: async (ctx, { company }) => {
    const key = normalizeCompany(company);
    if (!key) return [];
    return await ctx.db
      .query("jobListings")
      .withIndex("by_company_and_scrapedAt", (q) => q.eq("company", key))
      .order("desc")
      .take(50);
  },
});

// Dispara el actor de Apify para la empresa, mapea y persiste. I/O externo →
// va en un `action` (nunca en query/mutation). Requiere estar autenticado.
export const scrapeCompany = action({
  args: {
    company: v.string(),
    location: v.optional(v.string()),
    maxItems: v.optional(v.number()),
    scrapedBy: v.optional(v.id("users")),
  },
  returns: v.object({ inserted: v.number(), total: v.number() }),
  handler: async (ctx, args): Promise<{ inserted: number; total: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN no configurado en Convex");

    const company = args.company.trim();
    if (company.length < 2) throw new Error("Empresa demasiado corta");

    const actorId = process.env.APIFY_ACTOR_ID ?? DEFAULT_ACTOR;
    const rowsWanted = Math.min(Math.max(args.maxItems ?? MAX_ITEMS, 1), MAX_ITEMS);
    const endpoint = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;

    // Input pensado para bebity/linkedin-jobs-scraper; ajustar si se cambia de actor.
    const input = {
      title: company,
      companyName: [company],
      location: args.location ?? "",
      rows: rowsWanted,
      proxy: { useApifyProxy: true },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`Apify ${res.status}: ${await res.text()}`);
    }
    const items = (await res.json()) as ApifyItem[];

    const scrapedAt = Date.now();
    const key = normalizeCompany(company);
    const rows = (Array.isArray(items) ? items : [])
      .map((it) =>
        toListingRow(it, { company: key, scrapedAt, scrapedBy: args.scrapedBy }),
      )
      .filter((r): r is JobRow => r !== null);

    const inserted: number = await ctx.runMutation(
      internal.jobs.saveListings,
      { rows },
    );
    return { inserted, total: rows.length };
  },
});
