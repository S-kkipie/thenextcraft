import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { fail, requireChallenge, requireUser } from "./domain";
import { badgeTypeValidator, schema } from "./schema";

export const listByUser = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("badges")),
  handler: async (ctx, args) =>
    await ctx.db
      .query("badges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts),
});

export const award = internalMutation({
  args: {
    userId: v.id("users"),
    type: badgeTypeValidator,
    challengeId: v.id("challenges"),
  },
  returns: v.id("badges"),
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    await requireChallenge(ctx, args.challengeId);
    const existing = await ctx.db
      .query("badges")
      .withIndex("by_userId_and_type_and_challengeId", (q) =>
        q
          .eq("userId", args.userId)
          .eq("type", args.type)
          .eq("challengeId", args.challengeId),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("badges", {
      ...args,
      awardedAt: Date.now(),
    });
  },
});

export const revoke = internalMutation({
  args: {
    userId: v.id("users"),
    type: badgeTypeValidator,
    challengeId: v.id("challenges"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const badge = await ctx.db
      .query("badges")
      .withIndex("by_userId_and_type_and_challengeId", (q) =>
        q
          .eq("userId", args.userId)
          .eq("type", args.type)
          .eq("challengeId", args.challengeId),
      )
      .unique();
    if (!badge) return false;
    if (badge.userId !== args.userId) {
      fail("BADGE_OWNER_MISMATCH", "Badge owner mismatch");
    }
    await ctx.db.delete("badges", badge._id);
    return true;
  },
});
