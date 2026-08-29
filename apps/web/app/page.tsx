import Link from "next/link";

import { Beto } from "@/components/craft/beto";
import { LiquidShader } from "@/components/craft/liquid-shader";
import { TiltCard } from "@/components/craft/tilt-card";

/*
 * Landing · arte de docs/design-foundation.html.
 *
 * Tokens, escala tipográfica, profundidad 3D de los botones, radios, badges y
 * el shader líquido salen tal cual de ese archivo. Lo único que sobrevive de la
 * pasada retro es el prompt READY., como guiño a thenextcraft.org.
 *
 * Todo va scopeado bajo `.landing`: la app corre en el tema mono y no hereda
 * nada de acá.
 *
 * Regla de copy: cero métricas inventadas. El reto de Novabank va rotulado como
 * ejemplo porque lo es — viene del propio design foundation.
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
        <div className="mx-auto w-full max-w-[1080px] px-6">
          <Manifesto />
          <Loop />
          <Evaluation />
          <Difference />
          <ForStartups />
        </div>
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ── Piezas compartidas ───────────────────────────────────────────────────── */

function SectionHead({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <div className="eyebrow">
        {n} — {title}
      </div>
      <h2 className="mt-1.5 text-[26px] font-extrabold sm:text-[30px]">
        {children}
      </h2>
    </div>
  );
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-t border-[var(--line)] py-14 first:border-t-0"
    >
      {children}
    </section>
  );
}

/* ── Nav ──────────────────────────────────────────────────────────────────── */

const ANCHORS = [
  { href: "#manifiesto", label: "Manifiesto" },
  { href: "#loop", label: "El loop" },
  { href: "#evaluacion", label: "Evaluación" },
  { href: "#startups", label: "Startups" },
];

function Nav() {
  return (
    <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgb(26_26_23_/_0.72)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[60px] max-w-[1080px] items-center gap-6 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[19px] font-black tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="size-[11px] rounded-[3px] bg-[var(--sand)] shadow-[0_0_14px_rgb(198_161_91_/_0.6)]" />
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
            href="/desafios"
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
      {/* Funde el shader contra el ground para que el texto no pelee con él. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 42%, var(--ink) 94%), linear-gradient(180deg, rgb(19 19 16 / 0.2), rgb(19 19 16 / 0.05) 40%, var(--ink))",
        }}
      />

      <div className="relative mx-auto max-w-[1080px] px-6 pt-[92px] pb-24">
        {/* Lo único que queda del referente C64. */}
        <a
          href="https://thenextcraft.org/es"
          target="_blank"
          rel="noreferrer"
          className="data inline-flex items-center text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--sand)]"
        >
          READY.
          <span className="cursor-block ml-1 inline-block h-[0.9em] w-[0.55em] translate-y-[0.05em] bg-[var(--sand)]" />
        </a>

        <div className="eyebrow mt-6 text-[var(--sand)]">Proof-of-work hiring</div>

        <h1 className="mt-3.5 text-[clamp(38px,7vw,74px)] leading-[1.02] font-black">
          Resuelve el reto real
          <br />
          de una startup.
          <br />
          <span className="bg-gradient-to-r from-[var(--sand)] to-[var(--terra)] bg-clip-text text-transparent">
            Consigue el trabajo.
          </span>
        </h1>

        <p className="mt-5 max-w-[52ch] text-[clamp(16px,2vw,20px)] text-[#C9C3B4]">
          Las startups publican su problema de negocio. Tú shipeas una solución
          pública. La IA filtra y rankea, tú defiendes tu autoría, la startup
          contrata.
        </p>

        <div className="mt-[34px] flex flex-wrap gap-3.5">
          <Link href="/desafios" className="btn btn-primary">
            Explorar retos →
          </Link>
          <a href="#startups" className="btn btn-ghost">
            Publicar reto
          </a>
        </div>

        <p className="mt-[26px] max-w-[60ch] text-[13px] text-[var(--muted)]">
          Streak · Nivel · XP = capa de progreso sobre señales{" "}
          <b className="text-[var(--text)]">reales</b> (shipped · startup-approved
          · AI review · autoría verificada).
        </p>
      </div>
    </header>
  );
}

/* ── 01 · Manifiesto ──────────────────────────────────────────────────────── */

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

