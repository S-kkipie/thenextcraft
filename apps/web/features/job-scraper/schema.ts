import { z } from "zod";

// Single source of truth para el scrape. El form (react-hook-form + zodResolver)
// y los args `v` de convex/jobs.scrapeCompany espejan esta forma.
export const scrapeCompanyInput = z.object({
  company: z.string().min(2, "Mínimo 2 caracteres"),
  location: z.string().optional(),
  maxItems: z.number().int().min(1).max(25).optional(),
});

export type ScrapeCompanyInput = z.infer<typeof scrapeCompanyInput>;
