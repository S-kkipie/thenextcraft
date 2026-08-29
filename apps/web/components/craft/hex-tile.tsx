import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * El hexágono es la forma de marca: skills, nodos del mapa y badges de logro.
 *
 * `clip-path` no admite borde, así que el contorno es un hexágono exterior
 * pintado con el color del track y otro interior encima con el fondo de la card.
 */
export function HexTile({
  icon: Icon,
  accent = "bg-primary",
  active = false,
  size = "default",
  className,
}: {
  icon: LucideIcon;
  /** Clase de fondo del contorno: define el color del track. */
  accent?: string;
  /** Rellena todo el hexágono en vez de dejarlo hueco. Para el nodo hub. */
  active?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const box = { sm: "size-10", default: "size-14", lg: "size-20" }[size];
  const glyph = { sm: "size-4", default: "size-5", lg: "size-7" }[size];

  return (
    <div className={cn("clip-hex grid place-items-center", box, accent, className)}>
      {active ? (
        <Icon className={cn(glyph, "text-primary-foreground")} aria-hidden />
      ) : (
        <div className="clip-hex grid size-[calc(100%-3px)] place-items-center bg-card">
          <Icon className={cn(glyph, "text-foreground/80")} aria-hidden />
        </div>
      )}
    </div>
  );
}

/** Hexágono de logro: solo color, sin icono propio, para las grillas de badges. */
export function HexBadge({
  icon: Icon,
  label,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex w-14 flex-col items-center gap-1.5">
      <div className={cn("clip-hex grid size-12 place-items-center", accent)}>
        <Icon className="size-5 text-background" aria-hidden />
      </div>
      <span className="text-center text-[10px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
