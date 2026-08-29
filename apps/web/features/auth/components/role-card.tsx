import { cn } from "@/lib/utils";
import { PixelIcon, type PixelIconName } from "@/components/craft/pixel-icon";

type RoleCardProps = {
  icon: PixelIconName;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
};

/** Selectable role card (Builder / Startup). Tactile lift on hover, amber ring when picked. */
export function RoleCard({ icon, title, desc, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "card group relative flex flex-col items-start gap-1 p-4 text-left transition-all",
        "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-[var(--phos)] bg-panel-2 ring-2 ring-[var(--phos)]/40"
          : "border-line hover:border-line-2",
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[var(--phos)] text-ink">
          <PixelIcon name="check" size={11} />
        </span>
      )}
      <PixelIcon name={icon} size={26} className="text-[var(--phos)]" />
      <span className="mt-2 font-heading text-base font-semibold text-foreground">
        {title}
      </span>
      <span className="text-[13px] text-muted-foreground">{desc}</span>
    </button>
  );
}
