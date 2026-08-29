import { Brain, Database, Layout, Rocket, Server, Shield, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Difficulty, Track } from "@/lib/mock/types";

/**
 * Un track = una rama del Skill Map. Icono y color viven acá y en ningún otro
 * lado, para que el hexágono del mapa, el chip del reto y el card del proyecto
 * siempre pinten igual.
 */
export const TRACKS: Record<
  Track,
  { label: string; icon: LucideIcon; tint: string; ring: string }
> = {
  fullstack: {
    label: "Full Stack",
    icon: Rocket,
    tint: "text-primary-foreground",
    ring: "ring-primary/60",
  },
  backend: {
    label: "Backend",
    icon: Server,
    tint: "text-success",
    ring: "ring-success/40",
  },
  frontend: {
    label: "Frontend",
    icon: Layout,
    tint: "text-gem",
    ring: "ring-gem/40",
  },
  "base-de-datos": {
    label: "Base de Datos",
    icon: Database,
    tint: "text-brand-soft",
    ring: "ring-brand/40",
  },
  devops: {
    label: "DevOps",
    icon: Wrench,
    tint: "text-gem",
    ring: "ring-gem/40",
  },
  "ai-ml": {
    label: "AI / ML",
    icon: Brain,
    tint: "text-warning",
    ring: "ring-warning/40",
  },
  seguridad: {
    label: "Seguridad",
    icon: Shield,
    tint: "text-destructive",
    ring: "ring-destructive/40",
  },
};

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  principiante: "bg-success/15 text-success",
  intermedio: "bg-warning/15 text-warning",
  avanzado: "bg-destructive/15 text-destructive",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <Badge className={cn("capitalize", DIFFICULTY_STYLES[difficulty], className)}>
      {difficulty}
    </Badge>
  );
}

export function TrackBadge({ track, className }: { track: Track; className?: string }) {
  const { label, icon: Icon } = TRACKS[track];
  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}

/** Chip de tecnología. Aparece en retos, submissions y en el pasaporte. */
export function TechChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

/**
 * Marca de GitHub. Lucide v1 sacó los iconos de marca, así que va inline —
 * y GitHub es la fuente de verdad de la autoría, no un logo decorativo.
 */
export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("size-4", className)} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
