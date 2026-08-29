import { query } from "./_generated/server";
import { v } from "convex/values";

// Community feed: ships + badges recientes. MVP: merge de dos tablas (scan acotado por take).
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const n = limit ?? 30;
    const subs = await ctx.db.query("submissions").order("desc").take(n);
    const badges = await ctx.db.query("badges").order("desc").take(n);

    const items: {
      id: string;
      type: "ship" | "badge";
      user: { name: string; handle: string | null; initials: string };
      text: string;
      meta: string | null;
      ts: number;
      link: string | null;
    }[] = [];

    for (const s of subs) {
      const u = await ctx.db.get("users", s.builderId);
      const ch = await ctx.db.get("challenges", s.challengeId);
      const st = ch ? await ctx.db.get("users", ch.startupId) : null;
      items.push({
        id: s._id,
        type: "ship",
        user: {
          name: u?.name ?? "?",
          handle: u?.githubHandle ?? null,
          initials: (u?.name?.[0] ?? "?").toUpperCase(),
        },
        text: `shipeó para ${st?.companyName ?? st?.name ?? "una startup"}`,
        meta: ch?.title ?? null,
        ts: s.submittedAt,
        link: `/submissions/${s._id}`,
      });
    }
    for (const b of badges) {
      const u = await ctx.db.get("users", b.userId);
      items.push({
        id: b._id,
        type: "badge",
        user: {
          name: u?.name ?? "?",
          handle: u?.githubHandle ?? null,
          initials: (u?.name?.[0] ?? "?").toUpperCase(),
        },
        text: `ganó la badge ${b.type}`,
        meta: null,
        ts: b.awardedAt,
        link: u?.githubHandle ? `/u/${u.githubHandle}` : null,
      });
    }
    items.sort((a, b) => b.ts - a.ts);
    return items.slice(0, n);
  },
});
