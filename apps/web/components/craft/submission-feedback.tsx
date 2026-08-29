"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * "El diff que te defiende" — el moat del producto, hecho interactivo.
 *
 * El feedback de la IA no es un score suelto ni un lint genérico: lee TU diff
 * contra los criterios de éxito que escribió la startup. Por eso la pieza
 * cambia de reto: el mismo componente, tres problemas de negocio distintos, y
 * se ve que el feedback habla del reto y no del lenguaje.
 *
 * Las líneas con feedback son <button> de verdad: se recorren con Tab y se
 * activan con Enter, no solo con el mouse.
 */

/** Cómo cae la línea contra el criterio: lo cumple, es un riesgo, o falta. */
type Tone = "ok" | "risk" | "gap";

const TONES: Record<Tone, { glyph: string; label: string; color: string; soft: string }> = {
  ok: {
    glyph: "+",
    label: "Cumple",
    color: "var(--phos)",
    soft: "rgb(74 240 126 / 0.14)",
  },
  risk: {
    glyph: "!",
    label: "Riesgo",
    color: "var(--cyan)",
    soft: "rgb(69 224 208 / 0.14)",
  },
  gap: {
    glyph: "-",
    label: "Falta",
    color: "var(--rust)",
    soft: "rgb(229 84 75 / 0.14)",
  },
};

type Line = {
  /** Número de línea en el archivo resultante. `null` en las eliminadas. */
  n: number | null;
  kind: "add" | "del" | "ctx" | "meta";
  text: string;
  note?: { tag: string; tone: Tone; body: string };
};

type Reto = {
  /** Etiqueta corta del selector. */
  chip: string;
  startup: string;
  problem: string;
  criterion: string;
  diff: Line[];
};

