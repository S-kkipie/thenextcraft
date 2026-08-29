// Presentación de badges: mapea el `type` almacenado (convex/schema.ts) a la
// variante del <CraftBadge/> y su etiqueta en español. Fuente única de este map.

type BadgeVariant = "first" | "ship" | "approved" | "top" | "auth";

export const BADGE_META: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  "first-ship": { variant: "first", label: "First ship" },
  shipped: { variant: "ship", label: "Shipped" },
  "startup-approved": { variant: "approved", label: "Startup-approved" },
  "top-10": { variant: "top", label: "Top 10%" },
  "authorship-verified": { variant: "auth", label: "Autoría verificada" },
};

export const DEFAULT_BADGE_META = { variant: "ship" as BadgeVariant, label: "Badge" };
