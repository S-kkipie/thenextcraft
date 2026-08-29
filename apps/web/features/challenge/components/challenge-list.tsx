"use client";

import { useMemo } from "react";
import Link from "next/link";

import { ChallengeCard } from "@/components/craft";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { useQueryParam } from "@/lib/use-query-param";
import { useChallenges } from "@/features/challenge/hooks";
import { initialsOf, daysLeft } from "@/features/challenge/utils";

const ALL = "Todos";

export function ChallengeList() {
  const challenges = useChallenges();
  // Búsqueda y tag viven en la URL: un listado filtrado se puede compartir,
  // sobrevive a recargar y el botón atrás lo deshace.
  const [search, setSearch] = useQueryParam("q", "");
  const [tag, setTag] = useQueryParam("tech", ALL);

  // Tags disponibles derivados del `tech` real de los retos (data-driven).
  const tags = useMemo(() => {
    if (!challenges) return [ALL];
    const set = new Set<string>();
    for (const c of challenges) for (const t of c.tech ?? []) set.add(t);
    return [ALL, ...Array.from(set).sort()];
  }, [challenges]);

  const filtered = useMemo(() => {
    if (!challenges) return [];
    const q = search.trim().toLowerCase();
    return challenges.filter((c) => {
      const matchesTag = tag === ALL || (c.tech ?? []).includes(tag);
      const matchesSearch =
        q === "" ||
        c.title.toLowerCase().includes(q) ||
        c.businessProblem.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [challenges, search, tag]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="eyebrow text-[var(--phos)]">Proof-of-work hiring</span>
        <h1 className="text-4xl font-bold">Retos abiertos</h1>
        <p className="max-w-[56ch] text-muted-foreground">
          Problemas reales de negocio. Shipea una solución, consigue el trabajo.
        </p>
      </header>

      {/* El filtro es una consulta: va dentro del chrome de terminal, con el
          recuento vivo en la barra. */}
      <div className="term">
        <div className="term-bar">
          challenges ~ filtro
          <span className="term-hint">
            {challenges === undefined
              ? "cargando…"
              : `${filtered.length} de ${challenges.length}`}
          </span>
        </div>
        <div className="term-body flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar retos…"
            className="max-w-[280px]"
            aria-label="Buscar retos"
          />
          {tags.map((t) => {
            const active = t === tag;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                aria-pressed={active}
                className={
                  "rounded-[10px] border px-3 py-2 text-[12.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phos)] " +
                  (active
                    ? "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]"
                    : "border-line-2 text-muted-foreground hover:border-[var(--phos)] hover:text-foreground")
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {challenges === undefined ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyBoard />
      ) : filtered.length === 0 ? (
        <NoMatches
          onClear={() => {
            setSearch("");
            setTag(ALL);
          }}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((c) => (
            <ChallengeCard
              key={c._id}
              title={c.title}
              company={c.company}
              sector={c.sector ?? undefined}
              initials={initialsOf(c.company)}
              problem={c.businessProblem}
              reward={c.reward ?? undefined}
              tech={c.tech}
              days={daysLeft(c.deadline ?? undefined)}
              status={c.status}
              href={`/challenges/${c._id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------- estados -------------------------------- */

/*
 * Un tablero vacío que solo dice "no hay retos" no enseña nada a quien llega
 * primero. Este enseña la pieza: la misma ChallengeCard, con un reto de
 * ejemplo marcado como tal y sin link, para que se vea qué publica una startup
 * y qué se lee de un reto antes de que exista el primero.
 */
const DEMO = {
  title: "Bajar el fraude en pagos sin subir el rechazo",
  company: "Nodo Pay",
  sector: "fintech",
  initials: "NP",
  problem:
    "Cada chargeback nos cuesta 40 USD y el equipo de riesgo revisa a mano. Queremos un score que decida solo en los casos claros.",
  reward: "Entrevista",
  tech: ["TypeScript", "Convex", "LLM"],
  participants: 0,
  days: 12,
};

function EmptyBoard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="card flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold">Todavía no hay retos abiertos</p>
          <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
            Así se ve uno cuando una startup lo publica: su problema de negocio
            real, el tech que espera y cuánto queda para cerrar.
          </p>
        </div>
        <Link
          href="/startup/publicar"
          className={buttonVariants({ variant: "craftSecondary" })}
        >
          Publicar un reto <PixelIcon name="arrowRight" size={12} />
        </Link>
      </div>

      <div className="relative grid gap-5 md:grid-cols-2">
        <div className="relative">
          <span className="eyebrow absolute -top-2.5 left-4 z-10 bg-[var(--ink)] px-2 text-[var(--faint)]">
            Ejemplo
          </span>
          {/* Sin href: es una muestra, no debe llevar a ninguna parte. */}
          <ChallengeCard {...DEMO} className="opacity-70" />
        </div>
      </div>
    </div>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="card p-10 text-center">
      <PixelIcon
        name="search"
        size={28}
        className="mx-auto mb-3 text-[var(--faint)]"
      />
      <p className="text-sm text-muted-foreground">
        Ningún reto coincide con ese filtro.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-[13px] font-semibold text-[var(--phos)] underline-offset-4 hover:underline"
      >
        Quitar filtros
      </button>
    </div>
  );
}

/* Skeleton con la forma real de la card, no un rectángulo: así el layout no
   salta cuando llegan los datos. */
function ChallengeCardSkeleton() {
  return (
    <div className="card flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <div className="size-[38px] animate-pulse rounded-[10px] bg-[var(--panel-2)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--panel-2)]" />
          <div className="h-2.5 w-1/5 animate-pulse rounded bg-[var(--panel-2)]" />
        </div>
      </div>
      <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--panel-2)]" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-[var(--panel-2)]" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--panel-2)]" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--panel-2)]" />
        <div className="h-6 w-14 animate-pulse rounded-full bg-[var(--panel-2)]" />
      </div>
      <div className="mt-auto h-9 w-full animate-pulse rounded-[12px] bg-[var(--panel-2)]" />
    </div>
  );
}
