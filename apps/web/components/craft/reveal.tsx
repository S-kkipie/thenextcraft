"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Entrada al viewport: desplaza y funde una sola vez.
 *
 * Se desconecta después de disparar — un observer vivo por bloque durante toda
 * la sesión es memoria tirada. Con `prefers-reduced-motion` el contenido nace
 * visible por CSS, sin depender de que el observer llegue a dispararse.
 */
export function Reveal({
  children,
  className,
  /** Retraso en ms. Para escalonar hermanos sin envolverlos en un contenedor. */
  delay = 0,
  /** Desde dónde entra. `up` es el default; `left`/`right` para asimetría. */
  from = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // El caso de motion reducido lo cubre el CSS (`motion-reduce:` abajo): el
    // contenido nace visible sin que este efecto toque el estado.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = {
    up: "translate-y-6",
    left: "-translate-x-8",
    right: "translate-x-8",
  }[from];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        shown ? "translate-x-0 translate-y-0 opacity-100" : `opacity-0 ${hidden}`,
        className,
      )}
      style={shown ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Parallax por scroll. Escribe `--py` en el elemento y el CSS lo consume, así
 * el trabajo por frame es una sola custom property, no un re-render de React.
 */
export function useParallax(strength = 0.12) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      // 0 cuando el bloque está centrado; ±1 en los extremos del viewport.
      const centered = (box.top + box.height / 2 - window.innerHeight / 2) /
        window.innerHeight;
      el.style.setProperty("--py", `${centered * strength * 100}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return ref;
}