const RETOS: Reto[] = [
  {
    chip: "Fraude en pagos",
    startup: "Nodo Pay · fintech",
    problem:
      "Cada chargeback nos cuesta 40 USD y el equipo de riesgo revisa a mano.",
    criterion:
      "Bajar el fraude un 30% sin subir el rechazo de compras legítimas.",
    diff: [
      { n: null, kind: "meta", text: "src/lib/risk-score.ts" },
      { n: null, kind: "meta", text: "@@ -12,4 +12,18 @@" },
      { n: 12, kind: "ctx", text: "export function scoreTransaction(tx: Tx) {" },
      {
        n: null,
        kind: "del",
        text: '  return tx.amount > 10_000 ? "alto" : "bajo";',
        note: {
          tag: "Criterio · rechazo",
          tone: "ok",
          body: "Matar la regla de monto único ataca la mitad del criterio que casi nadie mira: el rechazo de compras legítimas. Leíste el reto, no solo el título.",
        },
      },
      {
        n: 13,
        kind: "add",
        text: "  const signals = [velocity(tx), geoMismatch(tx), deviceTrust(tx)];",
        note: {
          tag: "Cobertura",
          tone: "gap",
          body: "Tres señales, ninguna de historial. El reto lista los chargebacks previos como dato disponible y el diff no los toca — ahí vive buena parte del 30% que promete el criterio.",
        },
      },
      { n: 14, kind: "add", text: "" },
      {
        n: 15,
        kind: "add",
        text: "  const weighted = signals.reduce((a, s) => a + s.value * s.weight, 0);",
        note: {
          tag: "Build",
          tone: "risk",
          body: "Una suma ponderada asume señales independientes. velocity y deviceTrust se disparan juntas ante el mismo bot: el score se dobla por una sola causa y el falso positivo vuelve por la ventana.",
        },
      },
      {
        n: 16,
        kind: "add",
        text: '  if (weighted > THRESHOLD_HIGH) return "alto";',
        note: {
          tag: "Medible",
          tone: "gap",
          body: "El criterio pide un número. Sin calibrar el umbral contra los 90 días de transacciones que adjunta el reto, no hay manera de decir si esto baja el fraude un 30% o un 3%.",
        },
      },
      { n: 17, kind: "add", text: '  if (weighted > THRESHOLD_MED) return "medio";' },
      { n: 18, kind: "add", text: '  return "bajo";' },
      { n: 19, kind: "ctx", text: "}" },
    ],
  },
  {
    chip: "Churn B2B",
    startup: "Vera · SaaS",
    problem:
      "Perdemos cuentas sin verlas venir: el CSM se entera el día de la renovación.",
    criterion:
      "Avisar 30 días antes, con menos de un falso positivo por semana.",
    diff: [
      { n: null, kind: "meta", text: "src/jobs/churn-watch.ts" },
      { n: null, kind: "meta", text: "@@ -8,3 +8,16 @@" },
      {
        n: 8,
        kind: "ctx",
        text: "export async function weeklyScan(accounts: Account[]) {",
      },
      {
        n: null,
        kind: "del",
        text: "  const risky = accounts.filter((a) => a.logins7d === 0);",
        note: {
          tag: "Criterio · precisión",
          tone: "ok",
          body: "Salir del “cero logins” es lo correcto: esa regla dispara en cada semana de vacaciones y sola ya se comía el presupuesto de un falso positivo semanal.",
        },
      },
      {
        n: 9,
        kind: "add",
        text: "  const risky = accounts",
      },
      {
        n: 10,
        kind: "add",
        text: "    .filter((a) => trend(a.logins, 28) < -0.4)",
        note: {
          tag: "Ventana",
          tone: "risk",
          body: "Necesitas 28 días de historia para que la tendencia signifique algo, así que la primera alerta útil llega a ~2 semanas de la renovación. La ventana de 30 días del criterio no te da.",
        },
      },
      {
        n: 11,
        kind: "add",
        text: "    .filter((a) => a.seatsActive / a.seatsPaid < 0.5);",
        note: {
          tag: "Precisión",
          tone: "ok",
          body: "Cruzar tendencia con asientos ociosos es lo que sostiene el “menos de un falso positivo”. Es la decisión más fuerte del diff y ninguna otra submission la tomó.",
        },
      },
      { n: 12, kind: "add", text: "" },
      {
        n: 13,
        kind: "add",
        text: "  await notifyCsm(risky);",
        note: {
          tag: "Producto",
          tone: "gap",
          body: "Avisas, pero no dices por qué. El reto pedía “qué le digo a la cuenta cuando la llamo”: una alerta sin el motivo que la disparó no cambia la conversación, y eso era el objetivo.",
        },
      },
      { n: 14, kind: "ctx", text: "}" },
    ],
  },
  {
    chip: "Ruta de reparto",
    startup: "Andes Last-Mile · logística",
    problem:
      "El despachador arma 40 paradas a mano cada mañana. Le toma dos horas.",
    criterion:
      "Ruta ordenada en menos de 2 s, respetando las ventanas horarias del cliente.",
    diff: [
      { n: null, kind: "meta", text: "src/routing/plan.ts" },
      { n: null, kind: "meta", text: "@@ -21,5 +21,17 @@" },
      {
        n: 21,
        kind: "ctx",
        text: "export function planRoute(stops: Stop[], depot: Point) {",
      },
      {
        n: null,
        kind: "del",
        text: "  return stops.sort((a, b) => a.toDepot - b.toDepot);",
        note: {
          tag: "Contexto",
          tone: "ok",
          body: "Ordenar por distancia al depósito no es una ruta, es una lista. Reemplazarlo era el paso obligado y lo diste primero, antes de optimizar nada.",
        },
      },
      {
        n: 22,
        kind: "add",
        text: "  const order = nearestNeighbor(stops, depot);",
        note: {
          tag: "Criterio · 2 s",
          tone: "ok",
          body: "Vecino más cercano sobre 40 paradas corre en microsegundos. Elegir heurística en vez de óptimo es exactamente la lectura que pedía el límite de tiempo del reto.",
        },
      },
      {
        n: 23,
        kind: "add",
        text: "  const tuned = twoOpt(order, { maxPasses: 3 });",
        note: {
          tag: "Trade-off",
          tone: "risk",
          body: "2-opt te acerca al óptimo, y es la única parte del diff cuyo costo crece con la entrada. Sin un corte por tiempo, el día que entren 80 paradas te pasas del presupuesto que prometiste.",
        },
      },
      { n: 24, kind: "add", text: "" },
      {
        n: 25,
        kind: "add",
        text: "  // TODO: ventanas horarias del cliente",
        note: {
          tag: "Criterio · ventanas",
          tone: "gap",
          body: "El TODO es honesto, pero las ventanas horarias son la otra mitad del reto. Una ruta corta que llega fuera de horario no le ahorra las dos horas al despachador: se las devuelve en reprogramaciones.",
        },
      },
      { n: 26, kind: "add", text: "  return tuned;" },
      { n: 27, kind: "ctx", text: "}" },
    ],
  },
];

/** Índices de las líneas que llevan feedback, en orden de aparición. */
const noted = (reto: Reto) =>
  reto.diff.map((l, i) => (l.note ? i : -1)).filter((i) => i >= 0);

