import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { StatusPill, type ChallengeStatus } from "./status-pill";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { cn } from "@/lib/utils";

/*
 * Card de reto — la unidad que más se repite del producto.
 *
 * Lo que le faltaba y ahora tiene:
 *
 *  - URGENCIA. `days` era un número gris igual con 30 días que con 2. Ahora
 *    los últimos 3 días se pintan en rust y los últimos 7 en cian, y el texto
 *    dice "quedan Nd" en vez de "Nd". Una fecha límite que no se ve no es una
 *    fecha límite.
 *  - COMPETENCIA LEGIBLE. `participants` a secas no dice si vale la pena
 *    entrar. Con el conteo va una lectura: pocos participantes = "cancha
 *    abierta", muchos = "reto caliente".
 *  - JERARQUÍA. El problema de negocio es lo que decide si te interesa, así
 *    que se le da su espacio y se recorta a 3 líneas en vez de dejar que una
 *    card mida el doble que su vecina.
 *  - Recompensa como dato destacado, no como texto suelto al lado del nombre.
 */

/** Traduce días restantes a tono + copy. `undefined` = el reto no tiene fecha. */
function deadlineTone(days?: number) {
  if (days == null) return { color: "var(--faint)", text: "sin fecha" };
  if (days <= 0) return { color: "var(--rust)", text: "cierra hoy" };
  if (days <= 3) return { color: "var(--rust)", text: `quedan ${days}d` };
  if (days <= 7) return { color: "var(--cyan)", text: `quedan ${days}d` };
  return { color: "var(--faint)", text: `quedan ${days}d` };
}

/** Sin datos no se inventa nada: solo se etiqueta lo que el número ya dice. */
function crowdLabel(participants?: number): string | null {
  if (participants == null) return null;
  if (participants === 0) return "sé el primero";
  if (participants <= 5) return "cancha abierta";
  if (participants >= 25) return "reto caliente";
  return null;
}

export function ChallengeCard({
  title,
  company,
  sector,
  initials,
  problem,
  reward,
  tech = [],
  participants,
  days,
  status,
  href,
  className,
}: {
  title: string;
  company: string;
  sector?: string;
  initials: string;
  problem?: string;
  reward?: string;
  tech?: string[];
  participants?: number;
  days?: number;
  status?: ChallengeStatus;
  href?: string;
  className?: string;
}) {
  const deadline = deadlineTone(days);
  const crowd = crowdLabel(participants);
  const urgent = days != null && days <= 3;

  return (
    <div
      className={cn(
        "card card-hover relative flex flex-col",
        // Un reto a punto de cerrar se marca en el borde, no solo en la letra.
        urgent && "border-l-[3px] border-l-[var(--rust)]",
        className,
      )}
    >
      <div className="mb-3.5 flex items-center gap-3">
        <div className="font-display grid size-[38px] flex-none place-items-center rounded-[10px] border border-[var(--line-2)] bg-[var(--panel-2)] text-sm font-bold text-[var(--phos)]">
          {initials}
        </div>
        <div className="min-w-0 font-display text-sm leading-tight font-bold">
          <span className="block truncate">{company}</span>
          {sector && (
            <span className="text-faint block truncate text-xs font-semibold">
              {sector}
            </span>
          )}
        </div>
        {status && (
          <div className="ml-auto">
            <StatusPill status={status} />
          </div>
        )}
      </div>

      <h3 className="title-plain mb-2 text-lg leading-snug font-bold">{title}</h3>

      {problem && (
        <p className="text-muted-foreground mb-3.5 line-clamp-3 text-sm">
          {problem}
        </p>
      )}

      {tech.length > 0 && (
        <div className="mb-3.5 flex flex-wrap gap-2">
          {tech.slice(0, 4).map((t) => (
            <span key={t} className="tag-pill">
              {t}
            </span>
          ))}
          {tech.length > 4 && (
            <span className="tag-pill text-[var(--faint)]">
              +{tech.length - 4}
            </span>
          )}
        </div>
      )}

      {/* mt-auto: los pies quedan alineados aunque los problemas midan distinto. */}
      <div className="data mt-auto mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold">
        {participants != null && (
          <span className="text-faint inline-flex items-center gap-1.5">
            <PixelIcon name="users" size={12} />
            {participants}
            {crowd && (
              <span className="text-[var(--muted)]">· {crowd}</span>
            )}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: deadline.color }}
        >
          <PixelIcon name="clock" size={12} />
          {deadline.text}
        </span>
        {reward && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[var(--phos)]">
            <PixelIcon name="trophy" size={12} />
            {reward}
          </span>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "craftSecondary" }),
            "w-full justify-center",
          )}
        >
          Ver el reto <PixelIcon name="arrowRight" size={12} />
        </Link>
      )}
    </div>
  );
}
