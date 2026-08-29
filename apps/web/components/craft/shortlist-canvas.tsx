"use client";

import * as React from "react";

/*
 * "De 100 a 10" — el filtro del producto, hecho sistema de partículas.
 *
 * Cada partícula es una submission. La animación no decora: cuenta la única
 * cosa que hay que entender del producto.
 *
 *   fase 0 · pool    — 120 builders a la deriva, conectados por proximidad.
 *                      La constelación es el mercado antes del filtro; el
 *                      cursor empuja la red.
 *   fase 1 · ranking — las líneas se apagan y cada partícula viaja a su
 *                      posición por score. El desorden se vuelve orden.
 *   fase 2 · shortlist — las 110 de abajo se apagan y caen; las 10 mejores
 *                      suben a una fila y se encienden. La #1 recibe el anillo.
 *
 * El progreso sale de cuánto ha recorrido la sección por el viewport — el
 * scroll manda, pero no se secuestra: si sigues bajando, la página baja.
 */

const COUNT = 120;
const SHORTLIST = 10;

// Tokens de la landing. Fijos acá porque el canvas no cascada.
const PHOS = [74, 240, 126] as const;
const CYAN = [69, 224, 208] as const;
const FAINT = [86, 99, 86] as const;
const MUTED = [126, 143, 126] as const;

type Particle = {
  score: number;
  rank: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  r: number;
};

