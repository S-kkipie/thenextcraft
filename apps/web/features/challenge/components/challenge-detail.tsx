"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { StatusPill } from "@/components/craft";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@thenextcraft/backend/dataModel";
import { useChallenge } from "@/features/challenge/hooks";
import { initialsOf, daysLeft } from "@/features/challenge/utils";

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}

export function ChallengeDetailView({ id }: { id: Id<"challenges"> }) {
  const challenge = useChallenge(id);

  if (challenge === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (challenge === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Reto no encontrado</h1>
        <Link
          href="/challenges"
          className={buttonVariants({ variant: "craftSecondary" })}
        >
          ← Volver a retos
        </Link>
      </div>
    );
  }

  const days = daysLeft(challenge.deadline);

  return (
    <div className="flex flex-col gap-7">
      <nav className="text-sm text-muted-foreground">
        <Link href="/challenges" className="hover:text-foreground">
          Retos
        </Link>{" "}
        / <span className="text-foreground">{challenge.company}</span>
      </nav>

      <header className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line-2 bg-panel-2 font-display text-lg font-extrabold">
          {initialsOf(challenge.company)}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-muted-foreground">
            {challenge.company}
            {challenge.sector ? ` · ${challenge.sector}` : ""}
          </p>
          <h1 className="text-3xl font-extrabold">{challenge.title}</h1>
          <div>
            <StatusPill
              status={
                challenge.status === "open"
                  ? "live"
                  : challenge.status === "draft"
                    ? "review"
                    : "closed"
              }
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-3 text-lg font-bold">El problema de negocio</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {challenge.businessProblem}
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">Criterios de evaluación</h2>
            <ul className="flex flex-col gap-3">
              {challenge.successCriteria.map((crit, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-sand" />
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-3 text-lg font-bold">Entregable</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Un link público: repo y/o demo. La plataforma{" "}
              <b className="text-foreground">nunca</b> corre tu código —
              evaluamos el link + tu autoría. Prueba de autoría por video/audio o
              entrevista con la startup.
            </p>
            {challenge.tech && challenge.tech.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {challenge.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line-2 bg-panel-2 px-2.5 py-1 text-xs font-bold text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-4 self-start rounded-2xl border border-line-2 bg-panel-2 p-6 lg:sticky lg:top-20">
          {challenge.reward && (
            <div>
              <span className="block font-display text-3xl font-extrabold leading-none text-sand">
                {challenge.reward}
              </span>
              <span className="text-xs text-muted-foreground">recompensa</span>
            </div>
          )}

          <hr className="border-line" />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Abre</dt>
              <dd className="font-display font-bold">
                {fmtDate(challenge._creationTime)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cierra</dt>
              <dd className="font-display font-bold">
                {challenge.deadline ? fmtDate(challenge.deadline) : "—"}
                {days !== undefined ? ` · ${days}d` : ""}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Criterios</dt>
              <dd className="font-display font-bold">
                {challenge.successCriteria.length}
              </dd>
            </div>
          </dl>

          <hr className="border-line" />

          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-faint">
              Cómo se evalúa
            </span>
            <ol className="mt-3 flex flex-col gap-2.5 text-sm">
              <li className="flex gap-2.5">
                <span className="font-mono text-faint">1.</span>
                <span className="text-sand">Fit al reto ★</span>
              </li>
              <li className="flex gap-2.5">
                <span className="font-mono text-faint">2.</span>
                <span>Calidad del build</span>
              </li>
              <li className="flex gap-2.5">
                <span className="font-mono text-faint">3.</span>
                <span>
                  Autoría <span className="text-muted-foreground">(viva humana)</span>
                </span>
              </li>
            </ol>
          </div>

          <hr className="border-line" />

          <Link
            href={`/ship/${challenge._id}`}
            className={buttonVariants({ variant: "craftSecondary" }) + " w-full"}
          >
            Participar →
          </Link>
          <button
            type="button"
            className={buttonVariants({ variant: "craftGhost" }) + " w-full"}
          >
            Guardar
          </button>
        </aside>
      </div>
    </div>
  );
}
