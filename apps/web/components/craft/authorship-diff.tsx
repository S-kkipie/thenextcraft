"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * "El diff que te defiende" — el moat del producto, hecho interactivo.
 *
 * La IA no te hace un quiz genérico: saca las preguntas de TU diff. Acá se puede
 * recorrer línea por línea y ver qué te preguntaría cada una. Contarlo en un
 * párrafo no convence a nadie; poder tocarlo, sí.
 *
 * Las líneas con pregunta son <button> de verdad: se recorren con Tab y se
 * activan con Enter, no solo con el mouse.
 */

type Line = {
  /** Número de línea en el archivo resultante. `null` en las eliminadas. */
  n: number | null;
  kind: "add" | "del" | "ctx" | "meta";
  text: string;
  ask?: { tag: string; q: string };
};

const DIFF: Line[] = [
  { n: null, kind: "meta", text: "src/lib/risk-score.ts", },
  { n: null, kind: "meta", text: "@@ -12,4 +12,18 @@" },
  { n: 12, kind: "ctx", text: "export function scoreTransaction(tx: Tx) {" },
  {
    n: null,
    kind: "del",
    text: '  return tx.amount > 10_000 ? "alto" : "bajo";',
    ask: {
      tag: "Contexto",
      q: "Borraste la regla de monto único. ¿Qué caso concreto se te escapaba con ella?",
    },
  },
  {
    n: 13,
    kind: "add",
    text: "  const signals = [velocity(tx), geoMismatch(tx), deviceTrust(tx)];",
    ask: {
      tag: "Diseño",
      q: "Elegiste tres señales. ¿Por qué esas y no el histórico de chargebacks del cliente?",
    },
  },
  { n: 14, kind: "add", text: "" },
  {
    n: 15,
    kind: "add",
    text: "  const weighted = signals.reduce((a, s) => a + s.value * s.weight, 0);",
    ask: {
      tag: "Trade-off",
      q: "Una suma ponderada asume que las señales son independientes. ¿Lo son? ¿Qué pasa si dos se disparan por la misma causa?",
    },
  },
  {
    n: 16,
    kind: "add",
    text: '  if (weighted > THRESHOLD_HIGH) return "alto";',
    ask: {
      tag: "Calibración",
      q: "¿De dónde salió ese umbral? ¿Lo calibraste contra datos o lo pusiste a ojo?",
    },
  },
  { n: 17, kind: "add", text: '  if (weighted > THRESHOLD_MED) return "medio";' },
  { n: 18, kind: "add", text: '  return "bajo";' },
  { n: 19, kind: "ctx", text: "}" },
];

const ASKABLE = DIFF.map((l, i) => (l.ask ? i : -1)).filter((i) => i >= 0);

export function AuthorshipDiff() {
  // Arranca en la primera pregunta: un panel vacío no invita a nada.
  const [active, setActive] = React.useState(ASKABLE[0]);
  const line = DIFF[active];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start">
      {/* ── El diff ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--ink-2)]">
        <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5 text-[12px] text-[var(--faint)]">
          <span className="size-2 rounded-full bg-[var(--phos)]" />
          diff · tu submission
          <span className="ml-auto hidden sm:inline">
            pasa por las líneas marcadas
          </span>
        </div>

        <div className="overflow-x-auto py-2 text-[12.5px] leading-[1.9]">
          {DIFF.map((l, i) => {
            const shared = "flex w-full min-w-max items-start gap-3 px-4 text-left";
            const gutter = (
              <span className="w-6 shrink-0 text-right tabular-nums text-[var(--faint)]">
                {l.n ?? ""}
              </span>
            );

            if (l.kind === "meta") {
              return (
                <div
                  key={i}
                  className={cn(shared, "text-[var(--faint)] select-none")}
                >
                  {gutter}
                  <span>{l.text}</span>
                </div>
              );
            }

            const mark = l.kind === "add" ? "+" : l.kind === "del" ? "−" : " ";
            const tone =
              l.kind === "add"
                ? "text-[var(--text)]"
                : l.kind === "del"
                  ? "text-[var(--rust)]"
                  : "text-[var(--muted)]";
            const bg =
              l.kind === "add"
                ? "bg-[rgb(74_240_126_/_0.05)]"
                : l.kind === "del"
                  ? "bg-[rgb(229_84_75_/_0.06)]"
                  : "";

            if (!l.ask) {
              return (
                <div key={i} className={cn(shared, tone, bg)}>
                  {gutter}
                  <span className="w-3 shrink-0 select-none">{mark}</span>
                  <span className="whitespace-pre">{l.text || " "}</span>
                </div>
              );
            }

            const on = i === active;
            return (
              <button
                key={i}
                type="button"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={cn(
                  shared,
                  tone,
                  bg,
                  "relative cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--phos)]",
                  on
                    ? "bg-[rgb(74_240_126_/_0.13)]"
                    : "hover:bg-[rgb(74_240_126_/_0.08)]",
                )}
              >
                {gutter}
                <span className="w-3 shrink-0 select-none">{mark}</span>
                <span className="whitespace-pre">{l.text || " "}</span>
                <span
                  aria-hidden
                  className={cn(
                    "ml-3 shrink-0 rounded-[4px] px-1.5 text-[10px] leading-[1.6] transition-opacity",
                    on
                      ? "bg-[var(--phos)] text-[var(--ink)] opacity-100"
                      : "bg-[var(--phos-dark)] text-[var(--phos)] opacity-70",
                  )}
                >
                  ?
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lo que la IA te pregunta por esa línea ───────────────────────── */}
      <aside
        className="card card-raised lg:sticky lg:top-24"
        aria-live="polite"
      >
        <span className="eyebrow text-[var(--phos)]">
          Pregunta {ASKABLE.indexOf(active) + 1} de {ASKABLE.length}
        </span>

        <p className="mt-4 text-[15px] leading-[1.6] font-bold">{line.ask?.q}</p>

        <span className="tag-pill mt-4 inline-block">{line.ask?.tag}</span>

        <p className="mt-5 border-t border-[var(--line)] pt-4 text-[13px] leading-relaxed text-[var(--muted)]">
          Estas preguntas no salen de un banco genérico: salen de tu diff. Y no se
          responden con texto —{" "}
          <b className="text-[var(--text)]">respondes en video o audio</b>, o
          escalas a entrevista con la startup.
        </p>
      </aside>
    </div>
  );
}
