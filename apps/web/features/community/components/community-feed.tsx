"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CraftBadge } from "@/components/craft";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed, type FeedItem } from "../hooks";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { FEED_FILTERS, type FeedFilter } from "../schema";
import { badgeMeta, relativeTime } from "../utils";
import { AvatarFrame } from "@/components/craft/avatar-frame";

const ROW =
  "card card-hover flex items-center gap-3 px-4 py-3.5";

/** Una fila del feed: avatar · evento · contexto · tiempo relativo. Enlaza al detalle. */
function FeedRow({ item, now }: { item: FeedItem; now: number }) {
  const isShip = item.type === "ship";
  const icon = isShip ? ("ship" as const) : ("medal" as const);
  const badge = isShip ? null : badgeMeta(item.meta ?? "");
  // Ship → detalle del ship; badge → passport del builder (si tiene handle).
  const href = isShip
    ? `/submissions/${item.id}`
    : item.user.handle
      ? `/u/${item.user.handle}`
      : null;

  const inner = (
    <>
      <AvatarFrame name={item.user.name} src={item.user.avatarUrl} size={40} brackets={false} />
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm">
          <PixelIcon
            name={icon}
            size={12}
            className="mr-1.5 text-[var(--phos)]"
          />
          {item.text}
        </p>
        {badge ? (
          <div className="mt-1.5">
            <CraftBadge variant={badge.variant}>{badge.label}</CraftBadge>
          </div>
        ) : item.meta ? (
          <p className="text-faint mt-0.5 truncate text-xs font-semibold">
            {item.meta}
          </p>
        ) : null}
      </div>
      <span className="text-muted-foreground flex-none text-xs">
        {relativeTime(item.ts, now)}
      </span>
    </>
  );

  if (!href) return <div className={ROW}>{inner}</div>;
  return (
    <Link href={href} className={ROW}>
      {inner}
    </Link>
  );
}

/** Feed de comunidad: actividad reciente (ships + badges) con pills de filtro. */
export function CommunityFeed() {
  const items = useFeed();
  const [filter, setFilter] = useState<FeedFilter>("all");
  // Snapshot "now" una vez al montar — los tiempos relativos no necesitan tickear
  // y un valor estable mantiene el render puro (React 19) y a salvo de hydration.
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "all") return items;
    const type = filter === "ships" ? "ship" : "badge";
    return items.filter((i) => i.type === type);
  }, [items, filter]);

  const emptyMsg =
    items && items.length > 0
      ? `No hay ${filter === "badges" ? "badges" : "ships"} todavía.`
      : "Aún no hay actividad — sé el primero en shipear.";

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="eyebrow text-[var(--phos)]">
          Proof-of-work en vivo
        </span>
        <h1 className="font-display text-4xl font-bold">Comunidad</h1>
        <p className="text-muted-foreground max-w-[56ch]">
          Cada ship y cada badge de la comunidad, en tiempo real.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FEED_FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={
                "rounded-[10px] border px-3 py-2 text-[12.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phos)] " +
                (active
                  ? "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]"
                  : "border-line text-muted-foreground hover:text-foreground hover:border-line-2")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {items === undefined ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-line bg-ink-2 rounded-2xl border p-10 text-center">
          <p className="text-muted-foreground text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <FeedRow key={`${item.type}-${item.id}`} item={item} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}
