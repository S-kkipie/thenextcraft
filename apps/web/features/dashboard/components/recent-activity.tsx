import {
  PixelIcon,
  type PixelIconName,
} from "@/components/craft/pixel-icon";
import { SectionTitle } from "./section-title";
import type { ActivityItem } from "../schema";

/** "Actividad reciente" — derived from real ships + level ups. */
export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section>
      <SectionTitle>Actividad reciente</SectionTitle>
      <div className="term">
        <div className="term-bar">
          activity ~ tu historial
          <span className="term-hint">{items.length} eventos</span>
        </div>
        {items.length === 0 ? (
          <p className="term-body text-[13px] text-muted-foreground">
            Aún no hay actividad. Toma un reto y empieza a shipear.
          </p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {items.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-sm text-foreground">
                  <PixelIcon
                    name={a.icon as PixelIconName}
                    size={12}
                    className="mr-2 text-[var(--phos)]"
                  />
                  {a.text}
                </span>
                {a.when ? (
                  <span className="data text-xs text-muted-foreground">
                    {a.when}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
