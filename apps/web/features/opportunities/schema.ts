import { z } from "zod";

/**
 * Opportunities — "Te descubrieron". zod = única fuente de tipos (AGENTS §1).
 *
 * El builder responde una oportunidad aceptándola o descartándola: ese enum se
 * valida aquí y se espeja con los validadores `v` de convex/opportunities.ts
 * (mismos literales). La forma de la tarjeta se deriva del retorno real de la
 * query en ./hooks.ts (FunctionReturnType) — no se re-declara a mano.
 */
export const opportunityResponse = z.enum(["accepted", "declined"]);
export type OpportunityResponse = z.infer<typeof opportunityResponse>;
