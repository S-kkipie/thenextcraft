"use client";

import { useMemo, useState } from "react";
import { ChallengeCard } from "@/components/craft";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChallenges } from "@/features/challenge/hooks";
import { initialsOf, daysLeft } from "@/features/challenge/utils";

const ALL = "Todos";

export function ChallengeList() {
  const challenges = useChallenges();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(ALL);

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
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No hay retos que coincidan.
        </p>
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
