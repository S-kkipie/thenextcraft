import { action } from "./_generated/server";
import { v } from "convex/values";

// Pipeline AI (etapa 1 fit vs criterios + etapa 2 static review).
// TODO build real: llamar a Claude (Anthropic API) y persistir scores
// via internalMutation. La etapa 3 (autoría) es humana → video/audio/entrevista.
export const evaluate = action({
  args: { submissionId: v.id("submissions") },
  returns: v.object({
    submissionId: v.id("submissions"),
    status: v.literal("not_implemented"),
  }),
  handler: async (_ctx, args) => {
    return {
      submissionId: args.submissionId,
      status: "not_implemented" as const,
    };
  },
});
