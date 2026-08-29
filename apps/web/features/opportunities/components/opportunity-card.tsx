"use client";

import { useState } from "react";
import { CraftBadge } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Id } from "@thenextcraft/backend/dataModel";
import type { Opportunity } from "../hooks";
import { PixelIcon } from "@/components/craft/pixel-icon";
import { opportunityResponse, type OpportunityResponse } from "../schema";

/**
 * Tarjeta "Te descubrieron": una startup contactó al builder por su trabajo.
 * Primaria = aceptar la conversación (cierra el loop hacia la contratación);
 * "Ver" despliega el mensaje completo. El estado (sent/accepted/declined) se
 * refleja solo — la query es reactiva tras `respond`.
 */
export function OpportunityCard({
  opportunity,
  onRespond,
}: {
  opportunity: Opportunity;
  onRespond: (
    id: Id<"opportunities">,
    status: OpportunityResponse,
  ) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { startupName, initials, role, matchPct, reason, challengeTitle, status } =
    opportunity;

  const accept = async () => {
    setBusy(true);
    try {
      await onRespond(opportunity._id, opportunityResponse.enum.accepted);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card card-hover flex flex-col">
      <div className="mb-3.5 flex items-center gap-3">
        <div className="font-display bg-tan text-cream grid size-[38px] flex-none place-items-center rounded-[10px] text-sm font-bold">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-display text-foreground truncate text-sm font-bold leading-tight">
            {startupName}
          </div>
          <span className="eyebrow text-[11px]">
            Te descubrieron
          </span>
        </div>
        {matchPct != null && (
          <div className="ml-auto flex-none">
            <CraftBadge variant="top">
            <PixelIcon name="target" size={12} /> {matchPct}% match
          </CraftBadge>
          </div>
        )}
      </div>

      <h3 className="font-display text-foreground mb-1.5 text-lg font-bold">
        {role}
      </h3>

      {reason && (
        <p
          className={cn(
            "text-muted-foreground mb-3.5 text-sm",
            !expanded && "line-clamp-2",
          )}
        >
          {reason}
        </p>
      )}

      {challengeTitle && (
        <div className="border-line-2 bg-ink-2 mb-4 rounded-xl border px-3 py-2 text-[13px]">
          <span className="text-faint font-semibold">Por tu trabajo en </span>
          <span className="text-foreground font-semibold">«{challengeTitle}»</span>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2.5">
        {status === "sent" && (
          <Button variant="craftSecondary" onClick={accept} disabled={busy}>
            {busy ? "Aceptando…" : "Aceptar conversación"}
          </Button>
        )}
        {status === "accepted" && (
          <CraftBadge variant="ship">
          <PixelIcon name="check" size={12} /> Conversación aceptada
        </CraftBadge>
        )}
        {status === "declined" && (
          <span className="text-faint text-[13px] font-semibold">
            Oportunidad descartada
          </span>
        )}
        <Button
          variant="craftGhost"
          className="ml-auto"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Ocultar" : "Ver"}
        </Button>
      </div>
    </div>
  );
}
