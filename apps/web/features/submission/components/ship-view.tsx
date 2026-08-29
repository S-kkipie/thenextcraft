"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import "../copilot/copilot-theme.css";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

import { ShipForm } from "../forms/ship-form";
import { ShipCopilot } from "../copilot/ship-copilot";
import { CriteriaSidebar } from "./criteria-sidebar";

const COPILOT_INSTRUCTIONS = `Eres el copiloto de esta vacante para el builder que va a shipear su solución.
Conoces el reto (vacante) y la empresa que lo publicó, y tienes acceso a ofertas reales de LinkedIn de esa empresa como contexto.
Ayuda al builder a entender qué busca la empresa, el rol y cómo alinear su entrega con los criterios de éxito.
Si NO sabes de qué empresa es el reto (companyName y linkedinUrl vacíos), pregúntale primero al usuario cuál es la empresa antes de usar la herramienta scrapeCompany.
Usa scrapeCompany para traer ofertas de LinkedIn cuando te falte contexto de la empresa.
Responde en español, breve y accionable.`;

// Pantalla de ship. Lee el reto una vez (encabezado + sidebar comparten la
// query reactiva) y monta el formulario. El copiloto va aparte: ShipCopilot
// inyecta el contexto (reto + empresa + jobs) y expone scrapeCompany;
// CopilotSidebar es la UI de chat (montada solo en cliente para evitar el
// mismatch de hidratación del abierto/cerrado). Estilada con copilot-theme.css.
export function ShipView({ challengeId }: { challengeId: Id<"challenges"> }) {
  const challenge = useQuery(api.challenges.get, { challengeId });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ShipCopilot challenge={challenge ?? null} />

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

        <h1 className="mt-3 text-3xl font-bold">Shipear tu solución</h1>
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

      {mounted && (
        <CopilotSidebar
          instructions={COPILOT_INSTRUCTIONS}
          defaultOpen={false}
          clickOutsideToClose
          labels={{
            title: "Copiloto de la vacante",
            initial:
              "¡Hola! Puedo ayudarte a entender esta vacante y la empresa. Pregúntame lo que necesites para tu entrega.",
          }}
        />
      )}
    </CopilotKit>
  );
}
