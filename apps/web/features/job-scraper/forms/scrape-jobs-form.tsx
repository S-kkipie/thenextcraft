"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCurrentUser } from "@/lib/current-user";
import {
  scrapeCompanyInput,
  type ScrapeCompanyInput,
} from "@/features/job-scraper/schema";
import { useScrapeCompany } from "@/features/job-scraper/hooks";
import { JobList } from "@/features/job-scraper/components/job-list";

export function ScrapeJobsForm() {
  const { userId } = useCurrentUser();
  const scrape = useScrapeCompany();
  const [active, setActive] = useState<string>();

  const form = useForm<ScrapeCompanyInput>({
    resolver: zodResolver(scrapeCompanyInput),
    defaultValues: { company: "", location: "", maxItems: 25 },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!userId) return;
    const company = values.company.trim();
    try {
      const { inserted, total } = await scrape({
        company,
        location: values.location?.trim() || undefined,
        maxItems: values.maxItems,
        scrapedBy: userId,
      });
      setActive(company);
      toast.success(`${total} ofertas (${inserted} nuevas) de ${company}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo scrapear",
      );
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-sand">
          Sourcing
        </span>
        <h1 className="text-3xl font-extrabold">Ofertas de una empresa</h1>
        <p className="max-w-[56ch] text-muted-foreground">
          Scrapea las ofertas de LinkedIn de cualquier empresa vía Apify.
        </p>
      </header>

      {!userId && (
        <div className="rounded-xl border border-line-2 bg-panel-2 p-4 text-sm text-muted-foreground">
          Inicia sesión (arriba a la derecha) para scrapear ofertas.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Stripe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Remote, Madrid, EU…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máx. ofertas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        Number.isNaN(e.target.valueAsNumber)
                          ? undefined
                          : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>Entre 1 y 25.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="craft"
            disabled={!userId || form.formState.isSubmitting}
            className="self-start"
          >
            {form.formState.isSubmitting ? "Scrapeando…" : "Scrapear ofertas"}
          </Button>
        </form>
      </Form>

      {active && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold">Ofertas de {active}</h2>
          <JobList company={active} />
        </div>
      )}
    </div>
  );
}
