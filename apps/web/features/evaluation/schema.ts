import { z } from "zod";

// Estados de la prueba de autoría (viva humana). `pending` es el inicial;
// solo los tres siguientes son seteables desde la UI.
export const authorshipStatus = z.enum([
  "pending",
  "video",
  "interview",
  "approved",
]);
export type AuthorshipStatus = z.infer<typeof authorshipStatus>;

export const authorshipAction = z.enum(["video", "interview", "approved"]);
export type AuthorshipAction = z.infer<typeof authorshipAction>;

// Dimensiones del AI Judge estático, en orden de prioridad (Fit = primaria).
export const scoreDimension = z.enum([
  "fit",
  "quality",
  "architecture",
  "security",
]);
export type ScoreDimension = z.infer<typeof scoreDimension>;
