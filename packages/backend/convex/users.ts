import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  cleanGithubHandle,
  cleanHttpUrl,
  cleanOptionalText,
  cleanRequiredText,
  fail,
  requireUser,
} from "./domain";
import { schema, userRoleValidator } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
  args: {
    name: v.string(),
    role: userRoleValidator,
    githubHandle: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const name = cleanRequiredText(args.name, "name", 2, 80);
    const githubHandle = cleanGithubHandle(args.githubHandle);
    const now = Date.now();

    if (githubHandle) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_githubHandle", (q) =>
          q.eq("githubHandle", githubHandle),
        )
        .unique();
      if (existing) {
        if (existing.role !== args.role) {
          fail(
            "ROLE_CONFLICT",
            "This GitHub handle already belongs to a different user role",
          );
        }
        await ctx.db.patch("users", existing._id, { name, updatedAt: now });
        return existing._id;
      }
    }

    return await ctx.db.insert("users", {
      name,
      role: args.role,
      githubHandle: githubHandle ?? undefined,
      level: 1,
      xp: 0,
      streak: 0,
      skills: [],
      updatedAt: now,
    });
  },
});

export const get = query({
  args: { id: v.id("users") },
  returns: v.union(schema.doc("users"), v.null()),
  handler: async (ctx, args) => await ctx.db.get("users", args.id),
});

export const getByHandle = query({
  args: { githubHandle: v.string() },
  returns: v.union(schema.doc("users"), v.null()),
  handler: async (ctx, args) => {
    const githubHandle = cleanGithubHandle(args.githubHandle);
    if (!githubHandle) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_githubHandle", (q) =>
        q.eq("githubHandle", githubHandle),
      )
      .unique();
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    role: v.optional(userRoleValidator),
  },
  returns: paginationResultValidator(schema.doc("users")),
  handler: async (ctx, args) => {
    if (args.role) {
      const role = args.role;
      return await ctx.db
        .query("users")
        .withIndex("by_role_and_updatedAt", (q) => q.eq("role", role))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("users")
      .withIndex("by_updatedAt")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    githubHandle: v.optional(v.union(v.string(), v.null())),
    avatarUrl: v.optional(v.union(v.string(), v.null())),
    bio: v.optional(v.union(v.string(), v.null())),
  },
  returns: schema.doc("users"),
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);

    const patch: {
      name?: string;
      githubHandle?: string;
      avatarUrl?: string;
      bio?: string;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      patch.name = cleanRequiredText(args.name, "name", 2, 80);
    }
    if (args.githubHandle !== undefined) {
      const githubHandle = cleanGithubHandle(args.githubHandle);
      if (githubHandle) {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_githubHandle", (q) =>
            q.eq("githubHandle", githubHandle),
          )
          .unique();
        if (existing && existing._id !== args.userId) {
          fail("GITHUB_HANDLE_TAKEN", "This GitHub handle is already in use");
        }
      }
      patch.githubHandle = githubHandle ?? undefined;
    }
    if (args.avatarUrl !== undefined) {
      patch.avatarUrl = cleanHttpUrl(args.avatarUrl, "avatarUrl") ?? undefined;
    }
    if (args.bio !== undefined) {
      patch.bio = cleanOptionalText(args.bio, "bio", 1_000) ?? undefined;
    }

    await ctx.db.patch("users", args.userId, patch);
    return await requireUser(ctx, args.userId);
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);

    const [challenge, submission, badge] = await Promise.all([
      ctx.db
        .query("challenges")
        .withIndex("by_startupId_and_updatedAt", (q) =>
          q.eq("startupId", args.userId),
        )
        .first(),
      ctx.db
        .query("submissions")
        .withIndex("by_builderId_and_updatedAt", (q) =>
          q.eq("builderId", args.userId),
        )
        .first(),
      ctx.db
        .query("badges")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first(),
    ]);

    if (challenge || submission || badge) {
      fail(
        "USER_HAS_ACTIVITY",
        "Users with challenges, submissions, or badges cannot be deleted",
      );
    }

    await ctx.db.delete("users", args.userId);
    return null;
  },
});

// The signed-in user (Convex Auth). null when logged out.
export const viewer = query({
  args: {},
  returns: v.union(schema.doc("users"), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get("users", userId);
  },
});

// Onboarding: pick builder/startup (identity from the session, never the client).
export const setRole = mutation({
  args: {
    role: userRoleValidator,
    companyName: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    // Startups may attach their LinkedIn page; validated/normalized here.
    const linkedinUrl =
      args.role === "startup"
        ? (cleanHttpUrl(args.linkedinUrl, "linkedinUrl") ?? undefined)
        : undefined;
    await ctx.db.patch("users", userId, {
      role: args.role,
      companyName: args.role === "startup" ? args.companyName : undefined,
      linkedinUrl,
      onboarded: true,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Public company context for the submission copilot: safe fields only (no email).
// Given a challenge's `startupId`, returns who posted it so the agent can scrape
// and reason about the company. null when the id isn't a startup / doesn't exist.
export const publicCompany = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      name: v.string(),
      companyName: v.optional(v.string()),
      linkedinUrl: v.optional(v.string()),
      sector: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.userId);
    if (!user) return null;
    return {
      name: user.name,
      companyName: user.companyName,
      linkedinUrl: user.linkedinUrl,
      sector: user.sector,
    };
  },
});
