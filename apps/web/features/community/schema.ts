import { z } from "zod";

/**
 * Filtro del feed de comunidad. zod = única fuente de tipo (AGENTS §1): el tipo
 * se deriva con z.infer, nunca se escribe a mano.
 */
export const feedFilter = z.enum(["all", "ships", "badges"]);
export type FeedFilter = z.infer<typeof feedFilter>;

/** Pills del feed (valor + etiqueta ES), en orden de render. */
export const FEED_FILTERS: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "ships", label: "Ships" },
  { value: "badges", label: "Badges" },
];
