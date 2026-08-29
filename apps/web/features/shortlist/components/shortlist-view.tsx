"use client";

import type { Id } from "@thenextcraft/backend/dataModel";
import { PixelIcon } from "@/components/craft/pixel-icon";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/craft";
import {
  useCloseChallenge,
  useShortlistRanked,
  useShortlistSummary,
} from "@/features/shortlist/hooks";
import { ShortlistTable } from "@/features/shortlist/components/shortlist-table";
import { ShipsGrid } from "@/features/shortlist/components/ships-grid";
import { useCurrentUser } from "@/lib/current-user";

export function ShortlistView({
  challengeId,
}: {
  challengeId: Id<"challenges">;
}) {
  const summary = useShortlistSummary(challengeId);
  const ranked = useShortlistRanked(challengeId);
  const close = useCloseChallenge();
  const { userId } = useCurrentUser();

  // Cargando: cualquiera de los dos queries sin resolver.
  if (summary === undefined || ranked === undefined) {
    return <ShortlistSkeleton />;
  }

  if (summary === null) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        Reto no encontrado.
      </div>
    );
  }

  const { challenge, stats } = summary;
  const closed = challenge.status === "closed";

  const confirmClose = () => {
    if (closed || !userId) return;
    void close({ startupId: userId, challengeId });
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-balance">
            Shortlist — {challenge.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {stats.submissions} submissions ·{" "}
            {closed ? "cerrado" : "en revisión"}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="craftGhost" disabled={closed}>
                {closed ? "Reto cerrado" : "Cerrar reto"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar el reto?</AlertDialogTitle>
              <AlertDialogDescription>
                Dejará de recibir submissions y se generará el feedback del AI
                Judge para todas. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={confirmClose}>
                Cerrar reto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Submissions" value={stats.submissions} />
        <StatTile label="Shortlisted" value={stats.shortlisted} accent="sand" />
        <StatTile label="Evaluadas" value={stats.evaluated} />
        <StatTile label="Promedio" value={stats.average} />
      </div>

      <div className="mb-6 rounded-lg border border-sand/30 bg-sand/10 px-4 py-3">
        <p className="text-[13.5px] text-muted-foreground">
          La IA filtró{" "}
          <b className="text-sand">
            {stats.submissions} <PixelIcon name="arrowRight" size={11} />{" "}
            {stats.shortlisted}
          </b>{" "}
          con un score comparable. Al finalizar el reto se genera feedback
          line-level para cada builder. La decisión final de contratación es{" "}
          <b className="text-foreground">tuya</b>.
        </p>
      </div>

      {/* ── Galería de ships: preview de cada app + click para visitar ──── */}
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="eyebrow">
          Ships enviados
        </h2>
        <span className="text-faint text-[11px]">
          Preview en vivo · click para visitar
        </span>
      </div>
      <div className="mb-8">
        <ShipsGrid challengeId={challengeId} />
      </div>

      <h2 className="mb-3 eyebrow">
        Shortlist (rankeado por la IA)
      </h2>

      <ShortlistTable rows={ranked} />

      <p className="mt-4 text-[12.5px] text-muted-foreground">
        Ordenado por score. Al finalizar el reto, cada submission recibe feedback
        del AI Judge; la contratación la decides tú.
      </p>
    </div>
  );
}

function ShortlistSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="mb-6 h-14 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
