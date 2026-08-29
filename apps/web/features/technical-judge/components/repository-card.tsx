import type { FunctionReturnType } from "convex/server";
import {
  ExternalLink,
  FileCode2,
  GitBranch,
  GitFork,
  Star,
} from "lucide-react";

import { api } from "@thenextcraft/backend/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TechnicalReview = NonNullable<
  FunctionReturnType<typeof api.technicalJudge.get>
>;

export function RepositoryCard({ review }: { review: TechnicalReview }) {
  const repository = review.repository;

  return (
    <Card size="sm" className="bg-muted/30">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg border bg-background">
          <GitFork className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={review.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 font-medium hover:underline"
          >
            <span className="truncate">{review.owner}/{review.repo}</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {repository?.description ?? "Snapshot público fijado para revisión estática."}
          </p>
        </div>
        {repository ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground sm:justify-end">
            <Badge variant="outline">
              <GitBranch data-icon="inline-start" />
              {repository.defaultBranch}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {repository.commitSha.slice(0, 7)}
            </Badge>
            {repository.primaryLanguage ? (
              <Badge variant="outline">
                <FileCode2 data-icon="inline-start" />
                {repository.primaryLanguage}
              </Badge>
            ) : null}
            <Badge variant="outline">
              <Star data-icon="inline-start" />
              {repository.stars.toLocaleString()}
            </Badge>
          </div>
        ) : (
          <Badge variant="secondary">Obteniendo snapshot…</Badge>
        )}
      </CardContent>
    </Card>
  );
}
