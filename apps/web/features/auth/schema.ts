import { z } from "zod";

/** Roles a user can enter as. Single source — mirrors `login()` in lib/current-user. */
export const ROLES = ["builder", "startup"] as const;
export type Role = (typeof ROLES)[number];

/** Minimal onboarding input (MVP stand-in for real GitHub OAuth). */
export const onboardingInput = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo"),
  githubHandle: z
    .string()
    .trim()
    .min(1, "Escribe tu usuario de GitHub")
    .regex(/^@?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/, "Usuario de GitHub inválido"),
  role: z.enum(ROLES, { error: "Elige cómo quieres entrar" }),
});
export type OnboardingInput = z.infer<typeof onboardingInput>;

/** Copy for the two selectable role cards. */
export const ROLE_META = [
  {
    value: "builder",
    emoji: "🛠",
    title: "Builder",
    desc: "Resuelve retos, consigue trabajo.",
  },
  {
    value: "startup",
    emoji: "🏢",
    title: "Startup",
    desc: "Publica tu reto, contrata.",
  },
] as const;
