import type { Doc } from "@thenextcraft/backend/dataModel";
import {
  BADGE_CATALOG,
  type BadgeCatalogItem,
  type RewardsProgress,
  type WeeklyGoal,
} from "./schema";

/** Ancho de banda de XP por nivel (mismo criterio que el dashboard). */
function xpMaxForLevel(level: number): number {
  return Math.max(250, level * 250);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Level ring + XP bar + streak desde la capa de engagement del usuario. */
export function deriveProgress(user: Doc<"users"> | null): RewardsProgress {
  const level = user?.level ?? 1;
  const xpValue = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const xpMax = xpMaxForLevel(level);
  return { level, xpValue, xpMax, streak, progress: clamp01(xpValue / xpMax) };
}

const WEEK_STREAK_TARGET = 7;

/**
 * Meta semanal. La racha es una señal real (días activos seguidos); shipear es
 * un objetivo con CTA — no fabricamos progreso que no podemos medir aquí.
 */
export function deriveWeeklyGoals(user: Doc<"users"> | null): WeeklyGoal[] {
  const streak = user?.streak ?? 0;
  return [
    {
      key: "streak",
      label: "Mantén tu racha",
      value: Math.min(streak, WEEK_STREAK_TARGET),
      max: WEEK_STREAK_TARGET,
      unit: "días",
      note: "derivado de tu racha real",
    },
    {
      key: "ship",
      label: "Shipea un reto",
      value: 0,
      max: 1,
      unit: "ship",
      note: "objetivo de la semana",
    },
  ];
}

export type UnlockedBadge = BadgeCatalogItem & { count: number };

/**
 * Reparte el catálogo en desbloqueados / por desbloquear según las insignias
 * reales del usuario (api.badges.byUser). Cada badge del catálogo mapea 1:1 a un
 * `type` almacenado; cuenta repeticiones para "Shipped ×N".
 */
export function deriveBadges(badges: Doc<"badges">[] | undefined) {
  const counts = new Map<string, number>();
  for (const b of badges ?? []) {
    counts.set(b.type, (counts.get(b.type) ?? 0) + 1);
  }
  const unlocked: UnlockedBadge[] = BADGE_CATALOG.filter((c) =>
    counts.has(c.key),
  ).map((c) => ({ ...c, count: counts.get(c.key) ?? 1 }));
  const locked = BADGE_CATALOG.filter((c) => !counts.has(c.key));
  return { unlocked, locked, total: badges?.length ?? 0 };
}

/** Etiqueta mostrada para un badge desbloqueado ("Shipped ×3" usa el conteo real). */
export function unlockedLabel(item: UnlockedBadge): string {
  if (item.key === "shipped") return `Shipped ×${item.count}`;
  return item.label;
}