function Manifesto() {
  return (
    <Section id="manifiesto">
      <SectionHead n="01" title="Manifiesto">
        Tres cosas que no negociamos
      </SectionHead>

      <ul className="grid gap-5 md:grid-cols-3">
        {CLAIMS.map((claim) => (
          <li key={claim.line} className="card card-hover">
            <p className="text-[19px] leading-snug font-extrabold tracking-[-0.02em]">
              {claim.line}
            </p>
            <p className="mt-2.5 text-sm text-[var(--muted)]">{claim.tail}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ── 02 · El loop + el reto de ejemplo ────────────────────────────────────── */

const LOOP = [
  {
    n: "1",
    title: "La startup publica su reto",
    body: "Un problema real de su negocio, con criterios de éxito medibles.",
  },
  {
    n: "2",
    title: "Muchos builders shipean",
    body: "Cada uno entrega un link público. Repo, deploy, lo que pruebe que existe.",
  },
  {
    n: "3",
    title: "La IA rankea, no decide",
    body: "Hace el filtro pesado. La startup elige entre los que quedan arriba.",
  },
  {
    n: "4",
    title: "Te contratan",
    body: "Por haber resuelto su problema. De regalo queda un portfolio verificable.",
  },
];

function Loop() {
  return (
    <Section id="loop">
      <SectionHead n="02" title="El loop">
        Reto → build → ship → hire
      </SectionHead>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-start">
        <ol className="grid gap-5 sm:grid-cols-2">
          {LOOP.map((step) => (
            <li key={step.n} className="card card-hover">
              <span
                className="grid size-8 place-items-center rounded-[10px] bg-[var(--tan)] text-sm font-black text-[var(--cream)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.n}
              </span>
              <h3 className="mt-3.5 text-[17px] font-extrabold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-[var(--muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <ExampleChallenge />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <span className="eyebrow mr-1">Byproduct verificable</span>
        <span className="badge b-first">✦ First ship</span>
        <span className="badge b-ship">🚀 Shipped</span>
        <span className="badge b-approved">✓ Startup-approved</span>
        <span className="badge b-auth">🧬 Autoría verificada</span>
      </div>
    </Section>
  );
}

/** El reto tal como lo ve un builder. Se inclina siguiendo al puntero. */
function ExampleChallenge() {
  return (
    <TiltCard>
      <div className="card card-raised">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span
            className="grid size-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-[var(--tan)] to-[#7a6844] text-sm font-black text-[var(--cream)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NV
          </span>
          <div style={{ fontFamily: "var(--font-display)" }}>
            <div className="text-sm font-extrabold">Novabank</div>
            <div className="text-xs font-semibold text-[var(--faint)]">
              Fintech · 12 personas
            </div>
          </div>
          <div
            className="ml-auto text-right"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <b className="text-[15px] text-[var(--sand)]">$1,500</b>
            <small className="block text-[11px] text-[var(--faint)]">
              + entrevista
            </small>
          </div>
        </div>

        <h3 className="mb-2 text-[18px] font-extrabold">
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

/* ── 03 · Evaluación ──────────────────────────────────────────────────────── */

const CRITERIA = [
  {
    order: "Primero ★",
    title: "¿Resuelve el problema?",
    body: "Se juzga como producto, no como código. La IA evalúa contra los criterios de la startup; la startup confirma.",
    primary: true,
  },
  {
    order: "Segundo",
    title: "Calidad de build",
    body: "Revisión estática: arquitectura, seguridad, legibilidad. Un score comparable entre todas las submissions.",
    primary: false,
  },
  {
    order: "Tercero",
    title: "Autoría y entendimiento",
    body: "Humano. Defiendes tu diff en video o audio, o escalas a entrevista con la startup. No es un quiz automático.",
    primary: false,
  },
];

function Evaluation() {
  return (
    <Section id="evaluacion">
      <SectionHead n="03" title="Evaluación">
        En este orden, no en otro
      </SectionHead>
      <p className="mb-7 max-w-[60ch] text-[var(--muted)]">
        Review estático — la plataforma nunca corre tu código. El tercer criterio
        es el que ningún competidor tiene.
      </p>

      <div className="grid gap-5 md:grid-cols-3">
        {CRITERIA.map((criterion) => (
          <div
            key={criterion.title}
            className={
              criterion.primary
                ? "card card-hover card-raised"
                : "card card-hover"
            }
          >
            <div
              className="eyebrow"
              style={criterion.primary ? { color: "var(--sand)" } : undefined}
            >
              {criterion.order}
            </div>
            <h3 className="mt-3 text-[17px] font-extrabold">{criterion.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{criterion.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 04 · Posicionamiento ─────────────────────────────────────────────────── */

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
    <Section>
      <SectionHead n="04" title="Posicionamiento">
        No es lo mismo
      </SectionHead>

      <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {COMPARISON.map((row) => (
          <div
            key={row.them}
            className="grid gap-2 py-5 md:grid-cols-[170px_1fr_1fr] md:gap-8"
          >
            <dt
              className="text-sm font-extrabold text-[var(--faint)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {row.them}
            </dt>
            <dd className="text-sm text-[var(--muted)]">{row.theirs}</dd>
            <dd className="text-sm font-semibold">{row.ours}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ── 05 · Startups ────────────────────────────────────────────────────────── */

function ForStartups() {
  return (
    <Section id="startups">
      <SectionHead n="05" title="Para startups">
        Publica el problema que ya tienes
      </SectionHead>

      <div className="card card-raised">
        <p className="max-w-[62ch] text-[var(--muted)]">
          Escribe el reto una vez, con tus criterios de éxito. Muchos builders lo
          resuelven en paralelo y tú ves código que corre — rankeado, con la
          autoría ya verificada. Te quedas con la solución y, si quieres, con
          quien la construyó.
        </p>
        <a
          href="https://github.com/S-kkipie/thenextcraft"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary mt-6"
        >
          Hablar con el equipo →
        </a>
      </div>
    </Section>
  );
}

/* ── CTA final ────────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="border-t border-[var(--line)] bg-[var(--ink-2)]">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-10 px-6 py-20">
        <div>
          <h2 className="max-w-[16ch] text-[clamp(28px,5vw,48px)] leading-[1.05] font-black">
            Deja de postular.{" "}
            <span className="bg-gradient-to-r from-[var(--sand)] to-[var(--terra)] bg-clip-text text-transparent">
              Empieza a shipear.
            </span>
          </h2>
          <Link href="/desafios" className="btn btn-primary mt-8">
            Ver los desafíos abiertos →
          </Link>
        </div>
        <Beto variant="build" className="size-32 shrink-0 sm:size-40" />
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-6 px-6 py-10 text-[13px] text-[var(--faint)]">
        <span
          className="text-base font-black text-[var(--text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Menos escuela, más hacer.
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
          <Link
            href="/desafios"
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
