import {
  Activity,
  Check,
  Circle,
  Clock3,
  LoaderCircle,
} from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  reviewStages,
  type ReviewStage,
} from "@/features/technical-judge/schema";

const stageCopy: Record<ReviewStage, { title: string; detail: string }> = {
  queued: {
    title: "En cola",
    detail: "La revisión fue registrada de forma segura.",
  },
  validating_repository: {
    title: "Validando repositorio",
    detail: "Confirmamos que el proyecto es público y accesible.",
  },
  reading_repository: {
    title: "Leyendo snapshot",
    detail: "Fijamos el commit y obtenemos el árbol del branch principal.",
  },
  selecting_files: {
    title: "Seleccionando evidencia",
    detail: "Priorizamos arquitectura, seguridad, código y pruebas.",
  },
  reviewing_code: {
    title: "Ejecutando juez AI",
    detail: "El modelo evalúa la muestra sin ejecutar el código.",
  },
  finalizing: {
    title: "Validando reporte",
    detail: "Recalculamos el score y verificamos cada cita.",
  },
};

type ReviewEvent = NonNullable<
  NonNullable<FunctionReturnType<typeof api.technicalJudge.get>>["events"]
>[number];

function formatEventTime(timestamp: number) {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

export function ReviewProgress({
  status,
  events,
}: {
  status: ReviewStage;
  events: ReviewEvent[];
}) {
  const currentIndex = reviewStages.indexOf(status);

  return (
    <Card aria-live="polite" className="border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="size-4" />
          Análisis en vivo
        </div>
        <CardTitle className="text-xl">El juez está revisando el proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {reviewStages.map((stage, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = isComplete ? Check : isCurrent ? LoaderCircle : Circle;

            return (
              <li
                key={stage}
                className={cn(
                  "relative flex min-h-28 gap-3 border-l py-4 pl-5 sm:border-l-0 sm:border-t sm:pl-0 sm:pr-5",
                  index <= currentIndex ? "border-foreground/40" : "border-border",
                )}
              >
                <span
                  className={cn(
                    "absolute -left-3 top-4 grid size-6 place-items-center rounded-full border bg-background sm:-top-3 sm:left-0",
                    isComplete && "border-foreground bg-foreground text-background",
                    isCurrent && "border-foreground",
                  )}
                >
                  <Icon className={cn("size-3.5", isCurrent && "animate-spin")} />
                </span>
                <div className="pt-0 sm:pt-3">
                  <p className={cn("font-medium", !isComplete && !isCurrent && "text-muted-foreground")}>
                    {stageCopy[stage].title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {stageCopy[stage].detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 border-t pt-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Activity className="size-4" />
            Actividad del trabajador
          </div>
          <ol className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-2" aria-label="Actividad de la revisión">
            {events.slice().reverse().map((event, index) => (
              <li key={`${event.timestamp}-${index}`} className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                <time className="font-mono text-xs tabular-nums text-muted-foreground" dateTime={new Date(event.timestamp).toISOString()}>
                  {formatEventTime(event.timestamp)}
                </time>
                <p className="min-w-0 break-words leading-relaxed text-muted-foreground">{event.message}</p>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
