"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { CraftBadge } from "@/components/craft";
import { AvatarFrame } from "@/components/craft/avatar-frame";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { useQueryParam } from "@/lib/use-query-param";
import { useFeed, type FeedItem } from "../hooks";
import { FEED_FILTERS, feedFilter, type FeedFilter } from "../schema";
import { badgeMeta, relativeTime } from "../utils";

/*
 * Feed de comunidad.
 *
 * Antes era una lista plana de filas idénticas, sin más orientación temporal
 * que un "hace 3 h" al final de cada una: con veinte eventos no se distinguía
 * lo de hoy de lo de la semana pasada. Ahora:
 *
 *  - Agrupado por día, con cabecera pegajosa (HOY / AYER / fecha). El eje
 *    temporal es lo que convierte una lista en un feed.
 *  - Avatar real de GitHub, no una inicial.
 *  - Cada filtro dice cuántos eventos tiene: se ve si vale la pena tocarlo.
 *  - El filtro vive en la URL, así un feed filtrado se puede compartir.
 *  - La hora exacta va en `title`; en pantalla se queda el relativo.
 */

const ROW = "flex items-center gap-3 px-4 py-3.5 transition-colors";

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** HOY / AYER / "12 de marzo". `now` viene del snapshot, nunca del reloj vivo. */
function dayLabel(ts: number, now: number): string {
  const a = new Date(ts);
  const b = new Date(now);
  const days = Math.round(
    (new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() -
      new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()) /
      86_400_000,
  );
  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  return a.toLocaleDateString("es", { day: "numeric", month: "long" });
}

function FeedRow({ item, now }: { item: FeedItem; now: number }) {
  const isShip = item.type === "ship";
  const icon = isShip ? ("ship" as const) : ("medal" as const);
  const badge = isShip ? null : badgeMeta(item.meta ?? "");
  const href = isShip
    ? `/submissions/${item.id}`
    : item.user.handle
      ? `/u/${item.user.handle}`
      : null;

  const inner = (
    <>
      <AvatarFrame
        name={item.user.name}
        src={item.user.avatarUrl}
        size={38}
        brackets={false}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm text-foreground">
          <PixelIcon
            name={icon}
            size={12}
            className={isShip ? "text-[var(--phos)]" : "text-[var(--cyan)]"}
          />
          <span className="truncate">{item.text}</span>
        </p>
        {badge ? (
          <div className="mt-1.5">
            <CraftBadge variant={badge.variant}>{badge.label}</CraftBadge>
          </div>
        ) : item.meta ? (
          <p className="title-plain mt-0.5 truncate text-xs font-semibold text-[var(--muted)]">
            {item.meta}
          </p>
        ) : null}
      </div>
      <span
        className="data flex-none text-xs text-[var(--faint)]"
        title={new Date(item.ts).toLocaleString("es")}
      >
        {relativeTime(item.ts, now)}
      </span>
    </>
  );

  if (!href) return <div className={ROW}>{inner}</div>;
  return (
    <Link href={href} className={`${ROW} hover:bg-[var(--panel-2)]`}>
      {inner}
    </Link>
  );
}

export function CommunityFeed() {
  const items = useFeed();
  const [raw, setFilter] = useQueryParam("f", "all");
  // Un valor inválido en la URL no debe romper la vista.
  const parsed = feedFilter.safeParse(raw);
  const filter: FeedFilter = parsed.success ? parsed.data : "all";

  // Snapshot "now" una vez al montar: los tiempos relativos no necesitan
  // tickear, y un valor estable mantiene el render puro y a salvo de hydration.
  const [now] = useState(() => Date.now());

  const counts = useMemo(() => {
    const all = items?.length ?? 0;
    const ships = items?.filter((i) => i.type === "ship").length ?? 0;
    return { all, ships, badges: all - ships };
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "all") return items;
    const type = filter === "ships" ? "ship" : "badge";
    return items.filter((i) => i.type === type);
  }, [items, filter]);

  // Los items ya vienen ordenados por ts descendente desde el backend.
  const groups = useMemo(() => {
    const out: { key: string; label: string; items: FeedItem[] }[] = [];
    for (const item of filtered) {
      const key = dayKey(item.ts);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(item);
      else out.push({ key, label: dayLabel(item.ts, now), items: [item] });
    }
    return out;
  }, [filtered, now]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="eyebrow text-[var(--phos)]">Proof-of-work en vivo</span>
        <h1 className="text-4xl font-bold">Comunidad</h1>
        <p className="text-muted-foreground max-w-[56ch]">
          Cada ship y cada badge de la comunidad, en tiempo real.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FEED_FILTERS.map((f) => {
          const active = f.value === filter;
          const n = counts[f.value];
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={
                "inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[12.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phos)] " +
                (active
                  ? "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]"
                  : "border-line-2 text-muted-foreground hover:border-[var(--phos)] hover:text-foreground")
              }
            >
              {f.label}
              {items !== undefined && (
                <span className="data text-[11px] text-[var(--faint)] tabular-nums">
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {items === undefined ? (
        <FeedSkeleton />
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <PixelIcon
            name="signal"
            size={30}
            className="mx-auto mb-3 text-[var(--faint)]"
          />
          <p className="text-muted-foreground text-sm">
            {counts.all > 0
              ? `No hay ${filter === "badges" ? "badges" : "ships"} todavía.`
              : "Aún no hay actividad — sé el primero en shipear."}
          </p>
        </div>
      ) : (
        <div className="term">
          <div className="term-bar">
            community ~ actividad
            <span className="term-hint">{filtered.length} eventos</span>
          </div>
          {groups.map((g) => (
            <div key={g.key}>
              {/* Pegajosa bajo el header (60px) + el prompt de ruta (26px). */}
              <div className="eyebrow sticky top-[86px] z-10 border-y border-[var(--line)] bg-[var(--panel)] px-4 py-2">
                {g.label}
              </div>
              <div className="divide-y divide-[var(--line)]">
                {g.items.map((item) => (
                  <FeedRow
                    key={`${item.type}-${item.id}`}
                    item={item}
                    now={now}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FeedSkeleton() {
  return (
    <div className="term">
      <div className="term-bar">community ~ cargando…</div>
      <div className="divide-y divide-[var(--line)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-[38px] animate-pulse rounded-[3px] bg-[var(--panel-2)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/5 animate-pulse rounded bg-[var(--panel-2)]" />
              <div className="h-2.5 w-1/4 animate-pulse rounded bg-[var(--panel-2)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
