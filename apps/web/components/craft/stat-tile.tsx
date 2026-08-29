import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const accents = {
  sand: "text-sand",
  sage: "text-sage",
  terra: "text-terra",
  default: "",
} as const;

/** Compact metric tile. */
export function StatTile({
  value,
  label,
  accent = "default",
  className,
}: {
  value: ReactNode;
  label: string;
  accent?: keyof typeof accents;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line-2 bg-ink-2 rounded-xl border p-3 text-center",
        className,
      )}
    >
      <b className={cn("font-display block text-[22px] tabular-nums", accents[accent])}>
        {value}
      </b>
      <span className="eyebrow text-[11px]">{label}</span>
    </div>
  );
}
