"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Las tres piezas que acompañan al manifiesto — una por banda, y ninguna se
 * parece a otra: repetir el mismo bloque tres veces sería volver al patrón que
 * quitamos.
 *
 *   01 · EL RETO        una oferta de trabajo que se tacha sola
 *   02 · EL ENTREGABLE  una consola que se NIEGA a ejecutar tu código
 *   03 · LA AUTORÍA     la pregunta de la IA, con el REC esperando
 *
 * Todas arrancan al entrar en pantalla y respetan `prefers-reduced-motion`
 * saltando al estado final en vez de animar.
 */

/**
 * Dispara `start` la primera vez que el bloque entra en pantalla.
 *
 * `start` tiene que venir memoizado (useCallback con deps vacías): si cambiara
 * en cada render, el efecto se re-suscribiría y la animación se repetiría.
 */
function useOnVisible(start: (reduce: boolean) => void) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        // setState vive en este callback, no en el cuerpo del efecto.
        start(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [start]);

  return ref;
}

/* ── 01 · La oferta se tacha sola ─────────────────────────────────────────── */

const BUZZWORDS = [
  "5+ años de experiencia demostrable",
  "Pasión por la excelencia",
  "Título universitario en CS",
  "Inglés B2 certificado",
  "Perfil proactivo y resolutivo",
];

const REAL_PROBLEM =
  '"El 40% de nuestros tickets son \'no entiendo mi factura\'."';

export function JobPostingStrike() {
  const [struck, setStruck] = React.useState(0);
  const [typed, setTyped] = React.useState(0);
  const timers = React.useRef<ReturnType<typeof setInterval>[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearInterval);
  }, []);

  const start = React.useCallback((reduce: boolean) => {
    if (reduce) {
      setStruck(BUZZWORDS.length);
      setTyped(REAL_PROBLEM.length);
      return;
    }
    let n = 0;
    const strike = setInterval(() => {
      n += 1;
      setStruck(n);
      if (n < BUZZWORDS.length) return;
      clearInterval(strike);
      let c = 0;
      const type = setInterval(() => {
        c += 2;
        setTyped(c);
        if (c >= REAL_PROBLEM.length) clearInterval(type);
      }, 28);
      timers.current.push(type);
    }, 420);
    timers.current.push(strike);
  }, []);

  const ref = useOnVisible(start);

  return (
    <div ref={ref} className="card font-[family-name:var(--font-data)] text-[13px]">
      <div className="text-[var(--faint)]">oferta-de-trabajo.txt</div>

      <p className="mt-4 text-[var(--muted)]">Buscamos un dev con:</p>
      <ul className="mt-2 space-y-1.5">
        {BUZZWORDS.map((word, i) => (
          <li
            key={word}
            className={cn(
              "transition-colors duration-300",
              i < struck
                ? "text-[var(--faint)] line-through decoration-[var(--rust)] decoration-2"
                : "text-[var(--text)]",
            )}
          >
            {word}
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-[var(--line)] pt-4 text-[var(--phos)]">
        &gt; resolver ESTO:
      </p>
      <p className="mt-2 min-h-[3.4em] leading-relaxed text-[var(--text)]">
        {REAL_PROBLEM.slice(0, typed)}
        {typed < REAL_PROBLEM.length && struck >= BUZZWORDS.length && (
          <span className="cursor-block ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.1em] bg-[var(--phos)]" />
        )}
      </p>
    </div>
  );
}

/* ── 02 · La consola se niega ─────────────────────────────────────────────── */

type Log = { text: string; tone: "cmd" | "err" | "note" };

const REPO = "github.com/alexrivera/risk-score";

export function RefusingConsole() {
  const [log, setLog] = React.useState<Log[]>([]);
  const [busy, setBusy] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const run = () => {
    if (busy) return;
    setBusy(true);
    setLog([{ text: "$ run submission.zip", tone: "cmd" }]);
    const push = (entry: Log, delay: number) =>
      timers.current.push(
        setTimeout(() => setLog((prev) => [...prev, entry]), delay),
      );
    push({ text: "✗ permission denied", tone: "err" }, 520);
    push(
      { text: "thenextcraft no ejecuta código. Se abre el link:", tone: "note" },
      900,
    );
    timers.current.push(setTimeout(() => setBusy(false), 900));
  };

  return (
    <div className="card font-[family-name:var(--font-data)] text-[13px]">
      <div className="flex items-center gap-2 text-[var(--faint)]">
        <span className="size-2 rounded-full bg-[var(--phos)]" />
        thenextcraft ~ %
      </div>

      <div className="mt-4 min-h-[7.5em] space-y-1.5">
        {log.length === 0 && (
          <p className="text-[var(--faint)]">
            Intenta ejecutar la submission.
          </p>
        )}
        {log.map((line, i) => (
          <p
            key={i}
            className={
              line.tone === "err"
                ? "text-[var(--rust)]"
                : line.tone === "note"
                  ? "text-[var(--muted)]"
                  : "text-[var(--text)]"
            }
          >
            {line.text}
          </p>
        ))}
        {log.length >= 3 && (
          <a
            href={`https://${REPO}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block rounded-[6px] bg-[var(--phos-dark)] px-2.5 py-1 text-[var(--phos)] underline-offset-4 hover:underline"
          >
            {REPO} ↗
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={run}
        className="btn btn-ghost btn-sm mt-4"
        disabled={busy}
      >
        $ run
      </button>
    </div>
  );
}

/* ── 03 · La pregunta espera ──────────────────────────────────────────────── */

const QUESTION = "¿De dónde salió ese umbral? ¿Lo calibraste o lo pusiste a ojo?";
// Alturas fijas: un waveform aleatorio en cada render bailaría en la hidratación.
const BARS = [
  3, 7, 12, 18, 11, 6, 14, 22, 17, 9, 4, 13, 20, 26, 19, 10, 5, 15, 23, 16, 8,
  12, 21, 14, 6, 11, 18, 9,
];

export function RecordingPrompt() {
  const [seconds, setSeconds] = React.useState(0);
  const [live, setLive] = React.useState(false);

  const start = React.useCallback((reduce: boolean) => {
    if (!reduce) setLive(true);
  }, []);
  const ref = useOnVisible(start);

  React.useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setSeconds((s) => (s + 1) % 60), 1000);
    return () => clearInterval(id);
  }, [live]);

  const clock = `00:${String(seconds).padStart(2, "0")}`;

  return (
    <div ref={ref} className="card card-raised">
      <div className="flex items-center gap-2.5 font-[family-name:var(--font-data)] text-[13px]">
        <span
          className={cn(
            "size-2.5 rounded-full bg-[var(--rust)]",
            live && "animate-pulse",
          )}
        />
        <span className="text-[var(--rust)]">REC</span>
        <span className="tabular-nums text-[var(--muted)]">{clock}</span>
        <span className="ml-auto text-[var(--faint)]">risk-score.ts:16</span>
      </div>

      <div
        className="mt-5 flex h-14 items-center gap-[3px]"
        aria-hidden
      >
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn(
              "wave-bar w-[3px] rounded-full bg-[var(--phos)]",
              live && "wave-live",
            )}
            style={{ height: `${h * 2}px`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      <p className="mt-5 text-[15px] leading-[1.6] font-bold">{QUESTION}</p>

      <p className="mt-4 font-[family-name:var(--font-data)] text-[13px] text-[var(--muted)]">
        tu turno
        <span className="cursor-block ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.1em] bg-[var(--phos)]" />
      </p>

      <p className="mt-4 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--faint)]">
        Demo. La defensa real se graba dentro de la app.
      </p>
    </div>
  );
}
