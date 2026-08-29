import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const map = {
  open: { label: "Abierto", cls: "bg-sage/15 text-sage" },
  live: { label: "En vivo", cls: "bg-terra/15 text-terra" },
  review: { label: "En revisión", cls: "bg-sand/15 text-sand" },
  closed: { label: "Cerrado", cls: "bg-panel-2 text-muted-foreground" },
} as const;

export type ChallengeStatus = keyof typeof map;

/** Status chip. Falls back to a default Spanish label per status. */
export function StatusPill({
  status,
  children,
  className,
}: {
  status: ChallengeStatus;
  children?: ReactNode;
  className?: string;
}) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        s.cls,
        className,
      )}
    >
      {children ?? s.label}
    </span>
  );
}
