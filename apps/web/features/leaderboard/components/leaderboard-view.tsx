"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import { useCurrentUser } from "@/lib/current-user";
import { StatTile } from "@/components/craft";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const FILTERS = ["Global", "Frontend", "LLM apps", "Convex", "Data viz"];

export function LeaderboardView() {
  const { userId } = useCurrentUser();
  const [skill, setSkill] = useState("Global");
  const rows = useQuery(
    api.leaderboard.top,
    skill === "Global" ? { limit: 50 } : { skill, limit: 50 },
  );
  const me = rows?.find((r) => r.userId === userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Ranking</h1>
        <p className="text-muted-foreground text-sm">
          Derivado de ships, aprobaciones y AI Judge — no es solo XP.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSkill(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
              skill === s
                ? "border-sand text-sand"
                : "border-line-2 text-muted-foreground hover:text-foreground",
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
          <StatTile value={me.xp} label="XP" accent="sage" />
        </div>
      )}

      <div className="border-line overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Builder</TableHead>
              <TableHead className="text-right">Nivel</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === undefined ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  Aún no hay builders rankeados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow
                  key={r.userId}
                  className={r.userId === userId ? "bg-panel-2" : undefined}
                >
                  <TableCell className="font-display text-sand font-black tabular-nums">
                    {r.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-ink font-display grid size-8 place-items-center rounded-full text-xs font-black"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg,var(--tan),var(--sand))",
                        }}
                      >
                        {r.initials}
                      </span>
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        {r.handle && (
                          <div className="text-faint font-mono text-xs">@{r.handle}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.level}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{r.xp}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
