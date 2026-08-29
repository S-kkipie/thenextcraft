import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Submissions = el "ship" de un builder. Regla de producto: la plataforma NUNCA
// corre código — el deliverable es siempre un LINK (repo público + demo opcional).
// La autoría se defiende con viva humana (video/audio o entrevista), no ejecutando.

// byChallenge — todos los ships de un reto (ranking / lista de la startup).
export const byChallenge = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) =>
    ctx.db
      .query("submissions")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect(),
});

// byBuilder — todos los ships de un builder (su historial / passport).
export const byBuilder = query({
  args: { builderId: v.id("users") },
  handler: async (ctx, args) =>
    ctx.db
      .query("submissions")
      .withIndex("by_builder", (q) => q.eq("builderId", args.builderId))
      .collect(),
});

// get — una submission + su reto (para la vista de resultado /submissions/[id]).
export const get = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.id);
    if (!submission) return null;
    const challenge = await ctx.db.get(submission.challengeId);
    return { submission, challenge };
  },
});

// ship — registrar el link del trabajo. Args espejan `shipInput` (zod) del front:
// repoUrl requerido; demoUrl/description/tech opcionales.
//
// DEV AUTH (stand-in): `builderId` llega como argumento, igual que
// `users.createOrGet`. Es bootstrap de identidad para el demo, NO un check de
// autorización. El follow-up (GitHub OAuth vía ctx.auth.getUserIdentity) sacará
// el builder de la identidad autenticada en vez de confiar en el cliente.
export const ship = mutation({
  args: {
    challengeId: v.id("challenges"),
    builderId: v.id("users"),
    repoUrl: v.string(),
    demoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("submissions", {
      ...args,
      status: "submitted",
      createdAt: Date.now(),
    }),
});
