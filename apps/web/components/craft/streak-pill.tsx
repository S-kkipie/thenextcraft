import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/craft/pixel-icon";

/** Racha: llama + días, en el cian del CRT para no competir con el fósforo. */
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
        "data inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--cyan)] tabular-nums",
        className,
      )}
    >
      <PixelIcon name="fire" size={13} />
      {days}
    </span>
  );
}
