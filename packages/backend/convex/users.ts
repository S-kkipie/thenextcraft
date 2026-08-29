import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const roleValidator = v.union(v.literal("builder"), v.literal("startup"));

// DEV AUTH (stand-in). Real GitHub OAuth (Convex Auth + auth.config.ts) is a
// follow-up. Guideline: never take a userId for AUTHORIZATION — this createOrGet
// is identity bootstrap for the demo, not an authz check.
export const createOrGet = mutation({
  args: {
    name: v.string(),
    role: roleValidator,
    githubHandle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.githubHandle) {
      const handle = args.githubHandle;
      const existing = await ctx.db
        .query("users")
        .withIndex("by_github", (q) => q.eq("githubHandle", handle))
        .unique();
      if (existing) return existing._id;
    }
    return await ctx.db.insert("users", {
      name: args.name,
      role: args.role,
      githubHandle: args.githubHandle,
      // engagement layer seeds (grow from real signals)
      level: 1,
      xp: 0,
      streak: 0,
      skills: [],
    });
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getByHandle = query({
  args: { githubHandle: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("users")
      .withIndex("by_github", (q) => q.eq("githubHandle", args.githubHandle))
      .unique(),
});
