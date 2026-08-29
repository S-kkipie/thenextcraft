"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Id } from "@thenextcraft/backend/dataModel";
import { AlertTriangle, ArrowRight, Bot, GitFork, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  repositoryUrlInput,
  reviewStages,
  type RepositoryUrlInput,
} from "@/features/technical-judge/schema";
import {
  useStartTechnicalReview,
  useTechnicalReview,
} from "@/features/technical-judge/hooks";
import { RepositoryCard } from "@/features/technical-judge/components/repository-card";
import { ReviewProgress } from "@/features/technical-judge/components/review-progress";
import { ReviewReport } from "@/features/technical-judge/components/review-report";

export function JudgeScreen() {
  const [reviewId, setReviewId] = useState<Id<"technicalReviews"> | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const startReview = useStartTechnicalReview();
  const review = useTechnicalReview(reviewId);
  const form = useForm<RepositoryUrlInput>({
    resolver: zodResolver(repositoryUrlInput),
    defaultValues: { repoUrl: "" },
  });

  const isRunning =
    review !== undefined &&
    review !== null &&
    review.status !== "completed" &&
    review.status !== "failed";

  const submit = form.handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const nextReviewId = await startReview({
        repoUrl: values.repoUrl,
        requestId: crypto.randomUUID(),
      });
      setReviewId(nextReviewId);
    } catch {
      setSubmissionError(
        "No pudimos iniciar la revisión. Verifica la URL y la conexión con Convex.",
      );
    }
  });

  return (
    <main className="space-y-8">
      <section className="grid gap-8 border-b pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Bot data-icon="inline-start" />
              AI Technical Judge
            </Badge>
            <Badge variant="outline">Public repos · no OAuth</Badge>
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Convierte un repositorio en un veredicto técnico verificable.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Pega una URL pública de GitHub. El juez fija un snapshot, selecciona evidencia relevante y entrega scores, hallazgos y recomendaciones con links a líneas reales.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
          {[
            "Technical review only",
            "Code was not executed",
            "Business fit/authorship not assessed",
          ].map((label) => (
            <div key={label} className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2.5">
              <ShieldCheck className="size-4 shrink-0 text-foreground" />
              {label}
            </div>
          ))}
        </div>
      </section>

      <Card className="border-foreground/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <GitFork className="size-5" />
            Selecciona un proyecto
          </CardTitle>
          <CardDescription>No necesitas conectar tu cuenta ni dar permisos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>URL pública de GitHub</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        autoComplete="url"
                        inputMode="url"
                        placeholder="https://github.com/owner/repository"
                        disabled={isRunning || form.formState.isSubmitting}
                        className="h-11 font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>Branch principal actual · máximo 40 archivos de texto · sin ejecutar código.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="sm:mt-6"
                disabled={isRunning || form.formState.isSubmitting}
              >
                {isRunning || form.formState.isSubmitting ? "Analizando…" : "Run technical judge"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </Form>
          {submissionError ? (
            <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {submissionError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {reviewId && review === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {review ? <RepositoryCard review={review} /> : null}

      {review && reviewStages.includes(review.status as (typeof reviewStages)[number]) ? (
        <ReviewProgress
          status={review.status as (typeof reviewStages)[number]}
          events={review.events ?? []}
        />
      ) : null}

      {review?.status === "failed" ? (
        <Card className="border-destructive/30" role="alert">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <CardTitle>La revisión no pudo completarse</CardTitle>
            </div>
            <CardDescription className="leading-relaxed">
              {review.failureMessage ?? "Ocurrió un error inesperado."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" onClick={() => void submit()} disabled={form.formState.isSubmitting}>
              <RotateCcw data-icon="inline-start" />
              Reintentar con esta URL
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {review?.status === "completed" && review.repository && review.coverage && review.result && review.usage ? (
        <ReviewReport
          review={{
            ...review,
            repository: review.repository,
            coverage: review.coverage,
            result: review.result,
            usage: review.usage,
          }}
        />
      ) : null}
    </main>
  );
}
