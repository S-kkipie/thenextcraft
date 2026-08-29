import Link from "next/link";

import { AuthorshipDiff } from "@/components/craft/authorship-diff";
import { Beto } from "@/components/craft/beto";
import { HeroType } from "@/components/craft/hero-type";
import { LiquidShader } from "@/components/craft/liquid-shader";
import {
  JobPostingStrike,
  RecordingPrompt,
  RefusingConsole,
} from "@/components/craft/manifesto-asides";
import { Reveal } from "@/components/craft/reveal";
import { ShortlistCanvas } from "@/components/craft/shortlist-canvas";
import { TiltCard } from "@/components/craft/tilt-card";

/*
 * Landing · arte de docs/design-foundation.html, estructura editorial asimétrica.
 *
 * La versión anterior repetía el mismo compás cinco veces (eyebrow → h2 → fila
 * de cards iguales), que es la firma más reconocible de una página generada.
 * Acá cada sección tiene una forma distinta a propósito:
 *
 *   manifiesto     bandas a sangre, tipografía enorme, alineación alternada
 *   shortlist      canvas de partículas a todo el ancho
 *   loop           riel horizontal + bloque desbalanceado
 *   evaluación     díptico con columna izquierda pegajosa
 *   posicionamiento tabla desnuda, sin cards
 *   startups       panel desplazado a media sangre
 *
 * Todo scopeado bajo `.landing`: la app corre en el tema mono y no hereda nada.
 * Regla de copy: cero métricas inventadas.
 */

export const metadata = {
  title: "thenextcraft · Resuelve el reto. Consigue el trabajo.",
  description:
    "Las startups publican su problema de negocio. Shipeas una solución pública. La IA filtra y rankea, tú defiendes tu autoría, la startup contrata.",
};

export default function Landing() {
  return (
    <div className="landing flex flex-1 flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Manifesto />
        <Shortlist />
        <Loop />
        <Evaluation />
        <Defense />
        <Difference />
        <ForStartups />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

const WRAP = "mx-auto w-full max-w-[1120px] px-6";

/* ── Nav ──────────────────────────────────────────────────────────────────── */

const ANCHORS = [
  { href: "#manifiesto", label: "Manifiesto" },
  { href: "#filtro", label: "El filtro" },
  { href: "#loop", label: "El loop" },
  { href: "#defensa", label: "La defensa" },
  { href: "#startups", label: "Startups" },
];

function Nav() {
  return (
    <div className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgb(11_14_11_/_0.78)] backdrop-blur-[14px]">
      <div className={`${WRAP} flex h-[60px] items-center gap-6`}>
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] leading-[1.4] font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="size-[11px] rounded-[3px] bg-[var(--phos)] shadow-[0_0_14px_rgb(74_240_126_/_0.6)]" />
          thenextcraft
        </Link>

        <nav className="hidden gap-[18px] text-sm font-semibold text-[var(--muted)] md:flex">
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="whitespace-nowrap transition-colors hover:text-[var(--text)]"
            >
              {anchor.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/home" className="btn btn-ghost btn-sm">
            Entrar
          </Link>
          <Link
            href="/challenges"
            className="btn btn-secondary btn-sm hidden sm:inline-flex"
          >
            Explorar retos →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <header className="relative overflow-hidden">
      <LiquidShader className="absolute inset-0 block size-full" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 42%, var(--ink) 94%), linear-gradient(180deg, rgb(19 19 16 / 0.2), rgb(19 19 16 / 0.05) 40%, var(--ink))",
        }}
      />
      <HeroType />
    </header>
  );
}

/* ── Manifiesto · bandas a sangre, alineación alternada ───────────────────── */

