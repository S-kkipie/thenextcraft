"use client";

import Link from "next/link";
import type { Id } from "@thenextcraft/backend/dataModel";
import { ScoreBar, StatusPill } from "@/components/craft";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { JudgeProgress } from "./judge-progress";
import { useEvaluation, useSubmission } from "@/features/evaluation/hooks";

// Color del chip por severidad del hallazgo.
const SEVERITY: Record<string, { label: string; cls: string }> = {
  critical: { label: "Crítico", cls: "bg-destructive/15 text-destructive" },
  high: { label: "Alto", cls: "bg-terra/15 text-terra" },
  medium: { label: "Medio", cls: "bg-sand/15 text-sand" },
  low: { label: "Bajo", cls: "bg-panel-2 text-muted-foreground" },
};

export function EvaluationDetail({
  submissionId,
}: {
  submissionId: Id<"submissions">;
}) {
  const view = useSubmission(submissionId);
  const evalResult = useEvaluation(submissionId);

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
  const evaluation = evalResult?.evaluation ?? null;
  const scored =
    evaluation && typeof evaluation.totalScore === "number" ? evaluation : null;
  const feedbackStatus = evaluation?.feedbackStatus ?? "pending";
  const cohortSize = evalResult?.cohort;
  const rank = evalResult?.rank ?? undefined;
  const findings = scored?.findings ?? [];
  const recommendations = scored?.recommendations ?? [];
  const peerReferences = scored?.peerReferences ?? [];
  const dimensionNotes = scored?.dimensionNotes ?? [];
  const limitations = scored?.limitations ?? [];
  const summary = scored?.summary ?? scored?.rankedReview ?? null;
  const verdict = scored?.verdict ?? null;
  const competitiveNote = scored?.competitiveNote ?? null;

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/challenges" className="hover:text-foreground">
          Retos
        </Link>
        <span className="px-1.5 text-faint">/</span>
        <span className="text-foreground">
          {challenge?.title ?? "Submission"}
        </span>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-bold">
          Evaluación de la submission
        </h1>
        {scored ? (
          <StatusPill status="review">Evaluado</StatusPill>
        ) : (
          <StatusPill status="closed">Sin feedback</StatusPill>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── LEFT ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-6">
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
            <FeedbackPendingCard status={feedbackStatus} />
          )}

          {/* Si hay una review en vuelo, sus fases mandan sobre el copy de
              "pendiente": el juez tarda decenas de segundos y sin esto se lee
              como que se colgó. Se apaga solo al completar. */}
          <JudgeProgress submissionId={submissionId} />
          {scored && summary && (
            <VerdictCard verdict={verdict} summary={summary} />
          )}

          {competitiveNote && (
            <CompetitiveNote note={competitiveNote} rank={rank} cohort={cohortSize} />
          )}

          {dimensionNotes.length > 0 && (
            <DimensionRationales notes={dimensionNotes} />
          )}

          {scored && (
            <JudgeReading strengths={scored.strengths} issues={scored.issues} />
          )}

          {findings.length > 0 && <FeedbackFindings findings={findings} />}

          {limitations.length > 0 && <Limitations items={limitations} />}

          {peerReferences.length > 0 && (
            <PeerReferences references={peerReferences} />
          )}
        </div>

        {/* ── RIGHT sidebar ────────────────────────────────────── */}
        <aside className="flex min-w-0 flex-col gap-6">
          {recommendations.length > 0 && (
            <RecommendationsCard recommendations={recommendations} />
          )}
          {scored && (
            <div className="card border-[var(--phos)]/30 px-5 py-4">
              <div className="flex items-start gap-2">
                <PixelIcon name="trophy" size={14} className="text-[var(--phos)]" />
                <p className="text-sm">
                  Feedback generado por el AI Judge (análisis estático). Nunca
                  ejecuta tu código — solo lee el repo.
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
    <section className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="font-heading text-6xl font-bold tabular-nums leading-none">
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
        <ScoreBar label="Fit al reto" value={fit ?? 0} primary />
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

// ── Veredicto + resumen (el "porqué" global) ────────────────────────────────
const VERDICT: Record<string, { label: string; cls: string }> = {
  excelente: { label: "Excelente", cls: "bg-sage/15 text-sage" },
  solido: { label: "Sólido", cls: "bg-sage/15 text-sage" },
  prometedor: { label: "Prometedor", cls: "bg-sand/15 text-sand" },
  arriesgado: { label: "Arriesgado", cls: "bg-terra/15 text-terra" },
  critico: { label: "Crítico", cls: "bg-destructive/15 text-destructive" },
};
function VerdictCard({
  verdict,
  summary,
}: {
  verdict: string | null;
  summary: string;
}) {
  const v = verdict ? VERDICT[verdict] : null;
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-heading text-lg font-bold">Veredicto del juez</h2>
        {v && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${v.cls}`}
          >
            {v.label}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </section>
  );
}

// ── Por qué cada score (rationale por dimensión) ────────────────────────────
function DimensionRationales({
  notes,
}: {
  notes: { key: string; label: string; score: number; rationale: string }[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 font-heading text-lg font-bold">
        Por qué estos scores
      </h2>
      <p className="mb-5 text-xs text-muted-foreground">
        El razonamiento del juez detrás de cada dimensión.
      </p>
      <div className="flex flex-col gap-4">
        {notes.map((n) => (
          <div key={n.key} className="border-l-2 border-line-2 pl-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-sm font-bold">{n.label}</span>
              <span className="font-heading tabular-nums text-sm font-extrabold">
                {n.score}
                <span className="text-faint text-xs">/100</span>
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {n.rationale}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Limitaciones (qué no se pudo evaluar / qué falta) ───────────────────────
function Limitations({ items }: { items: string[] }) {
  return (
    <section className="rounded-xl border border-line-2 bg-panel-2/40 p-6">
      <h2 className="mb-1 font-heading text-lg font-bold">
        Qué no se pudo evaluar
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        El juez es estático (no ejecuta el código). Esto quedó fuera de alcance.
      </p>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="text-faint">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Feedback aún no disponible ──────────────────────────────────────────────
function FeedbackPendingCard({ status }: { status: string }) {
  const copy =
    status === "generating"
      ? {
          title: "Generando feedback…",
          body: "La startup finalizó el reto. El AI Judge está revisando esta submission — el feedback aparecerá aquí en breve.",
        }
      : status === "failed"
        ? {
            title: "No se pudo generar feedback",
            body: "El repositorio no pudo analizarse (privado o inaccesible). Revisa que el link sea público.",
          }
        : {
            title: "Feedback pendiente",
            body: "El feedback line-level se genera cuando la startup finaliza (cierra) el reto. Se corre el AI Judge sobre todas las submissions a la vez.",
          };
  return (
    <section className="card">
      <h2 className="font-heading text-lg font-bold">{copy.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>
    </section>
  );
}

// ── Lectura del juez (resumen) ──────────────────────────────────────────────
function JudgeReading({
  strengths,
  issues,
}: {
  strengths?: string[];
  issues?: string[];
}) {
  return (
    <section className="card">
      <h2 className="mb-4 font-heading text-lg font-bold">Lectura del juez</h2>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="mb-3 eyebrow text-[var(--phos)]">
            Fuerte
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            {(strengths ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <PixelIcon name="check" size={12} className="text-[var(--phos)]" />
                <span>{s}</span>
              </li>
            ))}
            {(strengths ?? []).length === 0 && (
              <li className="text-muted-foreground">Sin puntos destacados.</li>
            )}
          </ul>
        </div>
        <div>
          <div className="mb-3 eyebrow text-[var(--rust)]">
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

// ── Feedback line-level: hallazgos con código citado ────────────────────────
function FeedbackFindings({
  findings,
}: {
  findings: {
    title: string;
    severity: string;
    dimension: string;
    description: string;
    evidence: {
      path: string;
      startLine: number;
      endLine: number;
      snippet: string;
    }[];
  }[];
}) {
  return (
    <section className="card">
      <h2 className="mb-1 font-heading text-lg font-bold">Feedback del código</h2>
      <p className="mb-5 text-xs text-muted-foreground">
        Qué estuvo mal y dónde — con las líneas exactas que el juez citó.
      </p>
      <div className="flex flex-col gap-5">
        {findings.map((f, i) => {
          const sev = SEVERITY[f.severity] ?? SEVERITY.low;
          return (
            <div
              key={i}
              className="rounded-lg border border-line-2 bg-panel-2/40 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${sev.cls}`}
                >
                  {sev.label}
                </span>
                <span className="text-faint text-[11px] font-semibold uppercase tracking-wide">
                  {f.dimension}
                </span>
                <span className="font-display text-sm font-bold">{f.title}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              <div className="mt-3 flex flex-col gap-3">
                {f.evidence.map((e, j) => (
                  <figure key={j} className="overflow-hidden rounded-md border border-line-2">
                    <figcaption className="bg-ink-2 text-faint flex items-center justify-between px-3 py-1.5 font-mono text-[11px]">
                      <span className="truncate">{e.path}</span>
                      <span className="shrink-0 pl-2">
                        L{e.startLine}
                        {e.endLine !== e.startLine ? `–${e.endLine}` : ""}
                      </span>
                    </figcaption>
                    <pre className="overflow-x-auto bg-background px-3 py-2.5 font-mono text-[12.5px] leading-relaxed">
                      <code>{e.snippet}</code>
                    </pre>
                  </figure>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Por qué este puesto (comparativa global, clave para los que no ganaron) ──
function CompetitiveNote({
  note,
  rank,
  cohort,
}: {
  note: string;
  rank?: number;
  cohort?: number;
}) {
  return (
    <section className="rounded-xl border border-sand/40 bg-sand/5 p-6">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-heading text-lg font-bold">Por qué este puesto</h2>
        {typeof rank === "number" && (
          <span className="bg-sand/15 text-sand rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
            #{rank}
            {typeof cohort === "number" ? ` de ${cohort}` : ""}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
    </section>
  );
}

// ── Peer references (comparativa con otras submissions del mismo reto) ──────
function PeerReferences({
  references,
}: {
  references: {
    builderName: string;
    builderHandle: string | null;
    path: string;
    startLine: number;
    note: string;
    snippet?: string;
  }[];
}) {
  return (
    <section className="card border-[var(--phos)]/30">
      <h2 className="mb-1 font-heading text-lg font-bold">
        Comparado con otras soluciones
      </h2>
      <p className="mb-5 text-xs text-muted-foreground">
        Cómo otros builders del mismo reto resolvieron partes parecidas — con su
        código real.
      </p>
      <div className="flex flex-col gap-3">
        {references.map((r, i) => (
          <div key={i} className="rounded-lg border border-line-2 bg-panel-2/40 p-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold">
                {r.builderName}
              </span>
              {r.builderHandle && (
                <span className="text-faint font-mono text-xs">
                  @{r.builderHandle}
                </span>
              )}
              <span className="text-faint ml-auto font-mono text-[11px]">
                {r.path}:{r.startLine}
              </span>
            </div>
            {r.snippet && (
              <pre className="mt-2.5 overflow-x-auto rounded-md border border-line-2 bg-background px-3 py-2 font-mono text-[12px] leading-relaxed">
                <code>{r.snippet}</code>
              </pre>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Recomendaciones ─────────────────────────────────────────────────────────
function RecommendationsCard({
  recommendations,
}: {
  recommendations: { priority: string; title: string; description: string }[];
}) {
  return (
    <section className="card card-raised">
      <h2 className="mb-4 font-heading text-lg font-bold">Qué mejorar</h2>
      <ul className="flex flex-col gap-3">
        {recommendations.map((r, i) => (
          <li key={i} className="text-sm">
            <div className="font-display font-bold">{r.title}</div>
            <p className="text-muted-foreground mt-0.5 text-[13px]">
              {r.description}
            </p>
          </li>
        ))}
      </ul>
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
    <div className="card p-10 text-center">
      <h1 className="font-heading text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-5">
        <Link href="/challenges">Volver a retos</Link>
      </div>
    </div>
  );
}
