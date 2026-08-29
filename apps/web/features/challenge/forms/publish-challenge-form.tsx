"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { challengeInput, type ChallengeInput } from "@/features/challenge/schema";
import { useCreateChallenge } from "@/features/challenge/hooks";

export function PublishChallengeForm() {
  const { userId } = useCurrentUser();
  const create = useCreateChallenge();
  const router = useRouter();

  const form = useForm<ChallengeInput>({
    resolver: zodResolver(challengeInput),
    defaultValues: {
      title: "",
      businessProblem: "",
      successCriteria: [""],
      reward: "",
      tech: [],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!userId) return;
    try {
      const id = await create({
        startupId: userId,
        title: values.title,
        businessProblem: values.businessProblem,
        successCriteria: values.successCriteria
          .map((s) => s.trim())
          .filter(Boolean),
        reward: values.reward?.trim() || undefined,
        tech: values.tech && values.tech.length > 0 ? values.tech : undefined,
      });
      toast.success("Reto publicado");
      router.push(`/challenges/${id}`);
    } catch {
      toast.error("No se pudo publicar el reto");
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-sand">
          Para startups
        </span>
        <h1 className="text-3xl font-extrabold">Publicar un reto</h1>
        <p className="max-w-[56ch] text-muted-foreground">
          Describe un problema de negocio real. Los builders shipean una
          solución y la IA rankea a los candidatos.
        </p>
      </header>

      {!userId && (
        <div className="rounded-xl border border-line-2 bg-panel-2 p-4 text-sm text-muted-foreground">
          Inicia sesión como startup (arriba a la derecha) para publicar un reto.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Priorizar transacciones fraudulentas en el dashboard"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessProblem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>El problema de negocio</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Qué duele hoy, por qué no escala, qué querrías que pasara…"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cuanto más concreto, mejor rankea la IA a los candidatos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="successCriteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Criterios de éxito</FormLabel>
                <div className="flex flex-col gap-2">
                  {field.value.map((val, i) => (
                    <div key={i} className="flex gap-2">
                      <FormControl>
                        <Input
                          value={val}
                          onChange={(e) => {
                            const next = [...field.value];
                            next[i] = e.target.value;
                            field.onChange(next);
                          }}
                          placeholder={`Criterio ${i + 1}`}
                        />
                      </FormControl>
                      {field.value.length > 1 && (
                        <Button
                          type="button"
                          variant="craftGhost"
                          size="icon"
                          aria-label="Quitar criterio"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((_, j) => j !== i),
                            )
                          }
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="craftGhost"
                  size="sm"
                  className="self-start"
                  onClick={() => field.onChange([...field.value, ""])}
                >
                  + Añadir criterio
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recompensa (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="$1,500 + entrevista" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tech"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tech (opcional)</FormLabel>
                <FormControl>
                  <Input
                    value={(field.value ?? []).join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="Next.js, LLM, Data viz"
                  />
                </FormControl>
                <FormDescription>Separadas por comas.</FormDescription>
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
            Publicar reto
          </Button>
        </form>
      </Form>
    </div>
  );
}
