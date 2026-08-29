"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
import type { Id } from "@thenextcraft/backend/dataModel";

import { shipForm, type ShipForm, TECH_SUGGESTIONS } from "../schema";
import { useShip } from "../hooks";

export function ShipForm({ challengeId }: { challengeId: Id<"challenges"> }) {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const ship = useShip();

  const form = useForm<ShipForm>({
    resolver: zodResolver(shipForm),
    defaultValues: {
      repoUrl: "",
      demoUrl: "",
      description: "",
      tech: [],
      confirmAuthorship: false,
    },
  });

  // Buffer transitorio del chip-input de tech (no es un campo persistido).
  const [techBuffer, setTechBuffer] = useState("");

  const onSubmit = form.handleSubmit(async (values) => {
    if (!userId) {
      toast.error("Inicia sesión para poder shipear.");
      return;
    }
    // `confirmAuthorship` es solo gate: no se envía. Vacíos → undefined.
    try {
      const submissionId = await ship({
        challengeId,
        builderId: userId,
        repositoryUrl: values.repoUrl,
        demoUrl: values.demoUrl || undefined,
        description: values.description || undefined,
        tech: values.tech && values.tech.length > 0 ? values.tech : undefined,
      });
      toast.success("¡Shipeado! ✦ La IA rankea, la startup decide.");
      router.push(`/submissions/${submissionId}`);
    } catch {
      toast.error("No se pudo shipear. Intenta de nuevo.");
    }
  });

  const notImplemented = () =>
    toast.info("Próximamente — defensa de autoría (viva humana).");

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card className="gap-0 p-[22px]">
          <div className="flex flex-col gap-5">
            {/* Repo */}
            <FormField
              control={form.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link del repo (público) <span className="text-terra">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://github.com/…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Demo */}
            <FormField
              control={form.control}
              name="demoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link del deploy / demo{" "}
                    <span className="text-faint">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cómo resuelve el reto?</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Explica tu enfoque y las decisiones clave…"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mapea tu solución a los criterios de evaluación.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tech — chip input */}
            <FormField
              control={form.control}
              name="tech"
              render={({ field }) => {
                const selected = field.value ?? [];
                const add = (raw: string) => {
                  const t = raw.trim();
                  if (t && !selected.includes(t)) field.onChange([...selected, t]);
                  setTechBuffer("");
                };
                const remove = (t: string) =>
                  field.onChange(selected.filter((x) => x !== t));
                return (
                  <FormItem>
                    <FormLabel>Tecnologías usadas</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Next.js, Convex, … (Enter para añadir)"
                        value={techBuffer}
                        onChange={(e) => setTechBuffer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            add(techBuffer);
                          } else if (
                            e.key === "Backspace" &&
                            !techBuffer &&
                            selected.length
                          ) {
                            remove(selected[selected.length - 1]);
                          }
                        }}
                      />
                    </FormControl>
                    {/* Chips seleccionados */}
                    {selected.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => remove(t)}
                            className="border-line-2 bg-panel-2 hover:border-tan inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                          >
                            {t}
                            <span className="text-faint">✕</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Sugerencias */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TECH_SUGGESTIONS.filter(
                        (s) => !selected.includes(s),
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => add(s)}
                          className="border-line text-muted-foreground hover:border-tan hover:text-foreground rounded-full border border-dashed px-2.5 py-1 text-xs"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="border-line border-t" />

            {/* Prueba de autoría (humana) — placeholders */}
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold">
                Prueba de autoría (humana)
              </div>
              <div className="bg-ink-2 border-line rounded-xl border p-4">
                <p className="text-muted-foreground m-0 text-[13px]">
                  La plataforma nunca corre tu código. Defiende tu autoría: graba
                  un video/audio corto sobre tus decisiones clave, o agenda una
                  entrevista con la startup.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="craftGhost"
                    size="sm"
                    onClick={notImplemented}
                  >
                    🎥 Grabar video/audio
                  </Button>
                  <Button
                    type="button"
                    variant="craftGhost"
                    size="sm"
                    onClick={notImplemented}
                  >
                    📅 Agendar entrevista
                  </Button>
                </div>
              </div>
            </div>

            {/* Confirmación de autoría (gate) */}
            <FormField
              control={form.control}
              name="confirmAuthorship"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        className="accent-sand size-4"
                      />
                      <span>Confirmo que este trabajo es de mi autoría.</span>
                    </label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="craftSecondary"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              SHIP IT ✦
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}
