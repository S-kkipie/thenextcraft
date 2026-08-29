"use client";

import { useRouter } from "next/navigation";
import type { FunctionReturnType } from "convex/server";
import { api } from "@thenextcraft/backend/api";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CraftBadge, StatusPill } from "@/components/craft";

type ShortlistRow = FunctionReturnType<typeof api.shortlist.ranked>[number];

// Umbral para pintar el "AI Match" con el acento amber (matches fuertes).
const STRONG_MATCH = 85;

export function ShortlistTable({ rows }: { rows: ShortlistRow[] }) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        Aún no hay submissions evaluadas. El shortlist aparecerá cuando la IA
        termine de evaluar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Builder</TableHead>
            <TableHead>AI Match</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Autoría</TableHead>
            <TableHead>Fortaleza</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.submissionId}>
              <TableCell>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {row.rank}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{row.builder.initials}</AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <div className="font-bold">{row.builder.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{row.builder.handle}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "font-mono tabular-nums",
                  row.aiMatch >= STRONG_MATCH
                    ? "text-sand"
                    : "text-muted-foreground",
                )}
              >
                {row.aiMatch}%
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.score}
              </TableCell>
              <TableCell>
                {row.authorshipStatus === "approved" ? (
                  <CraftBadge variant="auth">🧬 Verificada</CraftBadge>
                ) : (
                  <StatusPill status="review">Pendiente</StatusPill>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.strength}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="craftSecondary"
                  size="sm"
                  onClick={() => router.push(`/u/${row.builder.handle}`)}
                >
                  Contactar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
