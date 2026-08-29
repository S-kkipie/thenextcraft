import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const map = {
  ship: "bg-sage/12 text-sage border-sage/30",
  approved: "bg-sand/12 text-sand border-sand/30",
  top: "bg-sand/10 text-sand border-sand/25",
  auth: "bg-tan/35 text-cream border-tan",
  first: "bg-terra/12 text-terra border-terra/30",
} as const;

export type BadgeVariant = keyof typeof map;

/** Verifiable achievement badge. */
export function CraftBadge({
  variant,
  children,
  className,
}: {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[12.5px] font-bold",
        map[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
