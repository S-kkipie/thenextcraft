import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Beto } from "@/components/craft/beto";
import { ActivityHeatmap, ScoreHistogram, ScoreRadar } from "@/components/craft/charts";
import { GithubMark } from "@/components/craft/labels";
import { scoreTone } from "@/components/craft/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authorship, evaluation, getChallenge } from "@/lib/mock/data";
import type { EvaluationCriterion } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/desafios/[slug]/evaluacion">) {
  const { slug } = await params;
  return { title: `Evaluación · ${getChallenge(slug).title}` };
}

export default async function EvaluationPage({
  params,
}: PageProps<"/desafios/[slug]/evaluacion">) {
  const { slug } = await params;
  const challenge = getChallenge(slug);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
      <Link
        href={`/desafios/${challenge.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {challenge.title}
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:items-start">
        <TechnicalJudge />
        <ProofOfAuthorship />
      </div>
    </main>
  );
}

/* ── Etapa 2 de la evaluación: calidad de build, juzgada por la IA ─────────── */

const VERDICT_TONE: Record<EvaluationCriterion["verdict"], string> = {
  Excelente: "text-success",
  "Muy bueno": "text-primary",
  Bueno: "text-warning",
  Mejorable: "text-destructive",
};

function TechnicalJudge() {
  return (
    <section className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl bg-primary/12 px-6 py-6 ring-1 ring-primary/25">
        <div className="max-w-[68%]">
          <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
            <Sparkles className="size-5 text-primary" aria-hidden />
            AI Technical Judge
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Revisión completada</p>
        </div>
        <Beto
          variant="cheer"
          className="pointer-events-none absolute -right-2 -bottom-5 size-32"
        />
      </header>

      <Card>
        <CardContent className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr] md:items-center">
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-heading text-6xl font-semibold tabular-nums",
                    scoreTone(evaluation.totalScore),
                  )}
                >
                  {evaluation.totalScore}
                </span>
                <span className="text-xl text-muted-foreground">/ 100</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{evaluation.percentile}</p>
            </div>
            <ScoreRadar criteria={evaluation.criteria} className="max-w-[280px]" />
          </div>

          <ul className="space-y-1">
            {evaluation.criteria.map((criterion) => (
              <li
                key={criterion.label}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full bg-current",
                      VERDICT_TONE[criterion.verdict],
                    )}
                    aria-hidden
                  />
                  {criterion.label}
                </span>
                <span
                  className={cn("font-medium", VERDICT_TONE[criterion.verdict])}
                >
                  {criterion.verdict}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Judge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-relaxed text-muted-foreground">{evaluation.summary}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <FeedbackList
              title="Lo que hiciste muy bien"
              items={evaluation.strengths}
              tone="success"
            />
            <FeedbackList
              title="Oportunidades de mejora"
              items={evaluation.improvements}
              tone="warning"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparado con otros builders</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución de las {evaluation.totalSubmissions} submissions del desafío.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-semibold tabular-nums">
              #{evaluation.rank}
            </span>
            <span className="text-sm text-muted-foreground">
              de {evaluation.totalSubmissions} builders
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
              <TrendingUp className="size-3.5" aria-hidden />
              {evaluation.percentile}
            </span>
          </div>
          <ScoreHistogram
            distribution={evaluation.distribution}
            yourScore={evaluation.totalScore}
          />
        </CardContent>
      </Card>
    </section>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? { box: "bg-success/8 ring-success/20", mark: "text-success" }
      : { box: "bg-warning/8 ring-warning/20", mark: "text-warning" };

  return (
    <div className={cn("space-y-2.5 rounded-xl p-4 ring-1", styles.box)}>
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className={cn("mt-0.5 size-3.5 shrink-0", styles.mark)} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Etapa 3: autoría. La capa anti-AI-slop, y el puente al hire ──────────── */

function ProofOfAuthorship() {
  const rows = [
    { label: "Commits", value: authorship.commits },
    { label: "Líneas de código cambiadas", value: authorship.linesChanged.toLocaleString("es") },
    { label: "Archivos creados", value: authorship.filesCreated },
    { label: "Archivos modificados", value: authorship.filesModified },
    { label: "Tiempo de desarrollo", value: authorship.devTimeHours },
  ];

  return (
    <section className="space-y-6 xl:sticky xl:top-6">
      <header>
        <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
          <BadgeCheck className="size-5 text-success" aria-hidden />
          Proof of Authorship
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Verificación completada</p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-success/15">
            <ShieldCheck className="size-6 text-success" aria-hidden />
          </span>
          <div>
            <div className="font-heading text-3xl font-semibold tabular-nums text-success">
              {authorship.confidence}%
            </div>
            <div className="text-sm text-muted-foreground">Confianza de autoría</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-muted">
                <GithubMark />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Conectado a GitHub</div>
                <div className="text-sm font-medium">{authorship.githubHandle}</div>
              </div>
            </div>
            <a
              href={authorship.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
            >
              Ver en GitHub
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>

          <Separator />

          <dl className="divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad de desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap activity={authorship.activity} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de la IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {authorship.analysis}
          </p>
          {!authorship.suspicious && (
            <p className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success ring-1 ring-success/20">
              <Check className="size-3.5" aria-hidden />
              No se detectaron patrones sospechosos
            </p>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">
            La verificación automática es solo el primer filtro: la defensa final de tu
            código es en video o entrevista con la startup.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
