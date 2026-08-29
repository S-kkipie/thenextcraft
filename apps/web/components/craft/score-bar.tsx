import { cn } from "@/lib/utils";

/** AI Judge score row (0..100). primary highlights the reto-fit dimension. */
export function ScoreBar({
  label,
  value,
  primary,
  className,
}: {
  label: string;
  value: number;
  primary?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "my-2.5 grid grid-cols-[140px_1fr_42px] items-center gap-3 text-[13px]",
        className,
      )}
    >
      <span className={primary ? "text-sand font-extrabold" : ""}>
        {label}
        {primary ? " ★" : ""}
      </span>
      <div className="bg-ink-2 h-[9px] overflow-hidden rounded-full">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: primary ? "var(--sand)" : "var(--tan)" }}
        />
      </div>
      <span className="text-muted-foreground text-right font-mono tabular-nums">
        {value}
      </span>
    </div>
  );
}
