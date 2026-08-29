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
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-sand">
          Proof-of-work hiring
        </span>
        <h1 className="text-4xl font-extrabold">Retos abiertos</h1>
        <p className="max-w-[56ch] text-muted-foreground">
          Problemas reales de negocio. Shipea una solución, consigue el trabajo.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
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
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors " +
                (active
                  ? "border-sand text-sand"
                  : "border-line text-muted-foreground hover:text-foreground hover:border-line-2")
              }
            >
              {t}
            </button>
          );
        })}
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
              reward={c.reward}
              tech={c.tech}
              days={daysLeft(c.deadline)}
              status={c.status}
              href={`/challenges/${c._id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
