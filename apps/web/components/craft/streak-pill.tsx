import { cn } from "@/lib/utils";

/** Streak indicator: flame + day count. */
export function StreakPill({
  days,
  className,
}: {
  days: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display text-terra inline-flex items-center gap-1.5 text-[13px] font-extrabold",
        className,
      )}
    >
      🔥 {days}
    </span>
  );
}
