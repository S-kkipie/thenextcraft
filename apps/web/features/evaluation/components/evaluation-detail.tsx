"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "@thenextcraft/backend/dataModel";
import { Button } from "@/components/ui/button";
import { ScoreBar, StatusPill } from "@/components/craft";
import {
  useEvaluation,
  useJudgeStatus,
  useRunJudge,
  useSubmission,
} from "@/features/evaluation/hooks";

export function EvaluationDetail({
  submissionId,
}: {
  submissionId: Id<"submissions">;
}) {
  const view = useSubmission(submissionId);
  const evalResult = useEvaluation(submissionId);
  const judgeStatus = useJudgeStatus(submissionId);

  const runJudge = useRunJudge();
  const [startError, setStartError] = useState(false);
  const hasStarted = useRef(false);
  const evaluation = evalResult?.evaluation ?? null;
  const scored =
    evaluation && typeof evaluation.totalScore === "number" ? evaluation : null;

  const startJudge = useCallback(async () => {
    setStartError(false);
    try {
      await runJudge({ submissionId });
    } catch {
      setStartError(true);
    }
  }, [runJudge, submissionId]);

  // Shipped submissions are judged automatically. The action only queues the
  // work; the reactive status query below drives the visible progress until the
  // evaluation is complete.
  useEffect(() => {
    if (
      view === undefined ||
      evalResult === undefined ||
      scored ||
      judgeStatus !== null ||
      hasStarted.current
    ) {
      return;
    }
    hasStarted.current = true;
    void startJudge();
  }, [evalResult, judgeStatus, scored, startJudge, view]);

  // Loading: cualquiera de las dos consultas aún sin resolver.
  if (view === undefined || evalResult === undefined) {
    return <DetailSkeleton />;
  }
  if (view === null) {
    return (
      <EmptyState
        title="Submission no encontrada"
        body="El link no corresponde a ninguna submission."
      />
    );
  }

  const { challenge } = view;
  const cohortSize = evalResult?.cohort;
  const rank = evalResult?.rank ?? undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/challenges" className="hover:text-foreground">
          Retos
        </Link>
        <span className="px-1.5 text-faint">/</span>
        <span className="text-foreground">
          {challenge?.title ?? "Tu submission"}
        </span>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          Evaluación de tu submission
        </h1>
        {scored ? (
          <StatusPill status="review">Evaluado</StatusPill>
        ) : (
          <StatusPill status="review">En evaluación</StatusPill>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── LEFT ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {scored ? (
            <ScoreCard
              total={scored.totalScore ?? 0}
              rank={rank}
              cohortSize={cohortSize}
              fit={scored.fitScore}
              quality={scored.qualityScore}
              architecture={scored.architectureScore}
              security={scored.securityScore}
            />
          ) : (
            <PendingScoreCard
              status={judgeStatus}
              startError={startError}
              onRetry={startJudge}
            />
          )}

          {scored && (
            <JudgeReading
              strengths={scored.strengths}
              issues={scored.issues}
            />
          )}
        </div>

        {/* ── RIGHT sidebar ────────────────────────────────────── */}
        <aside className="flex flex-col gap-6">
          {scored && (
            <div className="rounded-xl border border-sage/30 bg-card px-5 py-4">
              <div className="flex items-start gap-2">
                <span className="text-sage">🌿</span>
                <p className="text-sm">
                  <b className="text-sage">Estás en el shortlist</b>. La decisión
                  final es de la startup.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ── Score + barras ────────────────────────────────────────────────────────
function ScoreCard({
  total,
  rank,
  cohortSize,
  fit,
  quality,
  architecture,
  security,
}: {
  total: number;
  rank?: number;
  cohortSize?: number;
  fit?: number;
  quality?: number;
  architecture?: number;
  security?: number;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="font-heading text-6xl font-extrabold tabular-nums leading-none">
          {total}
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        {typeof rank === "number" && (
          <div className="text-right">
            <div className="font-heading text-xl font-bold tabular-nums">
              #{rank}
              {typeof cohortSize === "number" ? ` de ${cohortSize}` : ""}
            </div>
            <div className="text-xs font-semibold text-faint">submissions</div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <ScoreBar label="Fit al reto ★" value={fit ?? 0} primary />
        <ScoreBar label="Calidad del build" value={quality ?? 0} />
        <ScoreBar label="Arquitectura" value={architecture ?? 0} />
        <ScoreBar label="Seguridad" value={security ?? 0} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        El AI Judge es estático — analiza el repo/link, nunca ejecuta tu código.
      </p>
    </section>
  );
}

// ── Estado sin evaluar ──────────────────────────────────────────────────────
function PendingScoreCard({
  status,
  startError,
  onRetry,
}: {
  status: JudgeStatus | null | undefined;
  startError: boolean;
  onRetry: () => Promise<void>;
}) {
  const activeStage = status ? JUDGE_STAGES.findIndex((stage) => stage.statuses.includes(status)) : 0;
  const failed = status === "failed" || startError;

  return (
    <section className="rounded-xl border border-border bg-card p-6" aria-live="polite">
      <div className="flex items-start gap-3">
        {!failed && (
          <span
            aria-hidden="true"
            className="mt-0.5 size-5 animate-spin rounded-full border-2 border-t-transparent border-sand"
          />
        )}
        <div>
          <h2 className="font-heading text-lg font-bold">
            {failed ? "No pudimos iniciar la evaluación" : "Tu evaluación está en curso"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {failed
              ? "Comprueba tu conexión e inténtalo de nuevo."
              : "El AI Judge está revisando tu solución. Te mostraremos el resultado aquí cuando esté listo."}
          </p>
        </div>
      </div>
      {!failed && (
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {JUDGE_STAGES.map((stage, index) => {
            const current = index === activeStage;
            const complete = index < activeStage;
            return (
              <li key={stage.label} className="flex items-center gap-2 text-sm">
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border text-xs ${
                    complete
                      ? "border-sage bg-sage text-background"
                      : current
                        ? "border-sand text-sand"
                        : "border-border text-faint"
                  }`}
                >
                  {complete ? "✓" : current ? "•" : index + 1}
                </span>
                <span className={current || complete ? "text-foreground" : "text-muted-foreground"}>
                  {stage.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {failed && (
        <div className="mt-5">
          <Button variant="craftSecondary" onClick={() => void onRetry()}>
            Intentar de nuevo
          </Button>
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        El análisis es estático: nunca ejecutamos tu código.
      </p>
    </section>
  );
}

type JudgeStatus =
  | "queued"
  | "validating_repository"
  | "reading_repository"
  | "selecting_files"
  | "reviewing_code"
  | "finalizing"
  | "completed"
  | "failed";

const JUDGE_STAGES: Array<{
  label: string;
  statuses: JudgeStatus[];
}> = [
  {
    label: "Preparando revisión",
    statuses: ["queued", "validating_repository", "reading_repository", "selecting_files"],
  },
  { label: "Analizando solución", statuses: ["reviewing_code"] },
  { label: "Preparando resultado", statuses: ["finalizing", "completed"] },
];

// ── Lectura del juez ──────────────────────────────────────────────────────
function JudgeReading({
  strengths,
  issues,
}: {
  strengths?: string[];
  issues?: string[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 font-heading text-lg font-bold">Lectura del juez</h2>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-sage">
            Fuerte
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            {(strengths ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-sage">✓</span>
                <span>{s}</span>
              </li>
            ))}
            {(strengths ?? []).length === 0 && (
              <li className="text-muted-foreground">Sin puntos destacados.</li>
            )}
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-destructive">
            A revisar
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            {(issues ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-destructive">−</span>
                <span>{s}</span>
              </li>
            ))}
            {(issues ?? []).length === 0 && (
              <li className="text-muted-foreground">Nada por revisar.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Estados auxiliares ──────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-72 animate-pulse rounded-md bg-secondary" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-64 animate-pulse rounded-xl bg-secondary" />
        <div className="h-64 animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <h1 className="font-heading text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-5">
        <Link href="/challenges">
          <Button variant="craftGhost">Volver a retos</Button>
        </Link>
      </div>
    </div>
  );
}
