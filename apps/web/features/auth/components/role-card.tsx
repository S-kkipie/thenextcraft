import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type RoleCardProps = {
  emoji: string;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
};

/** Selectable role card (Builder / Startup). Tactile lift on hover, amber ring when picked. */
export function RoleCard({ emoji, title, desc, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col items-start gap-1 rounded-2xl border bg-panel p-4 text-left transition-all",
        "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-sand bg-panel-2 ring-2 ring-sand/40"
          : "border-line hover:border-line-2",
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-sand text-ink">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="mt-2 font-heading text-base font-semibold text-foreground">
        {title}
      </span>
      <span className="text-[13px] text-muted-foreground">{desc}</span>
    </button>
  );
}
