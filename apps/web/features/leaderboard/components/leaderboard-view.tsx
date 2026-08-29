"use client";

import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";

import { useCurrentUser } from "@/lib/current-user";
import { StatTile } from "@/components/craft";
import { AvatarFrame } from "@/components/craft/avatar-frame";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { useQueryParam } from "@/lib/use-query-param";
import { cn } from "@/lib/utils";

/*
 * Ranking.
 *
 * Antes era una tabla plana: cuatro columnas, todas las filas iguales, y una
 * cifra de XP sin escala contra la que leerse. Ahora:
 *
 *  - Podio para el top 3. Un ranking sin cabeza no se siente ranking.
 *  - Barra de XP por fila, normalizada contra el #1: la distancia se ve en vez
 *    de compararse a ojo entre cifras.
 *  - "−N para #k" en cada fila. NO hay delta de posición (▲2/▼1): el esquema
 *    no guarda ranking histórico, así que sería un número inventado. El hueco
 *    con el de arriba sí es derivable, y además es accionable.
 *  - El filtro de skill vive en la URL: un ranking filtrado se puede compartir.
 */

const FILTERS = ["Global", "Frontend", "LLM apps", "Convex", "Data viz"];
const PODIUM = 3;

type Row = {
  rank: number;
  userId: string;
  name: string;
  handle: string | null;
  initials: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
};

function fmtXp(xp: number): string {
  return xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : String(xp);
}

export function LeaderboardView() {
  const { userId } = useCurrentUser();
  const [skill, setSkill] = useQueryParam("skill", "Global");
  const rows = useQuery(
    api.leaderboard.top,
    skill === "Global" ? { limit: 50 } : { skill, limit: 50 },
  ) as Row[] | undefined;

  const me = rows?.find((r) => r.userId === userId);
  const topXp = rows?.[0]?.xp ?? 0;
  const podium = rows?.slice(0, PODIUM) ?? [];
  const rest = rows?.slice(PODIUM) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow text-[var(--phos)]">Proof-of-work</span>
        <h1 className="mt-2 text-2xl font-bold">Ranking</h1>
        <p className="text-muted-foreground text-sm">
          Derivado de ships, aprobaciones y AI Judge — no es solo XP.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSkill(s)}
            aria-pressed={skill === s}
            className={cn(
              "rounded-[10px] border px-3 py-2 text-[12.5px] font-bold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phos)]",
              skill === s
                ? "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]"
                : "border-line-2 text-muted-foreground hover:border-[var(--phos)] hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {me && (
        <div className="grid grid-cols-3 gap-3">
          <StatTile value={`#${me.rank}`} label="TU POSICIÓN" accent="sand" />
          <StatTile value={me.level} label="NIVEL" />
          <StatTile value={fmtXp(me.xp)} label="XP" accent="sage" />
        </div>
      )}

      {rows === undefined ? (
        <PodiumSkeleton />
      ) : rows.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted-foreground">
          Nadie rankeado en{" "}
          <b className="text-foreground">{skill.toLowerCase()}</b> todavía. El
          ranking se llena con cada ship evaluado.
        </div>
      ) : (
        <>
          <Podium rows={podium} meId={userId} />

          {rest.length > 0 && (
            <div className="term">
              <div className="term-bar">
                leaderboard ~ {skill.toLowerCase()}
                <span className="term-hint">{rows.length} builders</span>
              </div>
              <ol>
                {rest.map((r, i) => (
                  <RankRow
                    key={r.userId}
                    row={r}
                    above={rest[i - 1] ?? podium[podium.length - 1]}
                    topXp={topXp}
                    me={r.userId === userId}
                  />
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------- podio ---------------------------------- */

// Orden visual 2·1·3: el primero al centro y más alto, como un podio real.
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_LIFT = ["sm:mt-6", "", "sm:mt-10"];

function Podium({ rows, meId }: { rows: Row[]; meId: string | null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
      {PODIUM_ORDER.map((idx, slot) => {
        const r = rows[idx];
        if (!r) return <div key={slot} className="hidden sm:block" />;
        const first = r.rank === 1;
        return (
          <div
            key={r.userId}
            className={cn(
              "card card-hover flex flex-col items-center gap-2 text-center",
              PODIUM_LIFT[slot],
              first && "border-[var(--phos)]/50",
              r.userId === meId && "ring-2 ring-[var(--phos)]",
            )}
          >
            <span
              className={cn(
                "font-display text-[13px] font-bold",
                first ? "text-[var(--phos)]" : "text-[var(--muted)]",
              )}
            >
              #{r.rank}
            </span>
            <AvatarFrame
              name={r.name}
              src={r.avatarUrl}
              size={first ? 72 : 56}
              level={r.level}
            />
            <span className="title-plain mt-1 w-full truncate text-sm font-bold">
              {r.name}
            </span>
            {r.handle && (
              <span className="data w-full truncate text-xs text-[var(--faint)]">
                @{r.handle}
              </span>
            )}
            <span className="font-display mt-1 inline-flex items-center gap-1.5 text-[15px] font-bold text-[var(--phos)] tabular-nums">
              <PixelIcon name="bolt" size={12} />
              {fmtXp(r.xp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------- filas --------------------------------- */

function RankRow({
  row,
  above,
  topXp,
  me,
}: {
  row: Row;
  above?: Row;
  topXp: number;
  me: boolean;
}) {
  const pct = topXp > 0 ? Math.max(2, Math.round((row.xp / topXp) * 100)) : 0;
  const gap = above ? above.xp - row.xp : 0;

  return (
    <li
      className={cn(
        "flex items-center gap-3 border-t border-[var(--line)] px-4 py-3 first:border-t-0",
        me && "bg-[var(--panel-2)]",
      )}
    >
      <span className="font-display w-8 shrink-0 text-[13px] font-bold text-[var(--faint)] tabular-nums">
        {row.rank}
      </span>
      <AvatarFrame name={row.name} src={row.avatarUrl} size={32} brackets={me} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold">{row.name}</span>
          {row.handle && (
            <span className="data truncate text-xs text-[var(--faint)]">
              @{row.handle}
            </span>
          )}
        </div>
        {/* Barra normalizada contra el #1: la distancia se ve, no se calcula. */}
        <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-[var(--line)]">
          <div className="h-full bg-[var(--phos)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="data text-[13px] font-bold text-[var(--text)] tabular-nums">
          {fmtXp(row.xp)}
        </div>
        {gap > 0 && (
          <div className="data text-[11px] text-[var(--faint)] tabular-nums">
            −{fmtXp(gap)} para #{row.rank - 1}
          </div>
        )}
      </div>
    </li>
  );
}

function PodiumSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
      {[24, 0, 40].map((lift, i) => (
        <div
          key={i}
          className="card h-[210px] animate-pulse"
          style={{ marginTop: lift }}
        />
      ))}
    </div>
  );
}
