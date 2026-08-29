import Link from "next/link";
import { ArrowLeft, Check, Clock, Gem, Users, Zap } from "lucide-react";

import { DifficultyBadge, TechChip, TrackBadge } from "@/components/craft/labels";
import { SegmentedMeter } from "@/components/craft/metrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { challenges, getChallenge } from "@/lib/mock/data";

export function generateStaticParams() {
  return challenges.map((challenge) => ({ slug: challenge.slug }));
}

export async function generateMetadata({ params }: PageProps<"/desafios/[slug]">) {
  const { slug } = await params;
  return { title: `${getChallenge(slug).title} · thenextcraft` };
}

export default async function ChallengePage({ params }: PageProps<"/desafios/[slug]">) {
  const { slug } = await params;
  const challenge = getChallenge(slug);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-5 py-8">
      <Link
        href="/desafios"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Detalle del desafío
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <TrackBadge track={challenge.track} />
        </div>
        <h1 className="font-heading text-3xl font-semibold">{challenge.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{challenge.summary}</p>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-sm font-semibold uppercase text-primary">
            {challenge.company.name[0]}
          </span>
          <span className="text-sm font-medium">{challenge.company.name}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="space-y-6">
          {/*
            El problema en las palabras de la startup. Es lo que separa esto de un
            enunciado de ejercicio: no se resuelve un reto, se resuelve un negocio.
          */}
          <Card>
            <CardHeader>
              <CardTitle>El problema de negocio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {challenge.businessProblem}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tu misión</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {challenge.successCriteria.map((criterion) => (
                  <li key={criterion} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-[4px] bg-success/20">
                      <Check className="size-3 text-success" aria-hidden />
                    </span>
                    {criterion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluación</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cómo pesa cada criterio en tu score final.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenge.rubric.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[130px_1fr_auto] items-center gap-3 text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <SegmentedMeter value={item.weight} />
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {item.weight}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card size="sm">
            <CardContent className="space-y-3">
              <div className="text-sm font-medium">Recompensa</div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-xp/15 px-2 py-1 text-sm font-medium text-xp">
                  <Zap className="size-3.5" aria-hidden />+{challenge.xpReward} XP
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-gem/15 px-2 py-1 text-sm font-medium text-gem">
                  <Gem className="size-3.5" aria-hidden />+{challenge.gemReward} Gems
                </span>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="space-y-3 text-sm">
              <div className="font-medium">Información</div>
              <InfoRow icon={<Users className="size-3.5" aria-hidden />} label="Participantes">
                {challenge.participants}
              </InfoRow>
              <InfoRow icon={<Clock className="size-3.5" aria-hidden />} label="Tiempo estimado">
                {challenge.estimatedHours}
              </InfoRow>
              <Separator />
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Tecnologías</div>
                <div className="flex flex-wrap gap-1.5">
                  {challenge.technologies.map((tech) => (
                    <TechChip key={tech}>{tech}</TechChip>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Cierra en</div>
                <div className="font-medium">{challenge.closesIn}</div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={`/desafios/${challenge.slug}/ship`} />}
          >
            Aceptar desafío
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            La startup puede contactarte si tu solución queda seleccionada.
          </p>
        </aside>
      </div>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium tabular-nums">{children}</span>
    </div>
  );
}