export function SubmissionFeedback() {
  const [retoIdx, setRetoIdx] = React.useState(0);
  const reto = RETOS[retoIdx];
  const marks = React.useMemo(() => noted(reto), [reto]);

  // Arranca en la primera línea con feedback: un panel vacío no invita a nada.
  const [active, setActive] = React.useState(marks[0]);

  const pickReto = (i: number) => {
    setRetoIdx(i);
    setActive(noted(RETOS[i])[0]);
  };

  const line = reto.diff[active];
  const note = line?.note;
  const tone = TONES[note?.tone ?? "ok"];

  return (
    <div>
      {/* ── Selector de reto ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {RETOS.map((r, i) => {
          const on = i === retoIdx;
          return (
            <button
              key={r.chip}
              type="button"
              onClick={() => pickReto(i)}
              aria-pressed={on}
              className={cn(
                "rounded-[10px] border px-3.5 py-2 text-[12.5px] font-bold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phos)]",
                on
                  ? "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]"
                  : "border-[var(--line-2)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--phos)] hover:text-[var(--text)]",
              )}
            >
              {r.chip}
            </button>
          );
        })}
      </div>

      {/* ── El reto que se está evaluando ─────────────────────────────────── */}
      <div className="card mt-4">
        <span className="eyebrow">{reto.startup}</span>
        <p className="mt-3 text-[15px] leading-[1.6] font-bold">
          {reto.problem}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
          <span className="text-[var(--phos)]">Criterio de éxito · </span>
          {reto.criterion}
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start">
        {/* ── El diff ────────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--ink-2)]">
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5 text-[12px] text-[var(--faint)]">
            <span className="size-2 rounded-full bg-[var(--phos)]" />
            diff · tu submission
            <span className="ml-auto hidden sm:inline">
              pasa por las líneas marcadas
            </span>
          </div>

          <div className="overflow-x-auto py-2 text-[12.5px] leading-[1.9]">
            {reto.diff.map((l, i) => {
              const shared =
                "flex w-full min-w-max items-start gap-3 px-4 text-left";
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
              const text =
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

              if (!l.note) {
                return (
                  <div key={i} className={cn(shared, text, bg)}>
                    {gutter}
                    <span className="w-3 shrink-0 select-none">{mark}</span>
                    <span className="whitespace-pre">{l.text || " "}</span>
                  </div>
                );
              }

              const on = i === active;
              const lineTone = TONES[l.note.tone];
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
                    text,
                    bg,
                    "relative cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--phos)]",
                    on ? "bg-[var(--panel-2)]" : "hover:bg-[var(--panel)]",
                  )}
                >
                  {/* La barra al costado tiñe la línea activa con su veredicto. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px] transition-opacity"
                    style={{
                      background: lineTone.color,
                      opacity: on ? 1 : 0,
                    }}
                  />
                  {gutter}
                  <span className="w-3 shrink-0 select-none">{mark}</span>
                  <span className="whitespace-pre">{l.text || " "}</span>
                  <span
                    aria-hidden
                    className="ml-3 shrink-0 rounded-[4px] px-1.5 text-[10px] leading-[1.6] font-bold transition-opacity"
                    style={{
                      background: on ? lineTone.color : lineTone.soft,
                      color: on ? "var(--ink)" : lineTone.color,
                      opacity: on ? 1 : 0.75,
                    }}
                  >
                    {lineTone.glyph}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── El feedback de esa línea ───────────────────────────────────── */}
        <aside className="card card-raised lg:sticky lg:top-24" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-[var(--phos)]">
              Feedback {marks.indexOf(active) + 1} de {marks.length}
            </span>
            <span
              className="rounded-[6px] px-2 py-1 text-[11px] font-bold"
              style={{ background: tone.soft, color: tone.color }}
            >
              {tone.glyph} {tone.label}
            </span>
          </div>

          <p className="mt-4 text-[13px] font-bold text-[var(--faint)]">
            {note?.tag}
          </p>
          <p className="mt-2 text-[14px] leading-[1.65]">{note?.body}</p>

          <p className="mt-5 border-t border-[var(--line)] pt-4 text-[13px] leading-relaxed text-[var(--muted)]">
            El feedback no sale de un banco genérico: sale de tu diff, leído
            contra los criterios de <b className="text-[var(--text)]">ese</b>{" "}
            reto. Lo que no se genera es la respuesta —{" "}
            <b className="text-[var(--text)]">la defiendes en video o audio</b>,
            o escalas a entrevista con la startup.
          </p>
        </aside>
      </div>
    </div>
  );
}
