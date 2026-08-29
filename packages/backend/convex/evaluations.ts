import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { authorshipStatusValidator } from "./schema";

// Real AI Technical Judge (static repo review). Kicks off the technicalJudge
// pipeline for the submission's repo; on completion it writes the scores back
// into this submission's `evaluations` row (see technicalJudge.complete bridge).
// The platform NEVER runs code — the judge only reads repo files.
export const evaluate = action({
  args: { submissionId: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.runQuery(api.submissions.get, { submissionId });
    const repoUrl = submission?.repositoryUrl;
    if (!repoUrl) return null;
    await ctx.runMutation(api.technicalJudge.start, {
      repoUrl,
      requestId: submissionId,
      submissionId,
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