const CLAIMS = [
  {
    label: "El reto",
    line: "El reto no es un ejercicio. Es su problema de negocio.",
    tail: "Criterios de éxito medibles, escritos por la startup que los tiene.",
    bg: "bg-[var(--ink-2)]",
    aside: <JobPostingStrike />,
  },
  {
    label: "El entregable",
    line: "La plataforma nunca corre tu código.",
    tail: "El entregable es un link público. Un repo, un deploy — algo que existe.",
    bg: "bg-[var(--panel)]",
    aside: <RefusingConsole />,
  },
  {
    label: "La autoría",
    line: "La defensa de tu código es tuya. En video.",
    tail: "La IA saca las preguntas de tu propio diff. Respondes tú. Eso no se genera.",
    bg: "bg-[var(--ink-2)]",
    aside: <RecordingPrompt />,
  },
];

function Manifesto() {
  return (
    <section id="manifiesto" className="scroll-mt-16">
      {CLAIMS.map((claim, i) => {
        // La banda del medio invierte el orden: el texto salta al otro lado.
        const flipped = i % 2 === 1;
        return (
          <div
            key={claim.line}
            className={`${claim.bg} border-t border-[var(--line)]`}
          >
            <div className={`${WRAP} py-16 sm:py-20`}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal
                  from={flipped ? "right" : "left"}
                  className={flipped ? "lg:order-2 lg:text-right" : ""}
                >
                  <span className="eyebrow text-[var(--phos)]">
                    0{i + 1} — {claim.label}
                  </span>
                  <p className="mt-4 text-[clamp(18px,3vw,34px)] leading-[1.35] font-bold text-balance">
                    {claim.line}
                  </p>
                  <p
                    className={`mt-5 max-w-[46ch] text-[var(--muted)] ${flipped ? "lg:ml-auto" : ""}`}
                  >
                    {claim.tail}
                  </p>
                </Reveal>

                <Reveal
                  from={flipped ? "left" : "right"}
                  delay={140}
                  className={flipped ? "lg:order-1" : ""}
                >
                  {claim.aside}
                </Reveal>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ── El filtro · la pieza estrella ────────────────────────────────────────── */

function Shortlist() {
  return (
    <section
      id="filtro"
      className="scroll-mt-16 border-t border-[var(--line)] bg-[var(--ink)]"
    >
      <div className={WRAP}>
        <ShortlistCanvas
          header={
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow">El filtro</span>
                <h2 className="mt-2 max-w-[14ch] text-[clamp(18px,3vw,34px)] leading-[1.3] font-bold">
                  La IA rankea.{" "}
                  <span className="bg-gradient-to-r from-[var(--phos)] to-[var(--cyan)] bg-clip-text text-transparent">
                    La startup decide.
                  </span>
                </h2>
              </div>
              <p className="max-w-[34ch] text-sm text-[var(--muted)] sm:text-right">
                Cien personas resuelven el mismo problema de negocio. Nadie tiene
                tiempo de leer cien repos — ese es el trabajo que hace la IA, y
                solo ese.
              </p>
            </div>
          }
        />
      </div>
    </section>
  );
}

/* ── El loop · riel horizontal + bloque desbalanceado ─────────────────────── */

const LOOP = [
  {
    n: "01",
    title: "La startup publica su reto",
    body: "Un problema real de su negocio, con criterios de éxito medibles. No un enunciado de examen.",
  },
  {
    n: "02",
    title: "Muchos builders shipean",
    body: "Cada uno entrega un link público. Un repo, un deploy — lo que pruebe que existe.",
  },
  {
    n: "03",
    title: "La IA rankea, no decide",
    body: "Hace el filtro pesado con un score comparable. La startup elige entre los que quedan arriba.",
  },
  {
    n: "04",
    title: "Te contratan",
    body: "Por haber resuelto su problema. De regalo queda un portfolio verificable.",
  },
];

function Loop() {
  return (
    <section
      id="loop"
      className="scroll-mt-16 border-t border-[var(--line)] py-20 sm:py-28"
    >
      <div className={WRAP}>
        <Reveal>
          <span className="eyebrow">El loop</span>
          <h2 className="mt-2 text-[clamp(18px,3vw,34px)] leading-[1.3] font-bold">
            Reto &gt; build &gt; ship &gt; hire
          </h2>
        </Reveal>
      </div>

      {/* Riel: los pasos avanzan en una línea, no en una rejilla. */}
      <div className="rail mt-12 overflow-x-auto pb-4">
        <ol className="flex min-w-max gap-0 px-6 lg:justify-center">
          {LOOP.map((step, i) => (
            <li
              key={step.n}
              className="relative w-[260px] shrink-0 border-l border-[var(--line)] px-6 sm:w-[290px]"
            >
              <Reveal delay={i * 90}>
                <span
                  className="text-[13px] font-bold tracking-[0.1em] text-[var(--phos)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.n}
                </span>
                <h3 className="mt-3 text-[15px] leading-[1.45] font-bold">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      {/* Bloque desbalanceado: la card pesa a un lado, el texto al otro. */}
      <div className={`${WRAP} mt-16`}>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,400px)_1fr]">
          <Reveal from="left">
            <ExampleChallenge />
          </Reveal>

          <Reveal from="right" delay={120}>
            <div className="lg:pl-6">
              <h3 className="max-w-[18ch] text-[clamp(16px,2.4vw,26px)] leading-[1.35] font-bold">
                El byproduct: un portfolio que nadie puede inflar.
              </h3>
              <p className="mt-4 max-w-[48ch] text-[var(--muted)]">
                Cada ship deja rastro verificable — el repo, el review de la IA, la
                aprobación de la startup y tu defensa en video. Los badges no son
                puntos: son eventos que ocurrieron.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="badge b-first">✦ First ship</span>
                <span className="badge b-ship">🚀 Shipped</span>
                <span className="badge b-approved">✓ Startup-approved</span>
                <span className="badge b-auth">🧬 Autoría verificada</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** El reto tal como lo ve un builder. Se inclina siguiendo al puntero. */
function ExampleChallenge() {
  return (
    <TiltCard>
      <div className="card card-raised">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span
            className="grid size-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-[var(--phos-dark)] to-[#265c37] text-sm font-bold text-[var(--cream)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NV
          </span>
          <div style={{ fontFamily: "var(--font-display)" }}>
            <div className="text-sm font-bold">Novabank</div>
            <div className="text-xs font-semibold text-[var(--faint)]">
              Fintech · 12 personas
            </div>
          </div>
          <div
            className="ml-auto text-right"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <b className="text-[15px] text-[var(--phos)]">$1,500</b>
            <small className="block text-[11px] text-[var(--faint)]">
              + entrevista
            </small>
          </div>
        </div>

        <h3 className="mb-2 text-[15px] leading-[1.4] font-bold">
          Detectar transacciones fraudulentas en el dashboard
        </h3>
        <p className="mb-3.5 text-sm text-[var(--muted)]">
          Nuestro equipo de soporte revisa fraude a mano. Queremos una vista que
          priorice los casos más riesgosos con una explicación clara.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="tag-pill">Next.js</span>
          <span className="tag-pill">Data viz</span>
          <span className="tag-pill">LLM</span>
        </div>

        <div className="my-3.5 flex flex-wrap gap-4 text-[12.5px] font-semibold text-[var(--faint)]">
          <span>
            👥 <b className="text-[var(--text)]">42</b> participantes
          </span>
          <span>
            ⏱ <b className="text-[var(--text)]">10</b> días
          </span>
          <span>
            🎯 <b className="text-[var(--text)]">4</b> criterios
          </span>
        </div>

        <span className="btn btn-secondary w-full justify-center">
          Participar →
        </span>
        <p className="mt-3 text-center text-[11px] text-[var(--faint)]">
          Reto de ejemplo — así se ve la pieza core del loop.
        </p>
      </div>
    </TiltCard>
  );
}

/* ── Evaluación · díptico con columna pegajosa ────────────────────────────── */

const CRITERIA = [
  {
    n: "Primero",
    title: "¿Resuelve el problema?",
    body: "Se juzga como producto, no como código. La IA evalúa contra los criterios de la startup; la startup confirma.",
    primary: true,
  },
  {
    n: "Segundo",
    title: "Calidad de build",
    body: "Revisión estática: arquitectura, seguridad, legibilidad. Un score comparable entre todas las submissions.",
    primary: false,
  },
  {
    n: "Tercero",
    title: "Autoría y entendimiento",
    body: "Humano. Defiendes tu diff en video o audio, o escalas a entrevista con la startup. No es un quiz automático.",
    primary: false,
  },
];

function Evaluation() {
  return (
    <section className="border-t border-[var(--line)] bg-[var(--ink-2)] py-20 sm:py-28">
      <div className={`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,360px)_1fr]`}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal from="left">
            <span className="eyebrow">Evaluación</span>
            <h2 className="mt-2 text-[clamp(18px,2.8vw,30px)] leading-[1.35] font-bold">
              En este orden,
              <br />
              no en otro.
            </h2>
            <p className="mt-5 max-w-[38ch] text-[var(--muted)]">
              Review estático — la plataforma nunca corre tu código. El tercer
              criterio es el que ningún competidor tiene.
            </p>
          </Reveal>
        </div>

        <ol>
          {CRITERIA.map((criterion, i) => (
            <li
              key={criterion.title}
              className="border-t border-[var(--line)] py-8 first:border-t-0 first:pt-0"
            >
              <Reveal delay={i * 110}>
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-[13px] font-bold tracking-[0.12em] uppercase ${
                      criterion.primary
                        ? "text-[var(--phos)]"
                        : "text-[var(--faint)]"
                    }`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {criterion.n}
                    {criterion.primary && " ★"}
                  </span>
                </div>
                <h3 className="mt-3 text-[clamp(15px,2vw,21px)] font-bold">
                  {criterion.title}
                </h3>
                <p className="mt-3 max-w-[54ch] leading-relaxed text-[var(--muted)]">
                  {criterion.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── La defensa · la prueba del tercer criterio ───────────────────────────── */

function Defense() {
  return (
    <section
      id="defensa"
      className="scroll-mt-16 border-t border-[var(--line)] py-20 sm:py-28"
    >
      <div className={WRAP}>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow text-[var(--phos)]">La defensa</span>
              <h2 className="mt-3 max-w-[20ch] text-[clamp(18px,3vw,34px)] leading-[1.3] font-bold">
                El diff que te defiende
              </h2>
            </div>
            <p className="max-w-[38ch] text-sm text-[var(--muted)] sm:text-right">
              Cualquiera puede generar código. Nadie puede generar las razones por
              las que lo escribió así. Ahí es donde se cae el AI-slop.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <AuthorshipDiff />
        </Reveal>
      </div>
    </section>
  );
}

/* ── Posicionamiento · tabla desnuda ──────────────────────────────────────── */

const COMPARISON = [
  {
    them: "Forke",
    theirs: "Micro-tasks con payout instantáneo. Un dev, una task.",
    ours: "Un reto de negocio, N devs rankeados, y un hire al final.",
  },
  {
    them: "Kaggle",
    theirs: "Gana el accuracy de un modelo.",
    ours: "Gana la solución que le sirve al negocio.",
  },
  {
    them: "DoraHacks · Devpost",
    theirs: "Un evento, premios, jurado humano.",
    ours: "Continuo, con shortlist de IA y contratación.",
  },
];

function Difference() {
  return (
    <section className="border-t border-[var(--line)] py-20 sm:py-28">
      <div className={WRAP}>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[clamp(18px,3vw,34px)] leading-[1.3] font-bold">
              No es lo mismo
            </h2>
            <span className="eyebrow">04 — Posicionamiento</span>
          </div>
        </Reveal>

        <dl className="mt-10 border-t border-[var(--line)]">
          {COMPARISON.map((row, i) => (
            <Reveal key={row.them} delay={i * 80}>
              <div className="row-hover grid gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[190px_1fr_1fr] md:gap-8">
                <dt
                  className="text-sm font-bold text-[var(--faint)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {row.them}
                </dt>
                <dd className="text-sm text-[var(--muted)]">{row.theirs}</dd>
                <dd className="text-sm font-bold">{row.ours}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Startups · panel desplazado a media sangre ───────────────────────────── */

function ForStartups() {
  return (
    <section id="startups" className="scroll-mt-16 border-t border-[var(--line)]">
      <div className="grid lg:grid-cols-2">
        <div className="flex items-center bg-[var(--panel)] px-6 py-20 sm:py-28 lg:justify-end">
          <Reveal from="left">
            <div className="w-full max-w-[520px] lg:pr-12">
              <span className="eyebrow text-[var(--phos)]">Para startups</span>
              <h2 className="mt-3 text-[clamp(17px,2.6vw,28px)] leading-[1.35] font-bold">
                Publica el problema que ya tienes.
              </h2>
              <p className="mt-5 text-[var(--muted)]">
                Escríbelo una vez, con tus criterios de éxito. Muchos builders lo
                resuelven en paralelo y tú ves código que corre — rankeado, con la
                autoría ya verificada. Te quedas con la solución y, si quieres, con
                quien la construyó.
              </p>
              <a
                href="https://github.com/S-kkipie/thenextcraft"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary mt-8"
              >
                Hablar con el equipo →
              </a>
            </div>
          </Reveal>
        </div>

        <div className="flex items-center px-6 py-16 lg:py-28">
          <Reveal from="right" className="w-full">
            <div className="w-full max-w-[460px] lg:pl-4">
              <div className="card">
                <span className="eyebrow">Lo que recibes</span>
                <ul className="mt-5 space-y-4 text-sm">
                  {[
                    ["Soluciones, no CVs", "Código público que puedes abrir hoy."],
                    ["Ya rankeadas", "El review estático llega hecho."],
                    ["Con autoría probada", "Sabes quién escribió qué, y por qué."],
                  ].map(([title, tail]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--phos)]" />
                      <span>
                        <b className="block font-bold">{title}</b>
                        <span className="text-[var(--muted)]">{tail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── CTA final ────────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="border-t border-[var(--line)] bg-[var(--ink-2)]">
      <div
        className={`${WRAP} flex flex-wrap items-center justify-between gap-10 py-20 sm:py-24`}
      >
        <Reveal from="left">
          <h2 className="max-w-[16ch] text-[clamp(20px,3.4vw,40px)] leading-[1.3] font-bold">
            Deja de postular.{" "}
            <span className="bg-gradient-to-r from-[var(--phos)] to-[var(--cyan)] bg-clip-text text-transparent">
              Empieza a shipear.
            </span>
          </h2>
          <Link href="/challenges" className="btn btn-primary mt-8">
            Ver los desafíos abiertos →
          </Link>
        </Reveal>
        <Beto variant="build" className="size-32 shrink-0 sm:size-40" />
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div
        className={`${WRAP} flex flex-wrap items-center justify-between gap-6 py-10 text-[13px] text-[var(--faint)]`}
      >
        <span
          className="text-base font-bold text-[var(--text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Menos escuela, más hacer.
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
          <Link
            href="/challenges"
            className="whitespace-nowrap hover:text-[var(--text)]"
          >
            Desafíos
          </Link>
          <Link href="/home" className="whitespace-nowrap hover:text-[var(--text)]">
            Entrar
          </Link>
          <a
            href="https://thenextcraft.org/es"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap hover:text-[var(--text)]"
          >
            The Next Craft
          </a>
        </div>
      </div>
    </footer>
  );
}
