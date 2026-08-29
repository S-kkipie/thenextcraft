import Link from "next/link";
import { StatusPill, type ChallengeStatus } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./section-title";
import type { ActiveSubmission, StatusTone } from "../schema";

/** Our submission-status tone → the kit's challenge-status color key. */
const TONE_TO_STATUS: Record<StatusTone, ChallengeStatus> = {
  sand: "review",
  sage: "open",
  terra: "live",
};

function ActiveCard({ item }: { item: ActiveSubmission }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-[22px] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-line-2">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold text-foreground">{item.title}</h3>
          <div className="mt-1 text-[13px] text-muted-foreground">
            {[item.company, item.sector].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>
        <StatusPill status={TONE_TO_STATUS[item.statusTone]}>
          {item.statusLabel}
        </StatusPill>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-faint">
          {item.daysLeft !== undefined ? (
            <>
              ⏱ <b className="text-foreground">{item.daysLeft}</b> días restantes
            </>
          ) : (
            "⏱ sin fecha"
          )}
        </span>
        <Button render={<Link href={item.href} />} variant="craftGhost" size="sm">
          Ver submission
        </Button>
      </div>
    </div>
  );
}

/** "Tus retos activos" — in-flight submissions. Hidden when none. */
export function ActiveChallenges({ items }: { items: ActiveSubmission[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <SectionTitle>Tus retos activos</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <ActiveCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
