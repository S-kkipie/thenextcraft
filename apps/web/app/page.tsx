import Link from "next/link";

import { Beto } from "@/components/craft/beto";

/*
 * Landing · macrostructure Manifesto.
 *
 * ADN tomado de thenextcraft.org/es: prompt `READY.`, imperativos en mayúsculas,
 * voz que declara antes de vender. La paleta NO se copia (allá es fósforo verde,
 * acá violeta) porque la landing entrega a una app que ya tiene su sistema.
 *
 * Regla de copy: cero métricas inventadas. Todo lo afirmado acá sale del README
 * — el loop, los tres criterios de evaluación, el posicionamiento. Cuando haya
 * builders y contrataciones reales, este es el lugar donde van los números.
 */

export const metadata = {
  title: "thenextcraft · Tu CV no prueba nada",
  description:
    "Las startups publican su problema de negocio real. Shipeas una solución pública. La IA rankea. Te contratan por lo que construiste.",
};

export default function Landing() {
  return (
    <>
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

/* ── N5 · pill flotante ───────────────────────────────────────────────────── */

const ANCHORS = [
  { href: "#loop", label: "El loop" },
  { href: "#evaluacion", label: "Cómo se evalúa" },
  { href: "#startups", label: "Para startups" },
];

function Nav() {
  return (
    <header className="sticky top-4 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-background/80 p-1.5 pl-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 pr-2">
          <svg viewBox="0 0 24 24" className="size-4 text-primary" aria-hidden>
            <path
              d="M3 6l9 5 9-5M3 6v12l9 5 9-5V6M3 6l9-5 9 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-mono text-sm font-medium tracking-tight">
            thenextcraft
          </span>
        </Link>

        <div className="hidden items-center sm:flex">
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="rounded-full px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {anchor.label}
            </a>
          ))}
        </div>

        <Link
          href="/home"
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-primary/85 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Entrar
        </Link>
      </nav>
    </header>
  );
}

/* ── Hero · el Manifesto no pone botones sobre la línea de flotación ──────── */

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-24 pb-28 sm:pt-32 sm:pb-36">
      {/* El prompt de thenextcraft.org, intacto. */}
      <p className="font-mono text-sm text-brand-soft">
        READY.
        <span className="cursor-block ml-0.5 inline-block h-[1em] w-[0.6em] translate-y-[0.12em] bg-brand-soft" />
      </p>

      <h1 className="display mt-8 -rotate-[1.5deg] text-[clamp(2.75rem,11vw,7rem)] leading-[0.92] font-semibold tracking-[-0.03em] uppercase">
        Tu CV no
        <br />
        prueba nada.
        <br />
        <span className="bg-primary px-2 text-primary-foreground">
          Tu código sí.
        </span>
      </h1>

      <p className="mt-12 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        Las startups publican su problema de negocio real. Shipeas una solución
        pública. La IA rankea las submissions. Ellas contratan.
      </p>

      <a
        href="#loop"
        className="mt-10 inline-block font-mono text-sm text-brand-soft underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        ↓ Cómo funciona
      </a>
    </section>
  );
}

/* ── Bandas a sangre · una afirmación por banda ───────────────────────────── */

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
    tail: "La IA saca las preguntas de tu propio diff. Respondes tú. Eso no se puede generar.",
  },
];

