"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

import { ShipForm } from "../forms/ship-form";
import { CriteriaSidebar } from "./criteria-sidebar";

// Pantalla de ship. Lee el reto una vez (encabezado + sidebar comparten la
// query reactiva) y monta el formulario. `api.challenges.get` lo provee el
// dominio de challenges (otro owner) — ver blockers.
export function ShipView({ challengeId }: { challengeId: Id<"challenges"> }) {
  const challenge = useQuery(api.challenges.get, { challengeId });

  return (
    <div className="flex flex-col gap-1">
      {/* Migas */}
      <nav className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
        <Link href="/challenges" className="hover:text-foreground">
          Retos
        </Link>
        <span className="text-faint">/</span>
        <Link
          href={`/challenges/${challengeId}`}
          className="hover:text-foreground max-w-[220px] truncate"
        >
          {challenge?.title ?? "Reto"}
        </Link>
        <span className="text-faint">/</span>
        <span className="text-foreground">Shipear</span>
      </nav>

      <h1 className="mt-3 text-3xl font-black">Shipear tu solución</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        {challenge?.title
          ? `Reto: ${challenge.title}`
          : "Registra el link de tu trabajo."}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ShipForm challengeId={challengeId} />
        <CriteriaSidebar challenge={challenge} />
      </div>
    </div>
  );
}
