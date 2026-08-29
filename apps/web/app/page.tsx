import Link from "next/link";

import { Beto } from "@/components/craft/beto";

/*
 * Landing · macrostructure Manifesto, piel retro-terminal.
 *
 * ADN muestreado en vivo de thenextcraft.org/es: IBM Plex Mono en todo, papel
 * #1A1A17 sobre tinta crema, wordmark manuscrito, números de línea BASIC como
 * etiquetas de sección, botones-bloque con sombra dura, retícula CRT, dither.
 * Sin boot sequence: el jurado entra directo al contenido.
 *
 * Regla de copy: cero métricas inventadas. Todo sale del README.
 */

export const metadata = {
  title: "thenextcraft · Tu CV no prueba nada",
  description:
    "Las startups publican su problema de negocio real. Shipeas una solución pública. La IA rankea. Te contratan por lo que construiste.",
};

export default function Landing() {
  return (
    <>
      <Ticker />
      <Nav />
      <main className="flex-1">
        <Hero />
        <Claims />
        <Loop />
        <Evaluation />
        <Difference />
        <ForStartups />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

/* ── Piezas del sistema retro ─────────────────────────────────────────────── */

/** Etiqueta de sección como una línea de BASIC. El número va en bitmap. */
function BasicLine({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-baseline gap-3 text-sm tracking-wider text-muted-foreground uppercase">
      <span className="font-pixel text-brand">{n}</span>
      <span>{children}</span>
    </p>
  );
}

/** Banda dithered de 1 bit: el divisor entre secciones. */
function DitherRule() {
  return <div className="dither h-2 w-full opacity-25" aria-hidden />;
}

const BLOCK_BUTTON =
  "shadow-hard inline-flex items-center gap-2 border border-foreground bg-primary px-6 py-3 text-sm font-semibold tracking-widest whitespace-nowrap text-primary-foreground uppercase transition-[transform,box-shadow] hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_0_var(--dim)] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const GHOST_BUTTON =
  "shadow-hard-sm inline-flex items-center gap-2 border border-foreground/50 px-5 py-2.5 text-sm font-semibold tracking-widest whitespace-nowrap uppercase transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/* ── Ticker + nav N8 terminal ─────────────────────────────────────────────── */

function Ticker() {
  return (
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 overflow-hidden px-5 py-1.5 text-[11px] tracking-widest text-dim uppercase">
        <span className="whitespace-nowrap">
          Proof-of-work hiring · Lima · Remoto
        </span>
        <span className="font-pixel whitespace-nowrap">0 00 00111</span>
      </div>
    </div>
  );
}

const ANCHORS = [
  { href: "#manifiesto", label: "Manifiesto" },
  { href: "#loop", label: "El loop" },
  { href: "#evaluacion", label: "Rúbrica" },
  { href: "#startups", label: "Startups" },
];

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
        <Link href="/" className="font-script text-xl leading-none">
          thenextcraft
        </Link>

        <div className="hidden flex-1 items-center gap-5 md:flex">
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="text-xs tracking-widest whitespace-nowrap text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {anchor.label}
            </a>
          ))}
        </div>

        <Link
          href="/home"
          className="ml-auto border border-foreground/50 px-3 py-1.5 text-xs tracking-widest whitespace-nowrap uppercase transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:ml-0"
        >
          Entrar
        </Link>
        <Link href="/desafios" className={`${BLOCK_BUTTON} hidden sm:inline-flex`}>
          Postular →
        </Link>
      </nav>
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="crt-grid relative">
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <p className="text-sm tracking-widest text-brand">
          READY.
          <span className="cursor-block ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.1em] bg-brand" />
        </p>

        <h1 className="display mt-10 text-[clamp(2.25rem,8.5vw,5.5rem)] leading-[1.02] font-bold tracking-[-0.02em] uppercase">
          Tu CV no
          <br />
          prueba nada.
          <br />
          <span className="bg-foreground px-2 text-background">Tu código sí.</span>
        </h1>

        <p className="mt-12 max-w-lg leading-relaxed text-muted-foreground">
          Las startups publican su problema de negocio real. Shipeas una solución
          pública. La IA rankea las submissions. Ellas contratan.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/desafios" className={BLOCK_BUTTON}>
            Ver desafíos →
          </Link>
          <a href="#loop" className={GHOST_BUTTON}>
            Cómo funciona ↓
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── 10 · El manifiesto, una afirmación por banda ─────────────────────────── */

const CLAIMS = [
  {
    line: "El reto no es un ejercicio. Es su problema de negocio.",
    tail: "Criterios de éxito medibles, escritos por la startup que los tiene.",
  },
  {
    line: "La plataforma nunca corre tu código.",
    tail: "El entregable es un link público. Un repo, un deploy — algo que existe.",
  },
  {
    line: "La defensa de tu código es tuya. En video.",
    tail: "La IA saca las preguntas de tu propio diff. Respondes tú. Eso no se genera.",
  },
];

