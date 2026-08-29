import { cn } from "@/lib/utils";

/** XP progress bar (sand → terra fill). */
export function XpBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        "border-line-2 bg-ink-2 h-3 overflow-hidden rounded-full border",
        className,
      )}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg,var(--sand),var(--terra))",
        }}
      />
    </div>
  );
}
