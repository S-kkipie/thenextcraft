import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  cleanOptionalText,
  cleanRequiredText,
  cleanSuccessCriteria,
  ensureFutureDeadline,
  fail,
  requireOwnedChallenge,
  requireRole,
} from "./domain";
import { challengeStatusValidator, schema } from "./schema";

export const get = query({
  args: { challengeId: v.id("challenges") },
  returns: v.union(schema.doc("challenges"), v.null()),
  handler: async (ctx, args) =>
    await ctx.db.get("challenges", args.challengeId),
});

// The Next Ship — challenges domain (retos de negocio de startups).
// list / get devuelven el reto enriquecido con el nombre + sector de la startup
// (un solo db.get por reto) para que la UI no tenga que hacer un fetch aparte.

type ChallengeWithStartup = Doc<"challenges"> & {
  company: string;
  sector: string | null;
};

// Adjunta company/sector leyendo el user (startup) dueño del reto.
async function withStartup(
  ctx: QueryCtx,
  challenge: Doc<"challenges">,
): Promise<ChallengeWithStartup> {
  const startup = await ctx.db.get(challenge.startupId);
  return {
    ...challenge,
    company: startup?.companyName ?? startup?.name ?? "Startup",
    sector: startup?.sector ?? null,
  };
}

// Retos abiertos para el tablero de /challenges. Índice by_status (no table scan).
// .take(100): colección acotada por guideline; el MVP no lista miles de retos.
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(challengeStatusValidator),
  },
  returns: paginationResultValidator(schema.doc("challenges")),
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("challenges")
        .withIndex("by_status_and_updatedAt", (q) => q.eq("status", status))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("challenges")
      .withIndex("by_updatedAt")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByStartup = query({
  args: {
    startupId: v.id("users"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(challengeStatusValidator),
  },
  returns: paginationResultValidator(schema.doc("challenges")),
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("challenges")
        .withIndex("by_startupId_and_status_and_updatedAt", (q) =>
          q.eq("startupId", args.startupId).eq("status", status),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("challenges")
      .withIndex("by_startupId_and_updatedAt", (q) =>
        q.eq("startupId", args.startupId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Publicar un reto. `args` con `v` espeja el zod `challengeInput`
// (features/challenge/schema.ts): mismos campos, misma opcionalidad.
export const create = mutation({
  args: {
    // DEV STUB (identity-bootstrap, NO authz). El cliente pasa su propio userId
    // igual que users.createOrGet; NO es una comprobación de propiedad. La
    // propiedad real vendrá de ctx.auth.getUserIdentity() cuando entre el OAuth.
    startupId: v.id("users"),
    title: v.string(),
    businessProblem: v.string(),
    successCriteria: v.array(v.string()),
    reward: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
  },
  returns: v.id("challenges"),
  handler: async (ctx, args) => {
    await requireRole(ctx, args.startupId, "startup");
    const now = Date.now();
    return await ctx.db.insert("challenges", {
      startupId: args.startupId,
      title: cleanRequiredText(args.title, "title", 3, 120),
      businessProblem: cleanRequiredText(
        args.businessProblem,
        "businessProblem",
        20,
        10_000,
      ),
      successCriteria: cleanSuccessCriteria(args.successCriteria),
      reward: cleanOptionalText(args.reward, "reward", 500) ?? undefined,
      deadline: ensureFutureDeadline(args.deadline) ?? undefined,
      status: "draft",
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    startupId: v.id("users"),
    challengeId: v.id("challenges"),
    title: v.optional(v.string()),
    businessProblem: v.optional(v.string()),
    successCriteria: v.optional(v.array(v.string())),
    reward: v.optional(v.union(v.string(), v.null())),
    deadline: v.optional(v.union(v.number(), v.null())),
  },
  returns: schema.doc("challenges"),
  handler: async (ctx, args) => {
    const challenge = await requireOwnedChallenge(
      ctx,
      args.challengeId,
      args.startupId,
    );
    if (challenge.status !== "draft") {
      fail("CHALLENGE_NOT_EDITABLE", "Only draft challenges can be edited");
    }

    const patch: {
      title?: string;
      businessProblem?: string;
      successCriteria?: string[];
      reward?: string;
      deadline?: number;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      patch.title = cleanRequiredText(args.title, "title", 3, 120);
    }
    if (args.businessProblem !== undefined) {
      patch.businessProblem = cleanRequiredText(
        args.businessProblem,
        "businessProblem",
        20,
        10_000,
      );
    }
    if (args.successCriteria !== undefined) {
      patch.successCriteria = cleanSuccessCriteria(args.successCriteria);
    }
    if (args.reward !== undefined) {
      patch.reward = cleanOptionalText(args.reward, "reward", 500) ?? undefined;
    }
    if (args.deadline !== undefined) {
      patch.deadline = ensureFutureDeadline(args.deadline) ?? undefined;
    }

    await ctx.db.patch("challenges", args.challengeId, patch);
    const updated = await ctx.db.get("challenges", args.challengeId);
    if (!updated) fail("CHALLENGE_NOT_FOUND", "Challenge not found");
    return updated;
  },
});

export const publish = mutation({
  args: {
    startupId: v.id("users"),
    challengeId: v.id("challenges"),
  },
  returns: schema.doc("challenges"),
  handler: async (ctx, args) => {
    const challenge = await requireOwnedChallenge(
      ctx,
      args.challengeId,
      args.startupId,
    );
    if (challenge.status !== "draft") {
      fail("INVALID_CHALLENGE_TRANSITION", "Only draft challenges can be published");
    }
    ensureFutureDeadline(challenge.deadline);
    const now = Date.now();
    await ctx.db.patch("challenges", args.challengeId, {
      status: "open",
      publishedAt: now,
      updatedAt: now,
    });
    const published = await ctx.db.get("challenges", args.challengeId);
    if (!published) fail("CHALLENGE_NOT_FOUND", "Challenge not found");
    return published;
  },
});

export const close = mutation({
  args: {
    startupId: v.id("users"),
    challengeId: v.id("challenges"),
  },
  returns: schema.doc("challenges"),
  handler: async (ctx, args) => {
    const challenge = await requireOwnedChallenge(
      ctx,
      args.challengeId,
      args.startupId,
    );
    if (challenge.status !== "open") {
      fail("INVALID_CHALLENGE_TRANSITION", "Only open challenges can be closed");
    }
    const now = Date.now();
    await ctx.db.patch("challenges", args.challengeId, {
      status: "closed",
      closedAt: now,
      updatedAt: now,
    });
    const closed = await ctx.db.get("challenges", args.challengeId);
    if (!closed) fail("CHALLENGE_NOT_FOUND", "Challenge not found");
    return closed;
  },
});

export const archive = mutation({
  args: {
    startupId: v.id("users"),
    challengeId: v.id("challenges"),
  },
  returns: schema.doc("challenges"),
  handler: async (ctx, args) => {
    const challenge = await requireOwnedChallenge(
      ctx,
      args.challengeId,
      args.startupId,
    );
    if (challenge.status !== "closed") {
      fail("INVALID_CHALLENGE_TRANSITION", "Only closed challenges can be archived");
    }
    const now = Date.now();
    await ctx.db.patch("challenges", args.challengeId, {
      status: "archived",
      archivedAt: now,
      updatedAt: now,
    });
    const archived = await ctx.db.get("challenges", args.challengeId);
    if (!archived) fail("CHALLENGE_NOT_FOUND", "Challenge not found");
    return archived;
  },
});

export const removeDraft = mutation({
  args: {
    startupId: v.id("users"),
    challengeId: v.id("challenges"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const challenge = await requireOwnedChallenge(
      ctx,
      args.challengeId,
      args.startupId,
    );
    if (challenge.status !== "draft") {
      fail("CHALLENGE_NOT_DELETABLE", "Only draft challenges can be deleted");
    }
    await ctx.db.delete("challenges", args.challengeId);
    return null;
  },
});
