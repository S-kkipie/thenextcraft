import { action, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { authorshipStatusValidator } from "./schema";

// MOCK static AI Judge — deterministic scores derived from the submission id.
// TODO real: call Claude (Anthropic) for the static review and persist via
// internalMutation. Needs env ANTHROPIC_API_KEY (do NOT hardcode a key).
// The platform NEVER runs code: this is a static review, no latency/throughput.
export const evaluate = action({
  args: { submissionId: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { submissionId }) => {
    let h = 0;
    for (let i = 0; i < submissionId.length; i++) {
      h = (h * 31 + submissionId.charCodeAt(i)) & 0xffff;
    }
    const fit = 72 + (h % 24); // 72..95
    const quality = 66 + ((h >> 3) % 28); // 66..93
    const total = Math.round(fit * 0.5 + quality * 0.5);
    const review =
      "Prioriza el reto de negocio y la solución es legible. A revisar: estados vacíos y cobertura de pruebas.";
    await ctx.runMutation(internal.rankings.markStarted, { submissionId });
    await ctx.runMutation(internal.rankings.complete, {
      submissionId,
      fitScore: fit,
      qualityScore: quality,
      totalScore: total,
      rankedReview: review,
      aiEvidence: "Revisión estática (mock).",
    });
    return null;
  },
});

// Public wrapper so the UI can advance the HUMAN authorship viva (video/interview/approved).
export const setAuthorship = mutation({
  args: {
    submissionId: v.id("submissions"),
    authorshipStatus: authorshipStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ev = await ctx.db
      .query("evaluations")
      .withIndex("by_submissionId", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .unique();
    if (!ev) return null;
    await ctx.db.patch("evaluations", ev._id, {
      authorshipStatus: args.authorshipStatus,
      updatedAt: Date.now(),
    });
    return null;
  },
});
