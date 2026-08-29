import { cn } from "@/lib/utils";

/**
 * Etiqueta de 12px en el display bitmap. Es la `.eyebrow` del kit: misma regla
 * que usa la landing, no una imitación con utilidades sueltas.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("eyebrow", className)}>{children}</div>;
}

/** Titular de sección. Silkscreen: corto y en font-bold (la familia no pasa de 700). */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-9 mb-4 text-lg font-bold text-foreground">{children}</h2>
  );
}
