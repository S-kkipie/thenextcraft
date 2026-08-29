import { z } from "zod";

// Single source of truth para el reto. El form (react-hook-form + zodResolver)
// y los args `v` de convex/challenges.create espejan esta forma.
export const challengeInput = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  businessProblem: z
    .string()
    .min(20, "Describe el problema (mínimo 20 caracteres)"),
  successCriteria: z
    .array(z.string().min(1, "El criterio no puede estar vacío"))
    .min(1, "Añade al menos un criterio"),
  reward: z.string().optional(),
  tech: z.array(z.string().min(1)).optional(),
});

export type ChallengeInput = z.infer<typeof challengeInput>;
