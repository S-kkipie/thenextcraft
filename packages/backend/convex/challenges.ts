import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

// The Next Ship — challenges domain (retos de negocio de startups).
// list / get devuelven el reto enriquecido con el nombre + sector de la startup
// (un solo db.get por reto) para que la UI no tenga que hacer un fetch aparte.

type ChallengeWithStartup = Doc<"challenges"> & {
  company: string;
  sector: string | null;
};

// Adjunta company/sector leyendo el user (startup) dueño del reto.
async function withStartup(
  ctx: QueryCtx,
  challenge: Doc<"challenges">,
): Promise<ChallengeWithStartup> {
  const startup = await ctx.db.get(challenge.startupId);
  return {
    ...challenge,
    company: startup?.companyName ?? startup?.name ?? "Startup",
    sector: startup?.sector ?? null,
  };
}

// Retos abiertos para el tablero de /challenges. Índice by_status (no table scan).
// .take(100): colección acotada por guideline; el MVP no lista miles de retos.
export const list = query({
  args: {},
  handler: async (ctx): Promise<ChallengeWithStartup[]> => {
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(100);
    return Promise.all(challenges.map((c) => withStartup(ctx, c)));
  },
});

// Detalle de un reto por id (incluye company/sector). null si no existe.
export const get = query({
  args: { id: v.id("challenges") },
  handler: async (ctx, args): Promise<ChallengeWithStartup | null> => {
    const challenge = await ctx.db.get(args.id);
    if (!challenge) return null;
    return withStartup(ctx, challenge);
  },
});

// Retos publicados por una startup concreta (para su panel "Mis retos").
export const listByStartup = query({
  args: { startupId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"challenges">[]> => {
    return ctx.db
      .query("challenges")
      .withIndex("by_startup", (q) => q.eq("startupId", args.startupId))
      .order("desc")
      .take(100);
  },
});

// Publicar un reto. `args` con `v` espeja el zod `challengeInput`
// (features/challenge/schema.ts): mismos campos, misma opcionalidad.
export const create = mutation({
  args: {
    // DEV STUB (identity-bootstrap, NO authz). El cliente pasa su propio userId
    // igual que users.createOrGet; NO es una comprobación de propiedad. La
    // propiedad real vendrá de ctx.auth.getUserIdentity() cuando entre el OAuth.
    startupId: v.id("users"),
    title: v.string(),
    businessProblem: v.string(),
    successCriteria: v.array(v.string()),
    reward: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<Id<"challenges">> => {
    return ctx.db.insert("challenges", { ...args, status: "open" });
  },
});
