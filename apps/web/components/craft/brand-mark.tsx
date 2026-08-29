import { cn } from "@/lib/utils";

/**
 * Wordmark: punto de fósforo + nombre en el display bitmap.
 *
 * Sin `tracking-tight`: Silkscreen es un bitmap y el tracking negativo le pisa
 * los píxeles. Y peso 700 como techo: la familia solo trae 400 y 700,
 * cualquier peso mayor lo sintetiza el navegador y engorda el trazo.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-2.5 text-[15px] leading-[1.4] font-bold",
        className,
      )}
    >
      <span className="size-[11px] rounded-[3px] bg-[var(--phos)] shadow-[0_0_14px_rgb(74_240_126_/_0.6)]" />
      The Next Ship
    </span>
  );
}