function Claims() {
  return (
    <section className="space-y-px">
      {CLAIMS.map((claim, i) => (
        <div
          key={claim.line}
          className={i % 2 === 0 ? "bg-elev" : "bg-primary/10"}
        >
          <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
            <p className="display max-w-3xl text-[clamp(1.5rem,4.5vw,2.75rem)] leading-[1.1] font-medium tracking-tight">
              {claim.line}
            </p>
            <p className="mt-4 max-w-xl text-muted-foreground">{claim.tail}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ── El loop ──────────────────────────────────────────────────────────────── */

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
    <section id="loop" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-24 sm:py-32">
      <h2 className="display text-[clamp(2rem,6vw,3.5rem)] leading-[1] font-semibold tracking-tight uppercase">
        Reto → build → ship → hire
      </h2>

      <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
        {LOOP.map((step) => (
          <li key={step.n}>
            <span className="font-mono text-sm text-brand-soft">{step.n}</span>
            <h3 className="mt-2 text-xl font-medium">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── Evaluación · los tres criterios, en orden de prioridad ───────────────── */

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
    <section id="evaluacion" className="scroll-mt-24 bg-elev">
      <div className="mx-auto max-w-5xl px-5 py-24 sm:py-32">
        <h2 className="display text-[clamp(2rem,6vw,3.5rem)] leading-[1] font-semibold tracking-tight uppercase">
          Cómo se evalúa
        </h2>
        <p className="mt-5 max-w-xl text-muted-foreground">
          En este orden. El tercero es el que ningún competidor tiene.
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {CRITERIA.map((criterion) => (
            <div key={criterion.title} className="border-t-2 border-primary pt-5">
              <span className="font-mono text-xs tracking-wider text-brand-soft uppercase">
                {criterion.label}
              </span>
              <h3 className="mt-2 text-xl font-medium">{criterion.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {criterion.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Diferenciación · posicionamiento real, sin métricas inventadas ───────── */

const COMPARISON = [
  { them: "Forke", theirs: "Micro-tasks con payout instantáneo. Un dev, una task.", ours: "Un reto de negocio, N devs rankeados, y un hire al final." },
  { them: "Kaggle", theirs: "Gana el accuracy de un modelo.", ours: "Gana la solución que le sirve al negocio." },
  { them: "DoraHacks · Devpost", theirs: "Un evento, premios, jurado humano.", ours: "Continuo, con shortlist de IA y contratación." },
];

function Difference() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:py-32">
      <h2 className="display text-[clamp(2rem,6vw,3.5rem)] leading-[1] font-semibold tracking-tight uppercase">
        No es lo mismo
      </h2>

      <dl className="mt-14 divide-y divide-border">
        {COMPARISON.map((row) => (
          <div key={row.them} className="grid gap-2 py-7 md:grid-cols-[180px_1fr_1fr] md:gap-8">
            <dt className="font-mono text-sm text-muted-foreground">{row.them}</dt>
            <dd className="text-muted-foreground">{row.theirs}</dd>
            <dd className="font-medium">{row.ours}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── El otro lado del marketplace ─────────────────────────────────────────── */

function ForStartups() {
  return (
    <section id="startups" className="scroll-mt-24 bg-primary/10">
      <div className="mx-auto max-w-5xl px-5 py-24 sm:py-32">
        <span className="font-mono text-sm text-brand-soft">{"// para startups"}</span>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] font-semibold tracking-tight">
          Publica el problema que ya tienes. Recibe soluciones, no CVs.
        </h2>
        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Escribe el reto una vez, con tus criterios de éxito. Muchos builders lo
          resuelven en paralelo y tú ves código que corre — rankeado, con la
          autoría ya verificada. Te quedas con la solución y, si quieres, con
          quien la construyó.
        </p>
        <a
          href="https://github.com/S-kkipie/thenextcraft"
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-block border-2 border-primary px-6 py-3 font-medium whitespace-nowrap transition-[background-color,transform] hover:bg-primary hover:text-primary-foreground active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Hablar con el equipo
        </a>
      </div>
    </section>
  );
}

/* ── CTA final · el bloque sólido sobredimensionado del Manifesto ─────────── */

function FinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-28 sm:py-36">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <h2 className="display max-w-2xl text-[clamp(2rem,7vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.02em] uppercase">
            Deja de postular.
            <br />
            <span className="text-brand-soft">Empieza a shipear.</span>
          </h2>
          <Link
            href="/desafios"
            className="mt-10 inline-block bg-primary px-8 py-5 text-lg font-medium whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-primary/85 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ver los desafíos abiertos
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
      <div className="mx-auto max-w-5xl px-5 py-16">
        <p className="display max-w-2xl text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          Menos escuela, más hacer.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 font-mono text-sm text-muted-foreground">
          <span>thenextcraft</span>
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
