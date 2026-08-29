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

// Schema del FORMULARIO = shipInput + gate de autoría. El checkbox "Confirmo
// autoría" es obligatorio para poder shipear (producto: autoría humana), pero NO
// se persiste: se valida aquí y se descarta antes de llamar a la mutación, que
// recibe exactamente los campos de shipInput.
export const shipForm = shipInput.extend({
  confirmAuthorship: z.boolean().refine((val) => val === true, {
    message: "Confirma que el trabajo es de tu autoría.",
  }),
});
export type ShipForm = z.infer<typeof shipForm>;

// Sugerencias de tech para el chip-input (del mockup). Solo UI.
export const TECH_SUGGESTIONS = [
  "Next.js",
  "Convex",
  "TypeScript",
  "LLM",
  "Tailwind",
] as const;
