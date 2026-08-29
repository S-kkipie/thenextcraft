"use client";

import Link from "next/link";
import { useState } from "react";
import type { Id } from "@thenextcraft/backend/dataModel";
import { Button } from "@/components/ui/button";
import { ScoreBar, StatusPill, CraftBadge } from "@/components/craft";
import {
  useEvaluation,
  useRunJudge,
  useSetAuthorship,
  useSubmission,
} from "@/features/evaluation/hooks";
import type { AuthorshipStatus } from "@/features/evaluation/schema";

// Copia por estado de autoría (viva humana). `pending` = inicial.
const AUTHORSHIP_LABEL: Record<AuthorshipStatus, string> = {
  pending: "Pendiente",
  video: "Video enviado",
  interview: "Entrevista agendada",
  approved: "Autoría verificada",
};
// Estado de autoría → `status` del StatusPill del Kit (review=amber, open=sage).
const AUTHORSHIP_STATUS: Record<AuthorshipStatus, "review" | "open"> = {
  pending: "review",
  video: "review",
  interview: "review",
  approved: "open",
};

export function EvaluationDetail({
  submissionId,
}: {
  submissionId: Id<"submissions">;
}) {
  const view = useSubmission(submissionId);
  const evalResult = useEvaluation(submissionId);

  const setAuthorship = useSetAuthorship();
  const runJudge = useRunJudge();
  const [running, setRunning] = useState(false);

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
  // `ship` no siembra evaluación → la fila puede no existir todavía. Sin fila o
  // sin total ⇒ aún no evaluado (se puede disparar el juez). `scored` narrowea
  // la evaluación a no-nula para el render del resultado.
  const evaluation = evalResult?.evaluation ?? null;
  const scored =
    evaluation && typeof evaluation.totalScore === "number" ? evaluation : null;
  const cohortSize = evalResult?.cohort;
  const rank = evalResult?.rank ?? undefined;

  const handleRun = async () => {
    setRunning(true);
    try {
      await runJudge({ submissionId });
    } finally {
      setRunning(false);
    }
  };

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
          <StatusPill status="closed">En cola</StatusPill>
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
            <PendingScoreCard running={running} onRun={handleRun} />
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
          {evaluation !== null && (
            <AuthorshipCard
              status={evaluation.authorshipStatus}
              onSet={(status) =>
                setAuthorship({ submissionId, authorshipStatus: status })
              }
            />
          )}
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
  running,
  onRun,
}: {
  running: boolean;
  onRun: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-bold">Evaluación pendiente</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        El AI Judge todavía no ha analizado esta submission. Es un análisis
        estático del repo/link — nunca ejecuta tu código.
      </p>
      <div className="mt-4">
        <Button
          variant="craftSecondary"
          onClick={onRun}
          disabled={running}
        >
          {running ? "Analizando…" : "Ejecutar AI Judge"}
        </Button>
      </div>
    </section>
  );
}

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

// ── Prueba de autoría ─────────────────────────────────────────────────────
function AuthorshipCard({
  status,
  onSet,
}: {
  status: AuthorshipStatus;
  onSet: (status: "video" | "interview" | "approved") => void;
}) {
  const verified = status === "approved";
  return (
    <section className="rounded-xl border border-line-2 bg-panel-2 p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">Prueba de autoría</h2>
        <StatusPill status={AUTHORSHIP_STATUS[status]}>
          {AUTHORSHIP_LABEL[status]}
        </StatusPill>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        El fit y la calidad ya pasaron. Ahora defiende tu autoría (humano):
      </p>

      <div className="flex flex-col gap-2.5">
        <Button
          variant="craftSecondary"
          className="w-full"
          aria-pressed={status === "video"}
          onClick={() => onSet("video")}
        >
          🎥 Grabar video/audio
        </Button>
        <Button
          variant="craftGhost"
          className="w-full"
          aria-pressed={status === "interview"}
          onClick={() => onSet("interview")}
        >
          📅 Entrevista con la startup
        </Button>
      </div>

      <div className="mt-4 rounded-lg bg-ink-2 p-4 text-center">
        <CraftBadge
          variant="auth"
          className={verified ? undefined : "opacity-50"}
        >
          🧬 Autoría verificada
        </CraftBadge>
        <div className="mt-2 text-xs text-faint">
          {verified ? "Conseguida" : "La meta al defender tu autoría"}
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
