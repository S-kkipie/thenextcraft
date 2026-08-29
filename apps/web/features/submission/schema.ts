import { z } from "zod";

// Fuente única de tipos del ship (AGENTS regla 1). Estos campos espejan 1:1 los
// validators `v` de `submissions.ship` en el backend — misma forma, misma
// opcionalidad. `challengeId` y `builderId` no viven aquí: el reto viene de la
// ruta y el builder de la identidad (useCurrentUser), no del formulario.
export const shipInput = z.object({
  repoUrl: z.url("Pega la URL pública del repo (https://…)."),
  // "" cuenta como vacío → opcional; la mutación recibe undefined, no "".
  demoUrl: z.union([z.url("URL de demo inválida."), z.literal("")]).optional(),
  description: z.string().max(2000).optional(),
  tech: z.array(z.string()).optional(),
});
export type ShipInput = z.infer<typeof shipInput>;

// Sugerencias de tech para el chip-input (del mockup). Solo UI.
export const TECH_SUGGESTIONS = [
  "Next.js",
  "Convex",
  "TypeScript",
  "LLM",
  "Tailwind",
] as const;
