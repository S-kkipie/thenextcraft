import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("open"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("challenges")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("challenges").collect();
  },
});

export const create = mutation({
  args: {
    startupId: v.id("users"),
    title: v.string(),
    businessProblem: v.string(),
    successCriteria: v.array(v.string()),
    reward: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("challenges", { ...args, status: "open" });
  },
});
