import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "./section-title";
import type { NextStep } from "../schema";

/** "Próximo paso" callout — terra edge, single suggested action. */
export function NextStepCard({ step }: { step: NextStep }) {
  return (
    <div className="card mt-[18px] border-l-[3px] border-l-[var(--cyan)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow className="text-[var(--cyan)]">Próximo paso</Eyebrow>
          <div className="font-display mt-2 text-base font-bold text-foreground">
            {step.title}
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{step.body}</p>
        </div>
        {step.ctaLabel && step.ctaHref ? (
          <Button
            render={<Link href={step.ctaHref} />}
            variant="craftSecondary"
            size="sm"
          >
            {step.ctaLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
