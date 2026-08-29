"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Todos los gráficos de la app son de una sola serie, así que ninguno lleva
 * leyenda ni paleta categórica: el título nombra la serie y el color solo
 * codifica magnitud o estado. Grillas y ejes van recesivos; los valores se
 * etiquetan de forma selectiva, nunca punto por punto.
 */

type Point = { label: string; value: number };

/**
 * Evolución del Builder Score. Área + línea con crosshair y tooltip:
 * un gráfico en HTML es interactivo por defecto.
 */
export function ScoreArea({
  data,
  height = 180,
  className,
}: {
  data: Point[];
  height?: number;
  className?: string;
}) {
  const [active, setActive] = React.useState<number | null>(null);
  const W = 600;
  const H = 200;
  const padY = 16;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - box.left) / box.width;
    setActive(Math.max(0, Math.min(data.length - 1, Math.round(ratio * (data.length - 1)))));
  }

  const point = active === null ? null : data[active];

  return (
    <div
      className={cn("relative", className)}
      style={{ height }}
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="size-full overflow-visible"
        role="img"
        aria-label="Evolución del Builder Score por semana"
      >
        <defs>
          <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity=".38" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grilla recesiva: cuatro líneas, sin marco ni ticks */}
        {[0, 0.33, 0.66, 1].map((t) => (
          <line
            key={t}
            x1="0"
            x2={W}
            y1={padY + t * (H - padY * 2)}
            y2={padY + t * (H - padY * 2)}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill="url(#scoreArea)" />
        <path
          d={line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {active !== null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1="0"
            y2={H}
            stroke="var(--brand)"
            strokeOpacity=".5"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* solo el último punto queda marcado en reposo: es el valor vigente */}
        <circle
          cx={x(data.length - 1)}
          cy={y(data[data.length - 1].value)}
          r="4"
          fill="var(--brand)"
          stroke="var(--card)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {point && active !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-popover px-2.5 py-1.5 text-xs shadow-lg ring-1 ring-border"
          style={{ left: `${(active / (data.length - 1)) * 100}%` }}
        >
          <div className="font-medium tabular-nums">{point.value.toLocaleString("es")}</div>
          <div className="text-muted-foreground">{point.label}</div>
        </div>
      )}

      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

/**
 * Radar del scorecard de la IA. Una sola serie sobre 5 ejes: el objetivo es leer
 * la *forma* del builder (dónde es fuerte, dónde se hunde), no cada número.
 */
export function ScoreRadar({
  criteria,
  className,
}: {
  criteria: { label: string; score: number }[];
  className?: string;
}) {
  const size = 260;
  const c = size / 2;
  const r = 82;
  const step = 360 / criteria.length;

  const at = (i: number, ratio: number) => {
    const rad = ((i * step - 90) * Math.PI) / 180;
    return [c + Math.cos(rad) * r * ratio, c + Math.sin(rad) * r * ratio] as const;
  };
  const polygon = (ratio: number) =>
    criteria.map((_, i) => at(i, ratio).join(",")).join(" ");

  // El viewBox se ensancha a los lados para que quepan las etiquetas de los ejes
  // («Calidad de código» es más ancha que el propio radar).
  return (
    <svg
      viewBox={`-50 0 ${size + 100} ${size}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Scorecard por criterio"
    >
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={polygon(ratio)}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="1"
        />
      ))}
      {criteria.map((_, i) => {
        const [px, py] = at(i, 1);
        return (
          <line
            key={i}
            x1={c}
            y1={c}
            x2={px}
            y2={py}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={criteria.map((cr, i) => at(i, cr.score / 100).join(",")).join(" ")}
        fill="var(--brand)"
        fillOpacity=".28"
        stroke="var(--brand)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {criteria.map((cr, i) => {
        const [px, py] = at(i, cr.score / 100);
        return <circle key={cr.label} cx={px} cy={py} r="3.5" fill="var(--brand)" />;
      })}

      {criteria.map((cr, i) => {
        const [px, py] = at(i, 1.3);
        return (
          <text
            key={cr.label}
            x={px}
            y={py}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px]"
          >
            <tspan x={px} dy="-0.4em">
              {cr.label}
            </tspan>
            <tspan x={px} dy="1.2em" className="fill-foreground font-medium">
              {cr.score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

/**
 * Dónde caíste vs. las otras submissions. Un histograma con tu posición marcada
 * responde "¿qué tan bueno es un 91?", que es la pregunta real.
 */
export function ScoreHistogram({
  distribution,
  yourScore,
  className,
}: {
  distribution: number[];
  yourScore: number;
  className?: string;
}) {
  const bucketSize = 5;
  const firstBucket = 30;
  const peak = Math.max(...distribution);
  const yourBucket = Math.min(
    distribution.length - 1,
    Math.max(0, Math.floor((yourScore - firstBucket) / bucketSize)),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-24 items-end gap-1">
        {distribution.map((count, i) => (
          <div key={i} className="relative flex flex-1 flex-col items-center justify-end">
            {i === yourBucket && (
              <span className="absolute -top-5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Tú
              </span>
            )}
            <div
              className={cn(
                "w-full rounded-t-[4px]",
                i === yourBucket ? "bg-primary" : "bg-muted",
              )}
              style={{ height: `${(count / peak) * 100}%` }}
              title={`${firstBucket + i * bucketSize}–${firstBucket + (i + 1) * bucketSize} · ${count} submissions`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{firstBucket}</span>
        <span>Score</span>
        <span>{firstBucket + distribution.length * bucketSize}</span>
      </div>
    </div>
  );
}

const HEAT_STEPS = [
  "bg-muted",
  "bg-success/25",
  "bg-success/45",
  "bg-success/70",
  "bg-success",
];

/**
 * Calendario de contribución del repo. Escala secuencial de un solo tono:
 * la intensidad es magnitud, no categoría.
 */
export function ActivityHeatmap({
  activity,
  className,
}: {
  /** Filas = semanas, columnas = Lun→Dom, valores 0-4. */
  activity: number[][];
  className?: string;
}) {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {activity.flatMap((week, w) =>
          week.map((level, d) => (
            <span
              key={`${w}-${d}`}
              className={cn("aspect-square rounded-[3px]", HEAT_STEPS[level])}
              title={`${days[d]} · ${level === 0 ? "sin commits" : `nivel ${level}`}`}
            />
          )),
        )}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Menos</span>
        {HEAT_STEPS.map((step) => (
          <span key={step} className={cn("size-2.5 rounded-[2px]", step)} />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}
