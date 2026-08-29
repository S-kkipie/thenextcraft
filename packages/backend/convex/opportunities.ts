import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// "Te descubrieron": una startup contacta a un builder. Sobre su schema.
export const byBuilder = query({
  args: { builderId: v.id("users") },
  handler: async (ctx, { builderId }) => {
    const opps = await ctx.db
      .query("opportunities")
      .withIndex("by_builderId", (q) => q.eq("builderId", builderId))
      .order("desc")
      .take(50);
    const out = [];
    for (const o of opps) {
      const st = await ctx.db.get("users", o.startupId);
      const ch = o.challengeId
        ? await ctx.db.get("challenges", o.challengeId)
        : null;
      const startupName = st?.companyName ?? st?.name ?? "Startup";
      out.push({
        _id: o._id,
        startupName,
        initials: (startupName[0] ?? "?").toUpperCase(),
        role: o.role,
        matchPct: o.matchPct ?? null,
        reason: o.reason ?? null,
        challengeTitle: ch?.title ?? null,
        status: o.status,
      });
    }
    return out;
  },
});

export const respond = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    status: v.union(v.literal("accepted"), v.literal("declined")),
  },
  returns: v.null(),
  handler: async (ctx, { opportunityId, status }) => {
    await ctx.db.patch("opportunities", opportunityId, { status });
    return null;
  },
});
