"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card que se inclina siguiendo al puntero, con un brillo que lo persigue.
 *
 * Los ángulos se escriben como custom properties y el CSS hace el resto (ver
 * `.tilt` en globals.css): así el reposo, la transición de vuelta y el respeto
 * a `prefers-reduced-motion` viven en la hoja de estilos, no acá.
 */
export function TiltCard({
  children,
  className,
  /** Inclinación máxima en grados. Pasado los ~10° se vuelve mareante. */
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width;
    const py = (e.clientY - box.top) / box.height;

    el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.dataset.active = "false";
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div
      ref={ref}
      data-active="false"
      onPointerMove={handleMove}
      onPointerEnter={(e) => {
        e.currentTarget.dataset.active = "true";
      }}
      onPointerLeave={reset}
      className={cn("tilt relative", className)}
    >
      <span
        aria-hidden
        className="tilt-sheen pointer-events-none absolute inset-0 rounded-[16px]"
      />
      {children}
    </div>
  );
}
