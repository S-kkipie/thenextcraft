"use client";

import * as React from "react";

/*
 * BinaryRain — lluvia de 0 y 1 en los márgenes laterales.
 *
 * Es decoración, y la decoración que compite con el contenido es un defecto.
 * De ahí las cuatro reglas que gobiernan esta pieza:
 *
 *  1. Vive SOLO en el margen. La app mide 1024px; por debajo de ~1400px de
 *     viewport no hay margen que llenar y el efecto no se monta. Nunca pasa
 *     por detrás del texto.
 *  2. Se desvanece hacia el centro con una máscara, así el borde del contenido
 *     nunca tiene un dígito pegado.
 *  3. Opacidad muy baja y caída lenta. Si se lee, molesta.
 *  4. `prefers-reduced-motion` la apaga del todo — no la ralentiza, la apaga.
 *
 * Canvas y no DOM: son cientos de glifos redibujándose; con nodos sería un
 * incendio de layout. Un solo canvas por lado, escalado a devicePixelRatio
 * para que los dígitos salgan nítidos y no borrosos.
 */

const GLYPHS = "01";
const FONT_SIZE = 13;
const COLUMN_W = 15;
/** Cada columna avanza una fila cada N frames: distinto por columna = desfase. */
const MIN_DELAY = 4;
const MAX_DELAY = 14;

function useRain(side: "left" | "right") {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let stop = false;

    // Estado por columna: fila actual, ritmo propio y contador de frames.
    let rows = 0;
    let cols: { y: number; delay: number; tick: number }[] = [];
    let ctx: CanvasRenderingContext2D | null = null;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return false;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.scale(dpr, dpr);
      ctx.font = `${FONT_SIZE}px ui-monospace, monospace`;
      ctx.textBaseline = "top";
      rows = Math.ceil(h / FONT_SIZE) + 1;
      const n = Math.ceil(w / COLUMN_W);
      cols = Array.from({ length: n }, () => ({
        y: Math.floor(Math.random() * rows),
        delay: MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)),
        tick: 0,
      }));
      return true;
    };

    const frame = () => {
      if (stop || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Velo translúcido en vez de clearRect: deja una estela corta detrás de
      // cada dígito, que es lo que hace que la columna se lea como caída.
      ctx.fillStyle = "rgba(11, 14, 11, 0.16)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        if (++col.tick < col.delay) continue;
        col.tick = 0;

        const x = i * COLUMN_W;
        const y = col.y * FONT_SIZE;
        const glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];

        // La cabeza va en fósforo pleno; el resto ya se apagó con el velo.
        ctx.fillStyle = "rgba(74, 240, 126, 0.55)";
        ctx.fillText(glyph, x, y);

        col.y++;
        if (col.y > rows) {
          col.y = 0;
          col.delay =
            MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY));
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduce.matches) return;
      if (!setup()) return;
      raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      start();
    };

    start();
    window.addEventListener("resize", restart);
    reduce.addEventListener("change", restart);

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", restart);
      reduce.removeEventListener("change", restart);
    };
  }, [side]);

  return ref;
}

function Side({ side }: { side: "left" | "right" }) {
  const ref = useRain(side);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-y-0 w-[max(0px,calc((100vw-1200px)/2))]"
      style={{
        [side]: 0,
        opacity: 0.5,
        // Se apaga hacia el contenido y hacia arriba/abajo: el margen respira
        // en vez de terminar en un corte recto.
        maskImage: `linear-gradient(to ${side === "left" ? "left" : "right"}, transparent, black 45%), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)`,
        maskComposite: "intersect",
        WebkitMaskImage: `linear-gradient(to ${side === "left" ? "left" : "right"}, transparent, black 45%), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)`,
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}

/**
 * Monta la lluvia en ambos márgenes. `z-0` y `pointer-events-none`: queda por
 * debajo de todo y no intercepta un solo click.
 */
export function BinaryRain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden xl:block">
      <Side side="left" />
      <Side side="right" />
    </div>
  );
}
