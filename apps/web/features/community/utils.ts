import type { BadgeVariant } from "@/components/craft";

/**
 * Tiempo relativo en español, buckets gruesos. `now` se pasa como snapshot desde
 * el cliente (render puro / hydration-safe) — nunca leer el reloj en un query.
 */
export function relativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

// Mapea el tipo de badge (schema.badges.type) a su chip craft (label + variante).
const BADGE_META: Record<string, { label: string; variant: BadgeVariant }> = {
  "first-ship": { label: "First ship", variant: "first" },
  shipped: { label: "Shipped", variant: "ship" },
  "startup-approved": { label: "Startup-approved", variant: "approved" },
  "top-10": { label: "Top 10%", variant: "top" },
  "authorship-verified": { label: "Autoría verificada", variant: "auth" },
};

/** Chip craft para un tipo de badge (fallback razonable si es desconocido). */
export function badgeMeta(type: string): { label: string; variant: BadgeVariant } {
  return BADGE_META[type] ?? { label: type, variant: "ship" };
}
