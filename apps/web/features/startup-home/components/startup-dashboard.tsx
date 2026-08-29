"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import { useCurrentUser } from "@/lib/current-user";
import { StatTile, StatusPill } from "@/components/craft";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/craft/pixel-icon";

// Etiqueta + color por estado del feedback (se genera al finalizar el reto).
const FEEDBACK: Record<string, { label: string; cls: string }> = {
  pending: { label: "Sin feedback", cls: "bg-panel-2 text-muted-foreground" },
  generating: { label: "Generando…", cls: "bg-sand/15 text-sand" },
  ready: { label: "Feedback listo", cls: "bg-sage/15 text-sage" },
  failed: { label: "Sin repo", cls: "bg-panel-2 text-muted-foreground" },
};

export function StartupDashboard() {
  const { user, userId } = useCurrentUser();
  const data = useQuery(
    api.startup.dashboard,
    userId ? { startupId: userId } : "skip",
  );

  if (!userId) {
    return (
      <Notice>
        <Link href="/login" className="text-sand font-semibold">
          Entra
        </Link>{" "}
        para ver tu panel de startup.
      </Notice>
    );
  }
  if (user && user.role !== "startup") {
    return <Notice>Esta vista es para cuentas de startup.</Notice>;
  }

  const stats = data?.stats;
  const challenges = data?.challenges ?? [];
  const pendingActions = data?.pendingActions ?? [];
  const pipeline = data?.pipeline;
  const topCandidates = data?.topCandidates ?? [];
  const recentSubmissions = data?.recentSubmissions ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Hola, {user?.companyName ?? user?.name ?? "startup"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Tus retos de negocio y candidatos.
          </p>
        </div>
        <Link
          href="/startup/publicar"
          className={cn(buttonVariants({ variant: "craftSecondary" }))}
        >
          Publicar reto
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile value={stats?.activeRetos ?? "—"} label="RETOS ACTIVOS" accent="sand" />
        <StatTile value={stats?.totalSubmissions ?? "—"} label="SUBMISSIONS" />
        <StatTile value={stats?.shortlisted ?? "—"} label="EN SHORTLIST" accent="sage" />
      </div>

      {/* ── Acciones pendientes ─────────────────────────────────────────── */}
      {pendingActions.length > 0 && (
        <Section title="Acciones pendientes">
          <div className="flex flex-col gap-2">
            {pendingActions.map((a, i) => (
              <Link
                key={i}
                href={a.href}
                className="card card-hover flex items-center gap-3 p-3.5"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-sm",
                    a.kind === "feedback"
                      ? "bg-sage/15 text-sage"
                      : "bg-sand/15 text-sand",
                  )}
                >
                  <PixelIcon name={a.kind === "feedback" ? "search" : "check"} size={12} />
                </span>
                <span className="flex-1 text-sm">{a.label}</span>
                <PixelIcon name="arrowRight" size={11} className="text-faint" />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ── Pipeline de hiring ──────────────────────────────────────────── */}
      {pipeline && (
        <Section
          title="Pipeline"
          hint="Rankeas con la IA; al finalizar el reto se genera el feedback line-level."
        >
          <div className="grid grid-cols-3 gap-3">
            <PipelineTile
              value={pipeline.shortlisted}
              label="SHORTLISTED"
              sub="rankeados por la IA"
            />
            <PipelineTile
              value={pipeline.feedbackReady}
              label="CON FEEDBACK"
              sub="review line-level lista"
              accent="sage"
            />
            <PipelineTile
              value={pipeline.closedRetos}
              label="RETOS CERRADOS"
              sub="finalizados"
              accent="sand"
            />
          </div>
        </Section>
      )}

      {/* ── Tus retos ───────────────────────────────────────────────────── */}
      <Section title="Tus retos">
        {data === undefined ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : challenges.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-muted-foreground text-sm">Aún no publicaste retos.</p>
            <Link
              href="/startup/publicar"
              className={cn(buttonVariants({ variant: "craft" }), "mt-4")}
            >
              Publicar tu primer reto
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {challenges.map((c) => (
              <Link
                key={c._id}
                href={`/startup/shortlist/${c._id}`}
                className="card card-hover flex items-center gap-4 p-4"
              >
                <div className="flex-1">
                  <div className="font-display font-bold">{c.title}</div>
                  <div className="text-faint text-xs">
                    {c.submissionsCount} submissions · {c.shortlistedCount} en shortlist
                  </div>
                </div>
                <StatusPill status={c.status === "open" ? "live" : "closed"} />
                {c.reward && (
                  <div className="font-display text-sand text-sm">{c.reward}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* ── Top candidatos ──────────────────────────────────────────────── */}
      {topCandidates.length > 0 && (
        <Section
          title="Top candidatos"
          hint="Mejores builders across tus retos, rankeados por la IA."
        >
          <div className="flex flex-col gap-2">
            {topCandidates.map((cand) => {
              const fb = FEEDBACK[cand.feedbackStatus] ?? FEEDBACK.pending;
              return (
                <Link
                  key={cand.submissionId}
                  href={`/startup/shortlist/${cand.challengeId}`}
                  className="card card-hover flex items-center gap-4 p-4"
                >
                  <div className="font-display bg-ink-2 text-foreground grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold">
                    {(cand.builderName[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display truncate font-bold">
                      {cand.builderName}
                      {cand.builderHandle && (
                        <span className="text-faint ml-1.5 font-mono text-xs font-normal">
                          @{cand.builderHandle}
                        </span>
                      )}
                    </div>
                    <div className="text-faint truncate text-xs">
                      {cand.challengeTitle}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex",
                      fb.cls,
                    )}
                  >
                    {fb.label}
                  </span>
                  <div className="text-right">
                    <div className="font-display text-sand text-lg font-bold tabular-nums leading-none">
                      {cand.aiMatch}
                    </div>
                    <div className="text-faint text-[10px] font-semibold">AI MATCH</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Submissions recientes ───────────────────────────────────────── */}
      {recentSubmissions.length > 0 && (
        <Section title="Submissions recientes">
          <div className="flex flex-col gap-2">
            {recentSubmissions.map((s) => (
              <Link
                key={s.submissionId}
                href={`/startup/shortlist/${s.challengeId}`}
                className="card card-hover flex items-center gap-4 p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display truncate font-bold">
                    {s.builderName}
                    {s.builderHandle && (
                      <span className="text-faint ml-1.5 font-mono text-xs font-normal">
                        @{s.builderHandle}
                      </span>
                    )}
                  </div>
                  <div className="text-faint truncate text-xs">{s.challengeTitle}</div>
                </div>
                {s.score != null ? (
                  <div className="text-right">
                    <div className="font-display text-foreground text-sm font-bold tabular-nums leading-none">
                      {s.score}
                    </div>
                    <div className="text-faint text-[10px] font-semibold">SCORE</div>
                  </div>
                ) : (
                  <span className="bg-panel-2 text-muted-foreground rounded-full px-2.5 py-1 text-xs font-bold">
                    En cola
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-[15px] font-bold">{title}</h2>
        {hint && <p className="text-faint text-xs">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function PipelineTile({
  value,
  label,
  sub,
  accent = "default",
}: {
  value: number;
  label: string;
  sub: string;
  accent?: "default" | "sand" | "sage";
}) {
  const color =
    accent === "sand" ? "text-sand" : accent === "sage" ? "text-sage" : "";
  return (
    <div className="border-line-2 bg-ink-2 rounded-xl border p-4 text-center">
      <b className={cn("font-display block text-[26px] tabular-nums", color)}>
        {value}
      </b>
      <span className="text-foreground block text-[11px] font-bold">{label}</span>
      <span className="text-faint text-[10px]">{sub}</span>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="card text-muted-foreground p-8 text-center text-sm">
      {children}
    </div>
  );
}
