import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPill, type ChallengeStatus } from "./status-pill";
import { cn } from "@/lib/utils";

/** Presentational challenge (reto) card. */
export function ChallengeCard({
  title,
  company,
  sector,
  initials,
  problem,
  reward,
  tech = [],
  participants,
  days,
  status,
  href,
  className,
}: {
  title: string;
  company: string;
  sector?: string;
  initials: string;
  problem?: string;
  reward?: string;
  tech?: string[];
  participants?: number;
  days?: number;
  status?: ChallengeStatus;
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line bg-card hover:border-line-2 rounded-2xl border p-[22px] transition-all hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="mb-3.5 flex items-center gap-3">
        <div className="font-display bg-tan text-cream grid size-[38px] flex-none place-items-center rounded-[10px] text-sm font-black">
          {initials}
        </div>
        <div className="font-display text-sm font-extrabold leading-tight">
          {company}
          {sector && (
            <span className="text-faint block text-xs font-semibold">{sector}</span>
          )}
        </div>
        {reward && (
          <div className="font-display ml-auto text-right">
            <b className="text-sand text-[15px]">{reward}</b>
          </div>
        )}
      </div>
      {status && (
        <div className="mb-2">
          <StatusPill status={status} />
        </div>
      )}
      <h3 className="font-display mb-2 text-lg font-extrabold">{title}</h3>
      {problem && <p className="text-muted-foreground mb-3.5 text-sm">{problem}</p>}
      {tech.length > 0 && (
        <div className="mb-3.5 flex flex-wrap gap-2">
          {tech.map((t) => (
            <span
              key={t}
              className="border-line-2 bg-panel-2 text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-bold"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="text-faint mb-4 flex gap-4 text-xs font-semibold">
        {participants != null && <span>👥 {participants}</span>}
        {days != null && <span>⏱ {days}d</span>}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(buttonVariants({ variant: "craftSecondary" }), "w-full justify-center")}
        >
          Participar →
        </Link>
      )}
    </div>
  );
}