const rgba = (c: readonly [number, number, number], a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Interpolación suave para que ninguna fase arranque de golpe. */
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Mapea `v` del rango [a,b] a [0,1], recortado. */
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

export function ShortlistCanvas({ header }: { header?: React.ReactNode }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];

    const build = () => {
      // Scores sesgados al centro: la mayoría promedio, pocas excelentes.
      const scores = Array.from({ length: COUNT }, () => {
        const t = (Math.random() + Math.random() + Math.random()) / 3;
        return 35 + t * 60;
      }).sort((a, b) => b - a);

      particles = scores.map((score, rank) => ({
        score,
        rank,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        tx: 0,
        ty: 0,
        r: rank < SHORTLIST ? 3.6 : 2.7,
      }));
    };

    const layout = () => {
      // Rejilla ordenada por rank: leer izquierda→derecha es leer el ranking.
      const cols = w < 640 ? 10 : 20;
      const rows = Math.ceil(COUNT / cols);
      const gapX = w / (cols + 1);
      const gapY = Math.min(h / (rows + 2), 34);
      const top = h / 2 - (rows * gapY) / 2;

      for (const p of particles) {
        p.tx = gapX * ((p.rank % cols) + 1);
        p.ty = top + Math.floor(p.rank / cols) * gapY;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length) build();
      layout();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const pointer = { x: -999, y: -999 };
    const onPointer = (e: PointerEvent) => {
      const box = host.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
    };
    const onLeave = () => {
      pointer.x = -999;
      pointer.y = -999;
    };
    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerleave", onLeave);

    /**
     * Progreso = cuánto se ha consumido del riel alto que envuelve al canvas.
     *
     * El canvas va `sticky` dentro de ese riel: la página scrollea normal —no se
     * intercepta la rueda— pero el canvas se queda quieto mientras su sección
     * pasa, así las tres fases se ven completas. Atarlo a la posición del propio
     * canvas dejaba el desenlace ocurriendo ya fuera de pantalla.
     */
    const readProgress = () => {
      const track = trackRef.current;
      if (!track) return 0;
      const box = track.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      return total <= 0 ? 1 : clamp01(-box.top / total);
    };

    let lastPhase = -1;

    const draw = (progress: number, time: number) => {
      ctx.clearRect(0, 0, w, h);

      const sorting = easeInOut(span(progress, 0.34, 0.62));
      const culling = easeInOut(span(progress, 0.62, 0.9));

      const next = culling > 0.15 ? 2 : sorting > 0.15 ? 1 : 0;
      if (next !== lastPhase) {
        lastPhase = next;
        setPhase(next);
      }

      // ── Constelación: solo existe mientras el pool está desordenado ───────
      const web = 1 - sorting;
      if (web > 0.02) {
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 104 * 104) continue;
            const alpha = (1 - Math.sqrt(d2) / 104) * 0.34 * web;
            ctx.strokeStyle = rgba(FAINT, alpha);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const top10 = p.rank < SHORTLIST;

        if (sorting < 0.02) {
          // Deriva libre, con rebote en los bordes.
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;

          // El cursor abre un hueco en la red.
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && d2 > 1) {
            const push = (1 - Math.sqrt(d2) / 120) * 1.6;
            const d = Math.sqrt(d2);
            p.x += (dx / d) * push;
            p.y += (dy / d) * push;
          }
        } else {
          // Destino: rejilla ordenada, y luego la fila del shortlist.
          let tx = p.tx;
          let ty = p.ty;

          if (culling > 0) {
            if (top10) {
              const gap = Math.min(w / (SHORTLIST + 1), 92);
              const rowX = w / 2 + (p.rank - (SHORTLIST - 1) / 2) * gap;
              tx = p.tx + (rowX - p.tx) * culling;
              ty = p.ty + (h * 0.5 - p.ty) * culling;
            } else {
              // Las descartadas caen y se van.
              ty = p.ty + culling * (h * 0.75 + p.rank);
            }
          }

          p.x += (tx - p.x) * 0.09;
          p.y += (ty - p.y) * 0.09;
        }

        // ── Pintado ───────────────────────────────────────────────────────
        const dropped = !top10 ? culling : 0;
        const alpha = (1 - dropped) * (top10 ? 0.7 + 0.3 * culling : 0.72);
        if (alpha <= 0.01) continue;

        const color = top10 && culling > 0.3 ? PHOS : MUTED;
        const radius = p.r * (top10 ? 1 + culling * 0.9 : 1);

        if (top10 && culling > 0.3) {
          ctx.shadowBlur = 14 * culling;
          ctx.shadowColor = rgba(PHOS, 0.7);
        }
        ctx.fillStyle = rgba(color, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // La #1: anillo latiendo. Es el hire.
        if (p.rank === 0 && culling > 0.55) {
          const pulse = 1 + Math.sin(time * 0.003) * 0.12;
          ctx.strokeStyle = rgba(CYAN, 0.9 * culling);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (radius + 9) * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    let frame = 0;
    let visible = false;

    const loop = (time: number) => {
      draw(readProgress(), time);
      frame = requestAnimationFrame(loop);
    };

    // Solo se anima mientras la sección está en pantalla.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame && !reduce) frame = requestAnimationFrame(loop);
        if ((!visible || reduce) && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        if (reduce && visible) draw(1, 0);
      },
      { rootMargin: "120px" },
    );
    io.observe(trackRef.current ?? host);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const STEPS = [
    { n: "120", label: "submissions", tail: "Todos shipearon algo público." },
    { n: "120", label: "rankeadas por la IA", tail: "Score comparable, review estático." },
    { n: "10", label: "en shortlist", tail: "La startup decide entre estas." },
  ];
  const step = STEPS[phase];

  return (
    <div ref={trackRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center">
        {header}

        <div className="relative mt-8">
          <div
            ref={hostRef}
            className="relative h-[38vh] w-full touch-none sm:h-[44vh]"
          >
            <canvas ref={canvasRef} aria-hidden className="block size-full" />
          </div>

          {/* La animación necesita pie de foto, no adivinanza. */}
          <div className="pointer-events-none mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
            <span
              className="text-[clamp(38px,7vw,64px)] leading-none font-bold tracking-[-0.06em] text-[var(--phos)] tabular-nums"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {step.n}
            </span>
            <span className="pb-1.5">
              <span
                className="block text-[15px] font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.label}
              </span>
              <span className="block text-[13px] text-[var(--muted)]">
                {step.tail}
              </span>
            </span>
          </div>
        </div>
      </div>

      <p className="sr-only">
        Visualización del filtro: de 120 submissions, la IA rankea y deja 10 en
        shortlist para que la startup decida.
      </p>
    </div>
  );
}
