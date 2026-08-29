import Link from "next/link";

import { ScoreBar } from "@/components/craft";
import { cn } from "@/lib/utils";

import { levelLabel } from "../model";
import type { DerivedCategory } from "../schema";

/**
 * Card de una categoría del Skill Map. Puramente presentacional: el nivel y la
 * barra ya vienen DERIVADOS de los ships (ver model.ts). El link "Retos para
 * subir" es el camino para ganar más evidencia real.
 */
export function SkillCategoryCard({ category }: { category: DerivedCategory }) {
  const hasEvidence = category.value > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border bg-panel p-[22px] transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(0,0,0,0.8)]",
        category.primary ? "border-sand/40" : "border-line hover:border-line-2",
      )}
    >
      {/* Header: categoría + pill de nivel */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none" aria-hidden>
            {category.emoji}
          </span>
          <h3 className="font-display text-[17px] font-black tracking-tight text-foreground">
            {category.label}
          </h3>
        </div>
        <span
          className={cn(
            "font-display shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-extrabold tabular-nums",
            hasEvidence
              ? "border-sand/30 bg-sand/10 text-sand"
              : "border-line-2 bg-ink-2 text-faint",
          )}
        >
          {levelLabel(category)}
        </span>
      </div>

      <p className="text-[12.5px] leading-snug text-muted-foreground">
        {category.blurb}
      </p>

      {/* Barra derivada 0..100 */}
      <ScoreBar
        className="my-0"
        label={`${category.shipCount} ${category.shipCount === 1 ? "ship" : "ships"}`}
        value={category.value}
        primary={category.primary}
      />

      {/* Evidencia real: tech de tus ships que cayó aquí */}
      {category.matchedTech.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {category.matchedTech.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-line-2 bg-ink-2 px-2 py-0.5 text-[11px] font-semibold text-cream"
            >
              {tech}
            </span>
          ))}
        </div>
      ) : category.key === "fullstack" && category.shipCount > 0 ? (
        <p className="text-[12px] text-muted-foreground">
          {category.shipCount}{" "}
          {category.shipCount === 1 ? "ship end-to-end" : "ships end-to-end"} (frontend
          + backend).
        </p>
      ) : (
        <p className="text-[12px] text-faint">Aún sin tech shipeado aquí.</p>
      )}

      {/* Skills declarados (señal más débil que un ship) */}
      {category.declaredSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-faint">
            Declarado
          </span>
          {category.declaredSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Camino para subir: ganar más evidencia real */}
      <Link
        href="/challenges"
        className="mt-auto pt-1 text-[13px] font-bold text-sand transition-opacity hover:opacity-80"
      >
        Retos para subir →
      </Link>
    </div>
  );
}
