"use client";

import Link from "next/link";
import { useState } from "react";
import type { Id } from "@thenextcraft/backend/dataModel";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { hostLabel, screenshotUrl } from "@/lib/preview";
import { useChallengeShips } from "@/features/shortlist/hooks";
import { PixelIcon } from "@/components/craft/pixel-icon";

type Ship = NonNullable<ReturnType<typeof useChallengeShips>>[number];

// Galería de ships del reto: preview (screenshot) de cada app + click para
// visitarla. Vista tipo crafter.run/ships, por reto.
export function ShipsGrid({ challengeId }: { challengeId: Id<"challenges"> }) {
  const ships = useChallengeShips(challengeId);

  if (ships === undefined) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (ships.length === 0) {
    return (
      <div className="border-line bg-card text-muted-foreground rounded-2xl border px-4 py-14 text-center text-sm">
        Aún no hay ships en este reto.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ships.map((s) => (
        <ShipCard key={s.submissionId} ship={s} />
      ))}
    </div>
  );
}

function ShipCard({ ship }: { ship: Ship }) {
  const [imgFailed, setImgFailed] = useState(false);
  const shot = screenshotUrl(ship.demoUrl);
  const host = hostLabel(ship.demoUrl) ?? hostLabel(ship.repositoryUrl);
  // La card lleva al feedback de la submission. Demo/repo van en botones aparte.
  const openExternal = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noreferrer,noopener");
  };

  return (
    <Link
      href={`/submissions/${ship.submissionId}`}
      className="group border-line bg-card hover:border-line-2 flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5"
    >
      {/* Preview */}
      <div className="bg-ink-2 relative aspect-[16/10] overflow-hidden">
        {shot && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shot}
            alt={`Preview de ${ship.builder.name}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <PreviewFallback hasDemo={!!ship.demoUrl} host={host} />
        )}

        {/* Overlay "Ver feedback" en hover */}
        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black">
            Ver feedback <PixelIcon name="arrowRight" size={11} />
          </span>
        </div>

        {ship.score != null && (
          <div className="bg-sand text-ink absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-black tabular-nums shadow-sm">
            {ship.score}
          </div>
        )}
        {!ship.demoUrl && (
          <span className="bg-panel-2/90 text-muted-foreground absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Solo repo
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-center gap-2">
          {ship.builder.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ship.builder.avatarUrl}
              alt=""
              className="size-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="bg-ink-2 text-foreground grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black">
              {ship.builder.initials}
            </span>
          )}
          <span className="font-display truncate text-sm font-bold">
            {ship.builder.name}
          </span>
          {ship.builder.handle && (
            <span className="text-faint truncate font-mono text-[11px]">
              @{ship.builder.handle}
            </span>
          )}
        </div>

        {ship.pitch && (
          <p className="text-muted-foreground line-clamp-2 text-[13px] leading-snug">
            {ship.pitch}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-faint truncate font-mono text-[11px]">
            {host ?? "—"}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            {ship.demoUrl && (
              <button
                type="button"
                onClick={openExternal(ship.demoUrl)}
                className="text-faint hover:text-foreground text-[11px] font-semibold underline-offset-2 hover:underline"
              >
                Demo <PixelIcon name="link" size={11} />
              </button>
            )}
            <button
              type="button"
              onClick={openExternal(ship.repositoryUrl)}
              className="text-faint hover:text-foreground text-[11px] font-semibold underline-offset-2 hover:underline"
            >
              Ver repo <PixelIcon name="github" size={11} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PreviewFallback({
  hasDemo,
  host,
}: {
  hasDemo: boolean;
  host: string | null;
}) {
  return (
    <div
      className={cn(
        "grid size-full place-items-center",
        "bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]",
      )}
    >
      <div className="text-center">
        <PixelIcon
            name={hasDemo ? "screen" : "card"}
            size={30}
            className="text-[var(--faint)]"
          />
        <div className="text-faint mt-1.5 max-w-[200px] truncate px-4 font-mono text-[11px]">
          {host ?? (hasDemo ? "preview no disponible" : "sin demo deployada")}
        </div>
      </div>
    </div>
  );
}
