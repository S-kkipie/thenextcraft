import Link from "next/link";
import { ArrowRight, Check, Flame, Gem, Lock, TrendingUp, Zap } from "lucide-react";

import { ScoreArea } from "@/components/craft/charts";
import { DifficultyBadge, TRACKS } from "@/components/craft/labels";
import { HexTile } from "@/components/craft/hex-tile";
import { LevelRing, Meter } from "@/components/craft/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  builderScoreSeries,
  challengePath,
  currentBuilder,
  recommendedChallenges,
} from "@/lib/mock/data";
import type { PathStep } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tu carrera · thenextcraft" };

/** Delta del último mes: la serie es semanal, así que son los últimos 4 puntos. */
const scoreDelta =
  builderScoreSeries[builderScoreSeries.length - 1].value -
  builderScoreSeries[builderScoreSeries.length - 5].value;

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8">
      <Header />
      <BuilderScoreCard />
      <PathSection />
      <RecommendedSection />
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Tu carrera</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            ¡Vamos, {currentBuilder.name.split(" ")[0]}!
          </span>
          <Flame className="size-4 text-warning" aria-hidden />
          {currentBuilder.streakWeeks} semanas de racha
        </p>
      </div>

      <div className="flex items-center gap-6">
        <HeaderStat
          icon={<Zap className="size-4 text-xp" aria-hidden />}
          value={currentBuilder.xp.toLocaleString("es")}
          label="XP"
        />
        <HeaderStat
          icon={<Gem className="size-4 text-gem" aria-hidden />}
          value={currentBuilder.gems}
          label="Gemas"
        />
        <div className="flex items-center gap-2.5">
          <LevelRing
            level={currentBuilder.level}
            xp={currentBuilder.xp}
            xpToNextLevel={currentBuilder.xpToNextLevel}
          />
          <div className="text-xs">
            <div className="font-medium">Nivel actual</div>
            <div className="tabular-nums text-muted-foreground">
              {currentBuilder.xp.toLocaleString("es")} /{" "}
              {currentBuilder.xpToNextLevel.toLocaleString("es")}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="text-xs">
        <div className="text-sm font-semibold tabular-nums">{value}</div>
        <div className="text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function BuilderScoreCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Builder Score</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
        <div>
          <div className="font-heading text-5xl font-semibold tabular-nums text-gradient-brand">
            {currentBuilder.builderScore.toLocaleString("es")}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentBuilder.scorePercentile}
          </p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
            <TrendingUp className="size-3.5" aria-hidden />+{scoreDelta} este mes
          </p>
        </div>
        <ScoreArea data={builderScoreSeries} />
      </CardContent>
    </Card>
  );
}

function PathSection() {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-medium">Tu camino</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {challengePath.map((step) => (
          <li key={step.slug}>
            <PathCard step={step} />
          </li>
        ))}
      </ol>
    </section>
  );
}

const PATH_STATE = {
  completado: { label: "Completado", tone: "text-success", icon: Check },
  "en-progreso": { label: "En progreso", tone: "text-warning", icon: Flame },
  bloqueado: { label: "Bloqueado", tone: "text-muted-foreground", icon: Lock },
} as const;

function PathCard({ step }: { step: PathStep }) {
  const state = PATH_STATE[step.state];
  const StateIcon = state.icon;
  const locked = step.state === "bloqueado";
  const current = step.state === "en-progreso";

  const body = (
    <Card
      size="sm"
      className={cn(
        "h-full transition-colors",
        current && "glow-brand",
        locked && "opacity-60",
        !locked && "hover:bg-elev",
      )}
    >
      <CardContent className="space-y-3">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg",
            current ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <StateIcon className="size-4" aria-hidden />
        </span>
        <div className="space-y-1">
          <div className="text-sm font-medium">{step.title}</div>
          <div className={cn("flex items-center gap-1 text-xs", state.tone)}>
            <StateIcon className="size-3" aria-hidden />
            {locked && step.requiredLevel
              ? `Nivel ${step.requiredLevel}`
              : state.label}
          </div>
        </div>
        {current && step.progress !== undefined ? (
          <div className="space-y-1.5">
            <Meter value={step.progress} />
            <div className="text-right text-xs tabular-nums text-muted-foreground">
              {step.progress}%
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-medium text-xp">
            <Zap className="size-3" aria-hidden />+{step.xpReward} XP
          </div>
        )}
      </CardContent>
    </Card>
  );

  return locked ? body : <Link href={`/desafios/${step.slug}`}>{body}</Link>;
}

function RecommendedSection() {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-medium">Recomendados para ti</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recommendedChallenges.map((challenge) => {
          const track = TRACKS[challenge.track];
          return (
            <Link key={challenge.slug} href={`/desafios/${challenge.slug}`}>
              <Card size="sm" className="h-full transition-colors hover:bg-elev">
                <CardContent className="space-y-3">
                  <HexTile icon={track.icon} accent="bg-border" size="sm" />
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">{challenge.title}</div>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-xp">
                    <Zap className="size-3" aria-hidden />+{challenge.xpReward} XP
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        <Link href="/desafios">
          <Card
            size="sm"
            className="h-full border-dashed bg-transparent ring-border transition-colors hover:bg-elev"
          >
            <CardContent className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="grid size-9 place-items-center rounded-lg bg-muted">
                <ArrowRight className="size-4" aria-hidden />
              </span>
              <span className="text-sm text-muted-foreground">
                Ver todos los desafíos
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
