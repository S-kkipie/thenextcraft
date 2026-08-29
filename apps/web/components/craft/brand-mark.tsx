import { cn } from "@/lib/utils";

/** The Next Ship wordmark: sand dot + name in the display face. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-2 text-[19px] font-black tracking-tight",
        className,
      )}
    >
      <span className="size-[11px] rounded-[3px] bg-sand shadow-[0_0_14px_rgba(198,161,91,0.6)]" />
      The Next Ship
    </span>
  );
}
