"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/current-user";
import {
  CraftBadge,
  LevelRing,
  StatTile,
  StreakPill,
  XpBar,
} from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useUserBadges } from "../hooks";
import { PixelIcon } from "@/components/craft/pixel-icon";
import {
  deriveBadges,
  deriveProgress,
  deriveWeeklyGoals,
  unlockedLabel,
  type UnlockedBadge,
} from "../model";
import type { RewardsProgress, WeeklyGoal } from "../schema";

export function RewardsView() {
  const { userId, user } = useCurrentUser();
  const badges = useUserBadges(userId);

  // Logged out: nudge toward the nav sign-in (mismo patrón que el dashboard).
  if (userId === null) return <LoggedOut />;

  const loading = user === null || badges === undefined;

  if (loading) return <RewardsSkeleton />;

  const progress = deriveProgress(user);
  const goals = deriveWeeklyGoals(user);
  const { unlocked, locked, total } = deriveBadges(badges);

  return (
    <div className="flex flex-col gap-[18px]">
      <header>
        <Eyebrow>Recompensas</Eyebrow>
        <h1 className="font-display mt-2 text-[32px] font-bold text-foreground">
          Tu progreso
        </h1>
        <p className="text-muted-foreground mt-1.5 max-w-xl text-[13px]">
          Racha, nivel, XP e insignias son una capa de engagement{" "}
          <span className="text-foreground">sobre señales reales</span> — no un
          RPG de pago.
        </p>
      </header>

      {/* ===== Racha grande ===== */}
      <StreakHero streak={progress.streak} />

      {/* ===== Nivel + XP + stats ===== */}
      <div className="grid gap-[18px] lg:grid-cols-[1fr_320px]">
        <LevelCard progress={progress} />
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
          <StatTile value={progress.level} label="NIVEL" accent="sand" />
          <StatTile value={progress.xpValue} label="XP TOTAL" />
          <StatTile value={total} label="BADGES" accent="sage" />
        </div>
      </div>

      {/* ===== Meta semanal ===== */}
      <WeeklyGoals goals={goals} />

      {/* ===== Badges ===== */}
      <BadgesCard unlocked={unlocked} locked={locked} />

      <p className="bg-[var(--ink-2)] text-muted-foreground rounded-xl px-4 py-3 text-[12.5px]">
        Todo esto se deriva de{" "}
        <span className="text-foreground">señales reales</span>: ships
        publicados, aprobaciones de startups, AI Judge y autoría verificada. La
        gamificación motiva el hábito — el trabajo real es lo que cuenta.
      </p>
    </div>
  );
}

/* ------------------------------- racha ---------------------------------- */

function StreakHero({ streak }: { streak: number }) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-6">
        <div
          className="grid size-24 flex-none place-items-center rounded-2xl border border-line-2 bg-ink-2"
          aria-hidden
        >
          <PixelIcon name="fire" size={52} className="text-[var(--cyan)]" />
        </div>
        <div className="min-w-[180px] flex-1">
          <SectionTitle>Racha</SectionTitle>
          <div className="mt-1 flex items-end gap-3">
            <span className="font-display text-terra text-6xl leading-none font-bold tabular-nums">
              {streak}
            </span>
            <span className="text-muted-foreground pb-2 text-[15px] font-semibold">
              {streak === 1 ? "día seguido" : "días seguidos"}
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-[13px]">
            {streak > 0
              ? "Vuelve cada día para mantener la llama encendida."
              : "Shipea o participa hoy para empezar tu racha."}
          </p>
        </div>
        <StreakPill days={streak} />
      </CardContent>
    </Card>
  );
}

/* ------------------------------ nivel/xp -------------------------------- */

function LevelCard({ progress }: { progress: RewardsProgress }) {
  const remaining = Math.max(0, progress.xpMax - progress.xpValue);
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <SectionTitle>Nivel</SectionTitle>
        <div className="flex flex-wrap items-center gap-5">
          <LevelRing
            level={progress.level}
            progress={progress.progress}
            size={88}
          />
          <div className="min-w-[200px] flex-1">
            <div className="text-faint mb-1.5 flex justify-between data text-xs tabular-nums">
              <span>Nivel {progress.level}</span>
              <span>Nivel {progress.level + 1}</span>
            </div>
            <XpBar value={progress.xpValue} max={progress.xpMax} />
            <p className="text-muted-foreground mt-2 data text-xs tabular-nums">
              {progress.xpValue}/{progress.xpMax} XP · faltan{" "}
              <span className="text-foreground">{remaining}</span> para el
              siguiente nivel
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------- meta semanal ------------------------------ */

function WeeklyGoals({ goals }: { goals: WeeklyGoal[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <SectionTitle>Meta semanal</SectionTitle>
        <div className="flex flex-col gap-4">
          {goals.map((goal) => {
            const done = goal.value >= goal.max;
            return (
              <div key={goal.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[14px] font-bold">
                    {goal.label}
                  </span>
                  <span className="text-faint data text-xs tabular-nums">
                    {goal.value}/{goal.max} {goal.unit}
                  </span>
                </div>
                <XpBar value={goal.value} max={goal.max} />
                <div className="flex items-center justify-between gap-3">
                  {goal.note ? (
                    <span className="text-muted-foreground text-[11.5px]">
                      {goal.note}
                    </span>
                  ) : (
                    <span />
                  )}
                  {done ? (
                    <span className="text-sage text-[11.5px] font-bold">
                      <PixelIcon name="check" size={11} /> completada
                    </span>
                  ) : goal.key === "ship" ? (
                    <Link
                      href="/challenges"
                      className="text-[var(--sand)] text-[12px] font-bold"
                    >
                      Ver retos <PixelIcon name="arrowRight" size={12} />
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- badges --------------------------------- */

function BadgesCard({
  unlocked,
  locked,
}: {
  unlocked: UnlockedBadge[];
  locked: ReturnType<typeof deriveBadges>["locked"];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <SectionTitle>Badges</SectionTitle>

        <div className="flex flex-col gap-2.5">
          <SubLabel>Desbloqueados</SubLabel>
          {unlocked.length ? (
            <div className="flex flex-wrap gap-2.5">
              {unlocked.map((item) => (
                <CraftBadge key={item.key} variant={item.variant}>
                  {unlockedLabel(item)}
                </CraftBadge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-[13px]">
              Aún sin badges — shipea tu primer reto para desbloquear el primero.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <SubLabel>Por desbloquear</SubLabel>
          <div className="flex flex-wrap gap-2.5">
            {locked.map((item) => (
              <div key={item.key} className="flex flex-col gap-1">
                <CraftBadge variant={item.variant} className="opacity-50">
                  <PixelIcon name="lock" size={12} /> {item.label}
                </CraftBadge>
                <span className="text-faint pl-1 text-[11px]">
                  {item.unlock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- pieces --------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-faint text-xs font-bold tracking-[0.14em] uppercase">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-faint text-xs font-bold tracking-[0.14em] uppercase">
      {children}
    </p>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-muted-foreground text-[12.5px] font-semibold">
      {children}
    </span>
  );
}

/* ------------------------------- states --------------------------------- */

function LoggedOut() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-display text-xl font-bold">
          Entra para ver tus recompensas
        </p>
        <p className="text-muted-foreground max-w-md text-sm">
          Inicia sesión desde la barra superior para ver tu racha, tu nivel y
          las insignias que has desbloqueado con trabajo real.
        </p>
        <div className="mt-4">
          <Button render={<Link href="/challenges" />} variant="craftSecondary">
            Explorar retos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RewardsSkeleton() {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-[18px] lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  );
}
