import Link from "next/link";
import { Clock, Gem, Users, Zap } from "lucide-react";

import { DifficultyBadge, TechChip, TRACKS } from "@/components/craft/labels";
import { HexTile } from "@/components/craft/hex-tile";
import { Card, CardContent } from "@/components/ui/card";
import { challenges } from "@/lib/mock/data";

export const metadata = { title: "Desafíos · thenextcraft" };

export default function ChallengesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-5 py-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Desafíos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Problemas de negocio reales, publicados por startups que están contratando.
        </p>
      </header>

      <ul className="grid gap-3 md:grid-cols-2">
        {challenges.map((challenge) => {
          const track = TRACKS[challenge.track];
          return (
            <li key={challenge.slug}>
              <Link href={`/desafios/${challenge.slug}`} className="block h-full">
                <Card className="h-full transition-colors hover:bg-elev">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <HexTile icon={track.icon} accent="bg-border" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading font-medium">{challenge.title}</h2>
                          <DifficultyBadge difficulty={challenge.difficulty} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {challenge.company.name} · {challenge.company.industry}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {challenge.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {challenge.technologies.slice(0, 4).map((tech) => (
                        <TechChip key={tech}>{tech}</TechChip>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-xp">
                        <Zap className="size-3" aria-hidden />+{challenge.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1 font-medium text-gem">
                        <Gem className="size-3" aria-hidden />+{challenge.gemReward}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3" aria-hidden />
                        {challenge.participants} participantes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" aria-hidden />
                        Cierra en {challenge.closesIn}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
