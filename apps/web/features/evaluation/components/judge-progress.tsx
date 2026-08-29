"use client";

import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";

import { PixelIcon, type PixelIconName } from "@/components/craft/pixel-icon";
import { cn } from "@/lib/utils";

/*
 * Progreso del AI Judge.
 *
 * El juez tarda decenas de segundos: clona metadatos del repo, muestrea
 * ficheros y llama al modelo. Sin nada en pantalla, eso se lee como "se colgó".
 *
 * Las fases NO se inventan aquí: `technicalReviews.status` ya las emite el
 * backend vía `setStatus`, y la query es reactiva, así que la barra avanza sola
 * conforme el pipeline escribe. La UI solo las nombra y las ordena.
 *
 * `start` usa el submissionId como `requestId`, que es cómo esta vista
 * encuentra su review sin conocer el id interno.
 */

const PHASES: {
  status: string;
  label: string;
  icon: PixelIconName;
}[] = [
  { status: "queued", label: "En cola", icon: "clock" },
  { status: "validating_repository", label: "Validando el repo", icon: "shield" },
  { status: "reading_repository", label: "Leyendo el repo", icon: "github" },
  { status: "selecting_files", label: "Eligiendo archivos", icon: "filter" },
  { status: "reviewing_code", label: "Revisando el código", icon: "code" },
  { status: "finalizing", label: "Puntuando", icon: "target" },
];

const ORDER = PHASES.map((p) => p.status);

export function JudgeProgress({ submissionId }: { submissionId: string }) {
  const review = useQuery(api.technicalJudge.getByRequest, {
    requestId: submissionId,
  });

  // Sin review todavía (o cargando): esta vista no tiene nada que decir y deja
  // el sitio al copy de "pendiente".
  if (!review) return null;
  if (review.status === "completed") return null;

  const failed = review.status === "failed";
  const current = ORDER.indexOf(review.status);

  return (
    <section className="term" aria-live="polite">
      <div className="term-bar">
        ai-judge ~ {review.owner}/{review.repo}
        <span className="term-hint">
          {failed ? "detenido" : `${Math.max(current + 1, 1)} / ${PHASES.length}`}
        </span>
      </div>

      <div className="term-body">
        {failed ? (
          <div className="flex items-start gap-2.5">
            <PixelIcon
              name="cross"
              size={14}
              className="mt-0.5 text-[var(--rust)]"
            />
            <div>
              <p className="text-sm font-bold text-[var(--rust)]">
                El análisis se detuvo
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {review.failureMessage ??
                  "El repositorio no pudo analizarse. Revisa que el link sea público."}
              </p>
            </div>
          </div>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {PHASES.map((phase, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li
                  key={phase.status}
                  className="flex items-center gap-3 text-[13px]"
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-[6px] border",
                      done && "border-[var(--phos)]/40 text-[var(--phos)]",
                      active &&
                        "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]",
                      !done && !active && "border-[var(--line-2)] text-[var(--faint)]",
                    )}
                  >
                    <PixelIcon name={done ? "check" : phase.icon} size={11} />
                  </span>
                  <span
                    className={cn(
                      done && "text-[var(--muted)]",
                      active && "font-bold text-[var(--text)]",
                      !done && !active && "text-[var(--faint)]",
                    )}
                  >
                    {phase.label}
                  </span>
                  {active && (
                    // El único elemento animado: dice "vivo" sin ruido.
                    <span
                      aria-hidden
                      className="cursor-block ml-1 inline-block h-[1em] w-[0.45em] bg-[var(--phos)]"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-4 border-t border-[var(--line)] pt-3 text-xs text-muted-foreground">
          Análisis estático: el juez lee el repo, nunca ejecuta tu código.
        </p>
      </div>
    </section>
  );
}
