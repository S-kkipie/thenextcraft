import { SectionTitle } from "./section-title";
import type { ActivityItem } from "../schema";

/** "Actividad reciente" — derived from real ships + level ups. */
export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section>
      <SectionTitle>Actividad reciente</SectionTitle>
      {items.length === 0 ? (
        <div className="rounded-xl border border-line bg-ink-2 p-4 text-[13px] text-muted-foreground">
          Aún no hay actividad. Toma un reto y empieza a shipear.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink-2 px-4 py-3"
            >
              <span className="text-sm text-foreground">
                {a.icon} {a.text}
              </span>
              {a.when ? (
                <span className="text-xs text-muted-foreground">{a.when}</span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
