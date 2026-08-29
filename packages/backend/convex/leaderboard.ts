import { query } from "./_generated/server";
import { v } from "convex/values";

// Ranking de builders. Derivado de señales reales (xp/level crecen de ships,
// aprobaciones y AI Judge). Read-only, indexado por rol.
export const top = query({
  args: { skill: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { skill, limit }) => {
    let builders = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "builder"))
      .collect();

    if (skill) {
      builders = builders.filter((u) => (u.skills ?? []).includes(skill));
    }
    builders.sort(
      (a, b) => (b.xp ?? 0) - (a.xp ?? 0) || (b.level ?? 0) - (a.level ?? 0),
    );

    return builders.slice(0, limit ?? 50).map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      name: u.name,
      handle: u.githubHandle ?? null,
      initials: (u.name?.[0] ?? "?").toUpperCase(),
      level: u.level ?? 1,
      xp: u.xp ?? 0,
    }));
  },
});
