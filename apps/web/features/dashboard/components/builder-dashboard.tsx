"use client";

import { useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBuilderSubmissions, useOpenChallenges } from "../hooks";
import {
  deriveActivity,
  deriveNextStep,
  deriveProgress,
  deriveStats,
  toActiveSubmissions,
  toChallengeCards,
  toChallengeIndex,
  toSubmissions,
} from "../model";
import { Eyebrow, SectionTitle } from "./section-title";
import { ProgressPanel } from "./progress-panel";
import { NextStepCard } from "./next-step-card";
import { ActiveChallenges } from "./active-challenges";
import { RecommendedChallenges } from "./recommended-challenges";
import { RecentActivity } from "./recent-activity";

export function BuilderDashboard() {
  const { userId, user } = useCurrentUser();
  const submissionsRaw = useBuilderSubmissions(userId);
  const challengesRaw = useOpenChallenges();
  // Snapshot "now" once at mount — relative times / days-left don't need to tick,
  // and a stable value keeps render pure (React 19) and hydration-safe.
  const [now] = useState(() => Date.now());

  // Logged out: nudge toward the nav sign-in.
  if (userId === null) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Entra para ver tu carrera
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Inicia sesión desde la barra superior para ver tu progreso, tus retos
          activos y las oportunidades hechas para ti.
        </p>
        <div className="mt-5 flex justify-center">
          <Button render={<Link href="/challenges" />} variant="craftSecondary">
            Explorar retos
          </Button>
        </div>
      </div>
    );
  }

  const loading = user === null || submissionsRaw === undefined;

  const progress = deriveProgress(user);
  const challengeIndex = toChallengeIndex(challengesRaw, now);
  const challengeCards = toChallengeCards(challengesRaw, now);
  const subs = toSubmissions(submissionsRaw, now, challengeIndex);
  const active = toActiveSubmissions(subs);
  const stats = deriveStats(subs);
  const nextStep = deriveNextStep(active, subs);
  const activity = deriveActivity(subs, user, now);

  return (
    <div>
      {/* Greeting */}
      <div className="mb-[22px]">
        <Eyebrow>Tu carrera</Eyebrow>
        <h1 className="mt-2 text-[32px] font-bold text-foreground">
          {loading ? "Hola" : `Hola, ${user?.name ?? "builder"}`}
        </h1>
      </div>

      {loading ? (
        <Skeleton className="h-[168px] w-full rounded-2xl" />
      ) : (
        <ProgressPanel progress={progress} stats={stats} />
      )}

      {!loading && nextStep ? <NextStepCard step={nextStep} /> : null}

      {!loading ? <ActiveChallenges items={active} /> : null}

      {challengesRaw === undefined ? (
        <section>
          <SectionTitle>Retos para ti</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </section>
      ) : (
        <RecommendedChallenges items={challengeCards} />
      )}

      {!loading ? <RecentActivity items={activity} /> : null}
    </div>
  );
}
