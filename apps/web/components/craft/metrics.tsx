import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Barra de progreso plana. Base de XP, mastery y objetivos semanales. */
export function Meter({
  value,
  max = 100,
  tone = "bg-primary",
  className,
}: {
  value: number;
  max?: number;
  tone?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** XP hacia el siguiente nivel. En el header del home y en el pasaporte. */
export function XpBar({
  xp,
  xpToNextLevel,
  level,
  className,
}: {
  xp: number;
  xpToNextLevel: number;
  level: number;
  className?: string;
}) {
  return (
    <div className={cn("min-w-40 space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium">Nivel {level}</span>
        <span className="tabular-nums text-muted-foreground">
          {xp.toLocaleString("es")} / {xpToNextLevel.toLocaleString("es")}
        </span>
      </div>
      <Meter value={xp} max={xpToNextLevel} />
    </div>
  );
}

/**
 * Métrica suelta: número grande, etiqueta chica. Se repite en el pasaporte,
 * el resumen de submission y las cards de impacto.
 */
export function Stat({
  value,
  label,
  icon: Icon,
  tone,
  className,
}: {
  value: React.ReactNode;
  label: string;
  icon?: LucideIcon;
  tone?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("flex items-center gap-1.5 text-xl font-semibold tabular-nums", tone)}>
        {Icon && <Icon className="size-4 opacity-70" aria-hidden />}
        {value}
      </div>
      <div className="text-xs leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

/**
 * Medidor segmentado: 10 celdas que se llenan según el score.
 * Es el lenguaje visual del scorecard de la IA — lectura discreta, no continua,
 * porque un score de evaluación se compara, no se mide.
 */
export function SegmentedMeter({
  value,
  segments = 10,
  tone = "bg-primary",
}: {
  value: number;
  segments?: number;
  tone?: string;
}) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="flex gap-1" aria-label={`${value} de 100`}>
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={cn("h-2 flex-1 rounded-[2px]", i < filled ? tone : "bg-muted")}
        />
      ))}
    </div>
  );
}

/** Anillo de nivel: el mismo progreso de XP, en la forma compacta del header. */
export function LevelRing({
  level,
  xp,
  xpToNextLevel,
}: {
  level: number;
  xp: number;
  xpToNextLevel: number;
}) {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, xp / xpToNextLevel);

  return (
    <div className="relative grid size-11 place-items-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90 size-full" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" strokeWidth="3" className="stroke-muted" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          stroke="var(--brand)"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <span className="text-sm font-semibold tabular-nums">{level}</span>
    </div>
  );
}

/** Devuelve la clase de color que le corresponde a un score 0-100. */
export function scoreTone(score: number) {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}
