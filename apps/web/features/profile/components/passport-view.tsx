"use client";

import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";

import { LevelRing } from "@/components/craft/level-ring";
import { XpBar } from "@/components/craft/xp-bar";
import { StreakPill } from "@/components/craft/streak-pill";
import { StatTile } from "@/components/craft/stat-tile";
import { ScoreBar } from "@/components/craft/score-bar";
import { CraftBadge } from "@/components/craft/craft-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/craft/pixel-icon";

import { useProfileSummary } from "@/features/profile/hooks";
import { BADGE_META, DEFAULT_BADGE_META } from "@/features/profile/schema";

type Summary = NonNullable<
  FunctionReturnType<typeof api.views.profileSummary>
>;
type Project = Summary["projects"][number];

export function PassportView({ handle }: { handle: string }) {
  const summary = useProfileSummary(handle);

  if (summary === undefined) return <PassportSkeleton />;
  if (summary === null) return <NotFound handle={handle} />;

  return <PassportContent summary={summary} />;
}

/* ------------------------------- content -------------------------------- */

function PassportContent({ summary }: { summary: Summary }) {
  const { user, stats, score, skills, badges, projects } = summary;
  const handle = user.githubHandle ?? "";
  const level = user.level ?? 1;
  const xp = user.xp ?? 0;
  const xpForNext = level * 500;
  const progress = xpForNext ? Math.min(1, xp / xpForNext) : 0;
  const roleLabel = user.role === "startup" ? "Startup" : "Builder";

  return (
    <div className="flex flex-col gap-[18px]">
      <p className="text-muted-foreground text-[13px]">
        Perfil público ·{" "}
        <span className="data text-foreground">/u/{handle}</span>
      </p>

      {/* ===== Header ===== */}
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start gap-4">
            <PassportAvatar name={user.name} avatarUrl={user.avatarUrl} />
            <div className="min-w-[200px] flex-1">
              <h1 className="font-display text-2xl font-bold">
                {user.name}
              </h1>
              <p className="text-muted-foreground mt-1 data text-[13px]">
                @{handle}
              </p>
              <p className="text-muted-foreground mt-1.5 text-[13px]">
                {roleLabel}
                {user.location ? ` · ${user.location}` : ""}
              </p>
            </div>
            <div className="ml-auto">
              <LevelRing level={level} progress={progress} size={64} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <StreakPill days={user.streak ?? 0} />
            <div className="min-w-[200px] flex-1">
              <XpBar value={xp} max={xpForNext} />
            </div>
            <span className="text-muted-foreground data text-xs">
              {xp}/{xpForNext}
            </span>
            <ShareButton />
            {handle && (
              <a
                href={`https://github.com/${handle}`}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "craftSecondary" }))}
              >
                Contactar
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Shipped" value={stats.shipped} />
        <StatTile label="Startup-approved" value={stats.approved} accent="sage" />
        <StatTile
          label="Avg Judge"
          value={stats.avgJudge ?? "—"}
          accent="sand"
        />
        <StatTile label="Badges" value={stats.badgeCount} />
      </div>

      {/* ===== Two column ===== */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          <BuilderScoreCard score={score} />
          <FeaturedProjects projects={projects} />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <SectionTitle>Skills</SectionTitle>
              {skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyNote>Aún sin skills — se derivan de retos shipeados.</EmptyNote>
              )}
              {skills.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  derivados de retos shipeados
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <SectionTitle>Badges</SectionTitle>
              {badges.length ? (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => {
                    const meta = BADGE_META[badge.type] ?? DEFAULT_BADGE_META;
                    const label =
                      badge.type === "shipped"
                        ? `Shipped ×${stats.shipped}`
                        : meta.label;
                    return (
                      <CraftBadge key={badge.id} variant={meta.variant}>
                        {label}
                      </CraftBadge>
                    );
                  })}
                </div>
              ) : (
                <EmptyNote>Aún sin badges — shipea tu primer reto.</EmptyNote>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- builder score ----------------------------- */

function BuilderScoreCard({ score }: { score: Summary["score"] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <SectionTitle>Builder Score</SectionTitle>
        <div className="flex flex-wrap items-end gap-3">
          <span className="font-display text-[var(--sand)] text-5xl leading-none font-bold tabular-nums">
            {score.total}
          </span>
          <span className="text-muted-foreground pb-1.5 text-[13px]">
            reputación derivada de señales reales
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {score.breakdown.map((row) => (
            <ScoreBar
              key={row.key}
              label={row.label}
              value={row.value}
              primary={"primary" in row ? row.primary : false}
            />
          ))}
        </div>
        <p className="bg-[var(--ink-2)] text-muted-foreground rounded-xl px-4 py-3 text-[12.5px]">
          No es XP — es reputación derivada de ships, aprobaciones y autoría.
        </p>
      </CardContent>
    </Card>
  );
}

/* --------------------------- featured projects -------------------------- */

function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <SectionTitle>Proyectos destacados</SectionTitle>
        {projects.length ? (
          <div className="flex flex-col gap-3">
            {projects.map((p) => (
              <div
                key={p.submissionId}
                className="border-line rounded-xl border bg-[var(--ink-2)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <p className="font-display text-[15px] font-bold">
                      {p.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[12.5px]">
                      {p.startupName}
                      {p.sector ? ` · ${p.sector}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {typeof p.score === "number" && (
                      <CraftBadge variant="approved">Score {p.score}</CraftBadge>
                    )}
                    {p.authorshipApproved && (
                      <CraftBadge variant="auth">Autoría</CraftBadge>
                    )}
                    <a
                      href={p.shipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--sand)] text-[13px] font-bold"
                    >
                      Ver ship <PixelIcon name="arrowRight" size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>Aún no hay ships publicados.</EmptyNote>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------- pieces --------------------------------- */

function PassportAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  if (avatarUrl) {
    return (
      <Avatar className="size-16">
        <AvatarImage src={avatarUrl} alt={name} />
      </Avatar>
    );
  }
  return (
    <span
      className="text-ink font-display grid size-16 place-items-center rounded-full text-2xl font-bold"
      style={{ backgroundImage: "linear-gradient(135deg,var(--tan),var(--sand))" }}
    >
      {(name?.[0] ?? "?").toUpperCase()}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--faint)] text-xs font-bold tracking-[0.14em] uppercase">
      {children}
    </p>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-[13px]">{children}</p>;
}

function ShareButton() {
  return (
    <Button
      variant="craftGhost"
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
      }}
    >
      Compartir
    </Button>
  );
}

/* ------------------------------- states --------------------------------- */

function NotFound({ handle }: { handle: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-display text-xl font-bold">Passport no encontrado</p>
        <p className="text-muted-foreground text-sm">
          No existe un builder con el handle{" "}
          <span className="data">@{handle}</span>.
        </p>
      </CardContent>
    </Card>
  );
}

function PassportSkeleton() {
  return (
    <div className="flex flex-col gap-[18px]">
      <Skeleton className="h-4 w-40" />
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="size-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
