import type { FunctionReturnType } from "convex/server";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  FileCode2,
  Gauge,
  Lightbulb,
  ShieldCheck,
  Timer,
} from "lucide-react";

import { api } from "@thenextcraft/backend/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TechnicalReview = NonNullable<
  FunctionReturnType<typeof api.technicalJudge.get>
>;
type CompletedReview = TechnicalReview & {
  repository: NonNullable<TechnicalReview["repository"]>;
  coverage: NonNullable<TechnicalReview["coverage"]>;
  result: NonNullable<TechnicalReview["result"]>;
  usage: NonNullable<TechnicalReview["usage"]>;
};

const dimensionCopy = {
  correctness: { label: "Correctness", weight: "30%" },
  security: { label: "Seguridad", weight: "20%" },
  architecture: { label: "Arquitectura", weight: "20%" },
  codeQuality: { label: "Calidad de código", weight: "20%" },
  performance: { label: "Performance", weight: "10%" },
} as const;

const severityCopy = {
  critical: { label: "Crítico", className: "bg-destructive text-white" },
  high: { label: "Alto", className: "bg-destructive/10 text-destructive" },
  medium: { label: "Medio", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  low: { label: "Bajo", className: "bg-muted text-muted-foreground" },
} as const;

function evidenceUrl(review: CompletedReview, path: string, start: number, end: number) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const lines = end > start ? `#L${start}-L${end}` : `#L${start}`;
  return `${review.repository.url}/blob/${review.repository.commitSha}/${encodedPath}${lines}`;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative size-40" aria-label={`Score general: ${score} de 100`}>
      <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-foreground transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <span className="text-4xl font-semibold tracking-tight">{score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">score técnico</p>
        </div>
      </div>
    </div>
  );
}

export function ReviewReport({ review }: { review: CompletedReview }) {
  const { result, coverage, usage } = review;

  return (
    <section className="space-y-6" aria-labelledby="review-result-title">
      <Card className="overflow-hidden border-foreground/15">
        <CardContent className="grid gap-8 py-4 md:grid-cols-[200px_1fr] md:items-center">
          <div className="grid place-items-center border-b pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <ScoreRing score={result.overallScore} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="capitalize">{result.verdict}</Badge>
              <Badge variant="outline">Technical review only</Badge>
            </div>
            <h2 id="review-result-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Veredicto técnico
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{result.summary}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(dimensionCopy).map(([key, copy]) => {
          const dimension = result.dimensions[key as keyof typeof result.dimensions];
          return (
            <Card key={key} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{copy.label}</CardTitle>
                  <Badge variant="outline">{copy.weight}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{dimension.score}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{dimension.rationale}</p>
                <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Confianza {dimension.confidence}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Hallazgos ({result.findings.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="coverage">Cobertura</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="size-5" />
                Puntos fuertes
              </CardTitle>
              <CardDescription>Lo mejor sustentado por la muestra revisada.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {result.strengths.map((strength) => (
                  <li key={strength} className="flex gap-3 rounded-lg border bg-muted/20 p-4">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-background">
                      <Check className="size-3" />
                    </span>
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-3 pt-4">
          {result.findings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No se conservaron hallazgos con evidencia válida en la muestra.
              </CardContent>
            </Card>
          ) : (
            result.findings.map((finding, index) => {
              const severity = severityCopy[finding.severity as keyof typeof severityCopy] ?? severityCopy.low;
              return (
                <Card key={`${finding.title}-${index}`}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn("border-0", severity.className)}>{severity.label}</Badge>
                      <Badge variant="outline">{dimensionCopy[finding.dimension as keyof typeof dimensionCopy]?.label ?? finding.dimension}</Badge>
                    </div>
                    <CardTitle className="pt-2 text-lg">{finding.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{finding.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {finding.evidence.map((evidence) => (
                      <div key={`${evidence.path}-${evidence.startLine}`} className="overflow-hidden rounded-lg border">
                        <a
                          href={evidenceUrl(review, evidence.path, evidence.startLine, evidence.endLine)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 bg-muted/50 px-3 py-2 text-xs font-medium hover:underline"
                        >
                          <span className="min-w-0 truncate font-mono">{evidence.path}:{evidence.startLine}</span>
                          <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                        <pre className="overflow-x-auto p-3 text-xs leading-5"><code>{evidence.snippet}</code></pre>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="size-5" />
                Próximas mejoras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {result.recommendations.map((recommendation, index) => (
                <div key={`${recommendation.title}-${index}`}>
                  {index > 0 ? <Separator /> : null}
                  <div className="grid gap-3 py-5 sm:grid-cols-[40px_1fr_auto] sm:items-start">
                    <span className="grid size-8 place-items-center rounded-full bg-muted font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{recommendation.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{recommendation.priority}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileCode2, label: "Archivos analizados", value: coverage.analyzedFiles },
              { icon: Gauge, label: "Candidatos", value: coverage.candidateFiles },
              { icon: AlertTriangle, label: "Omitidos", value: coverage.omittedFiles },
              { icon: Timer, label: "Duración", value: `${(usage.durationMs / 1000).toFixed(1)}s` },
            ].map((metric) => (
              <Card key={metric.label} size="sm">
                <CardContent className="flex items-center gap-3">
                  <metric.icon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xl font-semibold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Transparencia de la revisión</CardTitle>
              <CardDescription>
                {coverage.analyzedCharacters.toLocaleString()} caracteres · modelo {usage.model} · {usage.totalTokens.toLocaleString()} tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                <li>El código no fue ejecutado; este reporte es una revisión estática.</li>
                <li>Business fit y proof of authorship no fueron evaluados.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
