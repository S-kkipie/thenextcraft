import { cn } from "@/lib/utils";

/** 12px uppercase tracked label (mockup `.eyebrow`). */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-xs font-extrabold uppercase tracking-[0.14em] text-faint",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Section heading (mockup `.section-title`). */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-9 mb-4 font-display text-lg font-extrabold text-foreground">
      {children}
    </h2>
  );
}
