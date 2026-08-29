import Link from "next/link";
import {
  BadgeCheck,
  Flame,
  MapPin,
  Rocket,
  Share2,
  Shield,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DifficultyBadge, TechChip, TRACKS } from "@/components/craft/labels";
import { HexBadge, HexTile } from "@/components/craft/hex-tile";
import { Meter, scoreTone, Stat } from "@/components/craft/metrics";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  achievements,
  currentBuilder,
  projects,
  topSkills,
} from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  return { title: `${handle} · Pasaporte del Developer` };
}

/**
 * El pasaporte es la salida pública del loop: lo que la startup mira antes de
 * decidir. Todo lo que aparece acá está respaldado por un ship verificado.
 */
export default function PassportPage() {
  const builder = currentBuilder;
  const initials = builder.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-semibold">Pasaporte del Developer</h1>
        <Button variant="outline" size="sm">
          <Share2 aria-hidden />
          Compartir
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-5">
          <Avatar className="size-20">
            <AvatarFallback className="bg-primary/20 text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading text-2xl font-semibold">{builder.name}</h2>
              {builder.verified && (
                <BadgeCheck className="size-5 text-primary" aria-label="Autoría verificada" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{builder.title}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              {builder.location}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-medium">Nivel {builder.level}</span>
              <Meter
                value={builder.xp}
                max={builder.xpToNextLevel}
                className="max-w-56"
              />
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {builder.xp.toLocaleString("es")} / {builder.xpToNextLevel.toLocaleString("es")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-sm text-muted-foreground">Builder Score</span>
            <span className="font-heading text-4xl font-semibold tabular-nums text-gradient-brand">
              {builder.builderScore.toLocaleString("es")}
            </span>
            <span className="text-sm text-muted-foreground">{builder.scorePercentile}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat value={builder.shipped} label="Proyectos shippeados" />
            <Stat value={builder.startupApproved} label="Startup approved" />
            <Stat value={builder.avgScore} label="Score promedio" />
            <Stat value={builder.streakWeeks} label="Semanas de racha" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills principales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {topSkills.map((skill) => (
            <TechChip key={skill}>{skill}</TechChip>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos destacados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {projects.map((project) => {
              const track = TRACKS[project.track];
              return (
                <li key={project.challengeSlug}>
                  <Link
                    href={`/desafios/${project.challengeSlug}/evaluacion`}
                    className="flex flex-wrap items-center gap-3 py-3 transition-opacity first:pt-0 last:pb-0 hover:opacity-80"
                  >
                    <HexTile icon={track.icon} accent="bg-border" size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{project.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {project.technologies.map((tech) => (
                          <TechChip key={tech}>{tech}</TechChip>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          scoreTone(project.score),
                        )}
                      >
                        {project.score}
                        <span className="text-muted-foreground">/100</span>
                      </span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {project.percentile}
                      </span>
                      {project.approved && (
                        <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-medium text-success">
                          Aprobado
                        </span>
                      )}
                      <DifficultyBadge difficulty={project.difficulty} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logros recientes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {achievements.map((achievement) => (
            <HexBadge
              key={achievement.id}
              icon={ACHIEVEMENT_ICONS[achievement.id] ?? Trophy}
              label={achievement.label}
              accent={ACHIEVEMENT_TINTS[achievement.hue]}
            />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  "primer-ship": Rocket,
  "racha-7": Flame,
  "top-10": Trophy,
  "security-first": Shield,
  "startup-approved": BadgeCheck,
};

const ACHIEVEMENT_TINTS: Record<string, string> = {
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  gem: "bg-gem",
  destructive: "bg-destructive",
};