function Claims() {
  return (
    <section id="manifiesto" className="scroll-mt-16 border-y border-border bg-elev">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <BasicLine n={10}>{'PRINT "MANIFIESTO"'}</BasicLine>

        <ul className="mt-12 space-y-12">
          {CLAIMS.map((claim) => (
            <li key={claim.line} className="border-l-2 border-brand pl-6">
              <p className="display max-w-3xl text-[clamp(1.25rem,3.6vw,2.25rem)] leading-[1.2] font-semibold tracking-tight">
                {claim.line}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {claim.tail}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <DitherRule />
    </section>
  );
}

/* ── 20 · El loop ─────────────────────────────────────────────────────────── */

const LOOP = [
  {
    n: "1.0",
    title: "La startup publica su reto",
    body: "Un problema real de su negocio, con criterios de éxito medibles. No un enunciado de examen.",
  },
  {
    n: "2.0",
    title: "Muchos builders shipean",
    body: "Cada uno resuelve a su manera y entrega un link público. Repo, deploy, lo que pruebe que existe.",
  },
  {
    n: "3.0",
    title: "La IA rankea, no decide",
    body: "Hace el filtro pesado — de cien a diez, con un score comparable. La startup elige entre esos diez.",
  },
  {
    n: "4.0",
    title: "Te contratan",
    body: "No por tu CV: por haber resuelto su problema. De regalo queda un portfolio verificable.",
  },
];

function Loop() {
  return (
    <section id="loop" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:py-32">
      <BasicLine n={20}>{"GOSUB EL LOOP"}</BasicLine>

      <h2 className="display mt-8 text-[clamp(1.5rem,5vw,3rem)] leading-[1.05] font-bold tracking-tight uppercase">
        Reto → build → ship → hire
      </h2>

      <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {LOOP.map((step) => (
          <li key={step.n} className="border-t border-border pt-5">
            <span className="font-pixel text-sm text-brand">{step.n}</span>
            <h3 className="mt-3 font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── 30 · Rúbrica ─────────────────────────────────────────────────────────── */

const CRITERIA = [
  {
    label: "Primero",
    title: "¿Resuelve el problema?",
    body: "Se juzga como producto, no como código. La IA evalúa contra los criterios de la startup; la startup confirma.",
  },
  {
    label: "Segundo",
    title: "Calidad de build",
    body: "Revisión estática: arquitectura, seguridad, legibilidad. Un score comparable entre todas las submissions.",
  },
  {
    label: "Tercero",
    title: "Autoría y entendimiento",
    body: "Humano. Defiendes tu diff en video o audio, o escalas a entrevista con la startup. No es un quiz automático.",
  },
];

function Evaluation() {
  return (
    <section id="evaluacion" className="scroll-mt-16 border-y border-border bg-elev">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <BasicLine n={30}>{"IF RESUELVE THEN HIRE"}</BasicLine>

        <h2 className="display mt-8 text-[clamp(1.5rem,5vw,3rem)] leading-[1.05] font-bold tracking-tight uppercase">
          Cómo se evalúa
        </h2>
        <p className="mt-5 max-w-xl text-sm text-muted-foreground">
          En este orden. El tercero es el que ningún competidor tiene.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {CRITERIA.map((criterion) => (
            <div
              key={criterion.title}
              className="border border-border bg-background p-6"
            >
              <span className="font-pixel text-xs text-brand uppercase">
                {criterion.label}
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{criterion.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {criterion.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 40 · Posicionamiento ─────────────────────────────────────────────────── */

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
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <BasicLine n={40}>{"REM NO ES LO MISMO"}</BasicLine>

      <h2 className="display mt-8 text-[clamp(1.5rem,5vw,3rem)] leading-[1.05] font-bold tracking-tight uppercase">
        No es lo mismo
      </h2>

      <dl className="mt-12 divide-y divide-border border-y border-border">
        {COMPARISON.map((row) => (
          <div
            key={row.them}
            className="grid gap-2 py-6 md:grid-cols-[180px_1fr_1fr] md:gap-8"
          >
            <dt className="text-xs tracking-widest text-brand uppercase">
              {row.them}
            </dt>
            <dd className="text-sm text-muted-foreground">{row.theirs}</dd>
            <dd className="text-sm font-semibold">{row.ours}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── 50 · El otro lado del marketplace ────────────────────────────────────── */

function ForStartups() {
  return (
    <section id="startups" className="scroll-mt-16 border-y border-border bg-elev">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <BasicLine n={50}>{"INPUT TU PROBLEMA"}</BasicLine>

        <h2 className="display mt-8 max-w-3xl text-[clamp(1.35rem,4.2vw,2.5rem)] leading-[1.12] font-bold tracking-tight">
          Publica el problema que ya tienes. Recibe soluciones, no CVs.
        </h2>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Escribe el reto una vez, con tus criterios de éxito. Muchos builders lo
          resuelven en paralelo y tú ves código que corre — rankeado, con la
          autoría ya verificada. Te quedas con la solución y, si quieres, con
          quien la construyó.
        </p>
        <a
          href="https://github.com/S-kkipie/thenextcraft"
          target="_blank"
          rel="noreferrer"
          className={`${GHOST_BUTTON} mt-10`}
        >
          Hablar con el equipo →
        </a>
      </div>
    </section>
  );
}

/* ── CTA final ────────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="crt-grid">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-10 px-5 py-28 sm:py-36">
        <div>
          <h2 className="display max-w-2xl text-[clamp(1.75rem,6.5vw,4rem)] leading-[1.02] font-bold tracking-[-0.02em] uppercase">
            Deja de postular.
            <br />
            <span className="text-brand">Empieza a shipear.</span>
          </h2>
          <Link href="/desafios" className={`${BLOCK_BUTTON} mt-10 px-8 py-4`}>
            Ver los desafíos abiertos →
          </Link>
        </div>
        <Beto variant="build" className="size-32 shrink-0 sm:size-40" />
      </div>
    </section>
  );
}

/* ── Ft5 · footer declaración ─────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p className="font-script text-3xl leading-tight sm:text-4xl">
          Menos escuela, más hacer.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 text-xs tracking-widest text-muted-foreground uppercase">
          <span className="font-pixel">thenextcraft</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/desafios" className="whitespace-nowrap hover:text-foreground">
              Desafíos
            </Link>
            <Link href="/home" className="whitespace-nowrap hover:text-foreground">
              Entrar
            </Link>
            <a
              href="https://thenextcraft.org/es"
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap hover:text-foreground"
            >
              The Next Craft
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
