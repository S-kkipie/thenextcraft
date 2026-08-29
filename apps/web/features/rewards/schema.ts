import { z } from "zod";
import type { BadgeVariant } from "@/components/craft";

/**
 * Rewards view-models (zod = single type source, per AGENTS §1).
 *
 * PRODUCT TRUTH: streak/level/xp + badges son la CAPA DE ENGAGEMENT sobre
 * señales reales (ships, aprobaciones, AI Judge, autoría verificada). No es un
 * RPG de pago — cada recompensa se desbloquea con trabajo real.
 */

/** Engagement cluster: level ring + XP bar + streak. `progress` 0..1 al siguiente nivel. */
export const rewardsProgress = z.object({
  level: z.number(),
  progress: z.number(),
  streak: z.number(),
  xpValue: z.number(),
  xpMax: z.number(),
});
export type RewardsProgress = z.infer<typeof rewardsProgress>;

/** Fila de "Meta semanal": una meta derivada de una señal real, o un objetivo. */
export const weeklyGoal = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  max: z.number(),
  unit: z.string(),
  note: z.string().optional(),
});
export type WeeklyGoal = z.infer<typeof weeklyGoal>;

/**
 * Catálogo de badges: la condición real que desbloquea cada uno. El `variant`
 * y la `key` (badge.type en convex/schema.ts) son la fuente única de este map.
 */
export const BADGE_CATALOG = [
  {
    key: "first-ship",
    variant: "first",
    label: "First ship",
    unlock: "Shipea tu primer reto",
  },
  {
    key: "shipped",
    variant: "ship",
    label: "Shipped ×5",
    unlock: "Shipea 5 retos",
  },
  {
    key: "startup-approved",
    variant: "approved",
    label: "Startup-approved",
    unlock: "Una startup aprueba tu ship",
  },
  {
    key: "top-10",
    variant: "top",
    label: "Top 10%",
    unlock: "Entra al top 10% de un reto",
  },
  {
    key: "authorship-verified",
    variant: "auth",
    label: "Autoría verificada",
    unlock: "Aprueba tu viva de autoría",
  },
] as const satisfies readonly {
  key: string;
  variant: BadgeVariant;
  label: string;
  unlock: string;
}[];

export type BadgeCatalogItem = (typeof BADGE_CATALOG)[number];
