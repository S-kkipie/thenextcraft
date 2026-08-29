import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

// The Next Ship — dominio "opportunities" ("Te descubrieron").
// Una startup contacta a un builder por su proof-of-work: es el paso que cierra
// el loop hacia la contratación. La plataforma NUNCA corre código — una
// oportunidad es una señal humana (la startup vio tu trabajo) + un puesto.

// Iniciales (máx 2, mayúsculas) del nombre de la startup, para el avatar del kit.
function initialsOf(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  const chars =
    words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return chars.toUpperCase();
}

// Forma que consume la tarjeta: la startup y el reto ya resueltos (un db.get por
// cada uno) para que la UI no tenga que hacer fetches aparte.
type OpportunityCardData = {
  _id: Id<"opportunities">;
  startupName: string;
  initials: string;
  role: string;
  matchPct: number | null;
  reason: string | null;
  challengeTitle: string | null;
  status: Doc<"opportunities">["status"];
};

// byBuilder — oportunidades recibidas por un builder, enriquecidas con el nombre
// de la startup (companyName ?? name) y el título del reto relacionado. Índice
// by_builder (no table scan); newest-first; colección acotada (guideline).
//
// DEV AUTH (stand-in): `builderId` llega como argumento, igual que en
// submissions/challenges. Es bootstrap de identidad para el demo, NO authz; el
// follow-up sacará el builder de ctx.auth.getUserIdentity() (GitHub OAuth).
export const byBuilder = query({
  args: { builderId: v.id("users") },
  handler: async (ctx, args): Promise<OpportunityCardData[]> => {
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_builder", (q) => q.eq("builderId", args.builderId))
      .order("desc")
      .take(50);
    return Promise.all(
      opportunities.map(async (o) => {
        const startup = await ctx.db.get(o.startupId);
        const startupName = startup?.companyName ?? startup?.name ?? "Startup";
        const challenge = o.challengeId ? await ctx.db.get(o.challengeId) : null;
        return {
          _id: o._id,
          startupName,
          initials: initialsOf(startupName),
          role: o.role,
          matchPct: o.matchPct ?? null,
          reason: o.reason ?? null,
          challengeTitle: challenge?.title ?? null,
          status: o.status,
        };
      }),
    );
  },
});

// respond — el builder acepta o descarta una oportunidad. Los `args` con `v`
// espejan el enum zod `opportunityResponse` (features/opportunities/schema.ts):
// mismos literales, misma opcionalidad.
export const respond = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    status: v.union(v.literal("accepted"), v.literal("declined")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.opportunityId, { status: args.status });
  },
});
