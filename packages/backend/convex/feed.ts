import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

// The Next Ship — feed de comunidad (actividad reciente cross-usuario).
// PRODUCT TRUTH: la actividad se deriva de señales REALES — ships (submissions)
// y badges ganadas. La plataforma nunca corre código; un "ship" es siempre un link.
//
// ESCALADO (MVP): no existe un índice único que ordene submissions + badges juntas,
// así que tomamos las `limit` más recientes de CADA tabla por el índice incorporado
// by_creation_time (`.order("desc")` → index-friendly, sin table scan sobre filtros),
// las mezclamos en memoria y recortamos a `limit`. Suficiente para el MVP; si la
// comunidad crece, materializar un feed denormalizado con su propio índice.

type FeedUser = { name: string; handle: string; initials: string };

type FeedItem = {
  id: string;
  type: "ship" | "badge";
  user: FeedUser;
  text: string;
  meta?: string;
  ts: number;
};

// Iniciales (máx 2, uppercase) a partir del nombre — misma regla que el resto de la app.
function initialsOf(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  const chars =
    words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return chars.toUpperCase();
}

function toFeedUser(user: Doc<"users"> | null): FeedUser {
  const name = user?.name ?? "Alguien";
  return { name, handle: user?.githubHandle ?? "", initials: initialsOf(name) };
}

// Etiqueta legible de cada tipo de badge (schema.badges.type) para el texto del feed.
const BADGE_LABEL: Record<string, string> = {
  "first-ship": "First ship",
  shipped: "Shipped",
  "startup-approved": "Startup-approved",
  "top-10": "Top 10%",
  "authorship-verified": "Autoría verificada",
};

/**
 * `recent` — últimos eventos de la comunidad (ships + badges) mezclados y
 * ordenados por _creationTime desc. `limit` acota cada lectura y el resultado.
 */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<FeedItem[]> => {
    const limit = args.limit ?? 30;

    // Ships → "{builder} shipeó para {startup}" (join builder + challenge + startup).
    const submissions = await ctx.db
      .query("submissions")
      .order("desc")
      .take(limit);
    const ships: FeedItem[] = await Promise.all(
      submissions.map(async (s) => {
        const builder = await ctx.db.get(s.builderId);
        const challenge = await ctx.db.get(s.challengeId);
        const startup = challenge ? await ctx.db.get(challenge.startupId) : null;
        const company =
          startup?.companyName ?? startup?.name ?? "una startup";
        const user = toFeedUser(builder);
        return {
          id: s._id,
          type: "ship" as const,
          user,
          text: `${user.name} shipeó para ${company}`,
          meta: challenge?.title,
          ts: s._creationTime,
        };
      }),
    );

    // Badges → "{user} ganó {badge}" (join user dueño de la insignia).
    const badgeDocs = await ctx.db.query("badges").order("desc").take(limit);
    const badges: FeedItem[] = await Promise.all(
      badgeDocs.map(async (b) => {
        const owner = await ctx.db.get(b.userId);
        const user = toFeedUser(owner);
        const label = BADGE_LABEL[b.type] ?? b.type;
        return {
          id: b._id,
          type: "badge" as const,
          user,
          text: `${user.name} ganó ${label}`,
          meta: b.type, // el front lo mapea a un chip <CraftBadge/>
          ts: b._creationTime,
        };
      }),
    );

    return [...ships, ...badges].sort((a, b) => b.ts - a.ts).slice(0, limit);
  },
});
