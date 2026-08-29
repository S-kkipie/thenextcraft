"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@thenextcraft/backend/dataModel";
import { useOpportunities, useRespondToOpportunity } from "../hooks";
import type { OpportunityResponse } from "../schema";
import { OpportunityCard } from "./opportunity-card";

/** /opportunities — startups que descubrieron el trabajo del builder. */
export function OpportunitiesList() {
  const { userId } = useCurrentUser();
  const opportunities = useOpportunities(userId);
  const respond = useRespondToOpportunity();

  const onRespond = async (
    id: Id<"opportunities">,
    status: OpportunityResponse,
  ) => {
    await respond({ opportunityId: id, status });
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="text-sand text-xs font-extrabold uppercase tracking-[0.14em]">
          Te descubrieron
        </span>
        <h1 className="text-4xl font-extrabold">Oportunidades</h1>
        <p className="text-muted-foreground max-w-[56ch]">
          Startups que vieron tu proof-of-work y quieren hablar contigo. Acepta
          la conversación para dar el siguiente paso.
        </p>
      </header>

      {userId === null ? (
        <div className="border-line bg-panel rounded-2xl border p-8 text-center">
          <h2 className="font-display text-foreground text-2xl font-black">
            Entra para ver quién te busca
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Inicia sesión desde la barra superior. Cuando una startup te contacte
            por tu trabajo, aparecerá aquí.
          </p>
          <div className="mt-5 flex justify-center">
            <Button render={<Link href="/challenges" />} variant="craftSecondary">
              Explorar retos
            </Button>
          </div>
        </div>
      ) : opportunities === undefined ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="border-line bg-panel rounded-2xl border p-10 text-center">
          <div className="mb-3 text-3xl">📡</div>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Cuando una startup te contacte por tu trabajo, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {opportunities.map((o) => (
            <OpportunityCard key={o._id} opportunity={o} onRespond={onRespond} />
          ))}
        </div>
      )}
    </section>
  );
}
