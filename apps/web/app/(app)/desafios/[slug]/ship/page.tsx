import Link from "next/link";
import { ArrowLeft, Check, Rocket } from "lucide-react";

import { Beto } from "@/components/craft/beto";
import { GithubMark } from "@/components/craft/labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChallenge, submission } from "@/lib/mock/data";

export async function generateMetadata({
  params,
}: PageProps<"/desafios/[slug]/ship">) {
  const { slug } = await params;
  return { title: `Shippear ${getChallenge(slug).title} · thenextcraft` };
}

export default async function ShipPage({ params }: PageProps<"/desafios/[slug]/ship">) {
  const { slug } = await params;
  const challenge = getChallenge(slug);

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Repositorio",
      value: (
        <a
          href={submission.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <GithubMark className="size-3.5" />
          {submission.repo}
        </a>
      ),
    },
    { label: "Tiempo de desarrollo", value: submission.devTimeHours },
    { label: "Commits", value: submission.commits },
    { label: "Tests", value: `${submission.testsPassing} pasados` },
    { label: "Archivos cambiados", value: submission.filesChanged },
    { label: "Líneas de código", value: submission.linesOfCode.toLocaleString("es") },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-8">
      <Link
        href={`/desafios/${challenge.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {challenge.title}
      </Link>

      {/* Beto ya tiene la caja en brazos: el entregable está listo, falta soltarlo. */}
      <header className="relative overflow-hidden rounded-2xl bg-primary/12 px-6 py-8 ring-1 ring-primary/25">
        <div className="max-w-[62%]">
          <h1 className="font-heading text-2xl font-semibold">¡Listo para shippear!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa los detalles antes de enviar tu solución.
          </p>
        </div>
        <Beto
          variant="ship"
          className="pointer-events-none absolute -right-1 -bottom-2 size-32"
        />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Tu submission</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist final</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {submission.checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                <span className="grid size-4 shrink-0 place-items-center rounded-[4px] bg-success/20">
                  <Check className="size-3 text-success" aria-hidden />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button
          size="lg"
          className="h-12 w-full text-base"
          nativeButton={false}
          render={<Link href={`/desafios/${challenge.slug}/evaluacion`} />}
        >
          <Rocket aria-hidden />
          SHIP IT
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          No podrás modificar tu envío después.
        </p>
      </div>
    </main>
  );
}
