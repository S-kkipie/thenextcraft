import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@thenextcraft/backend/api";

import { useCurrentUser } from "@/lib/current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  onboardingInput,
  ROLE_META,
  type OnboardingInput,
} from "@/features/auth/schema";
import { RoleCard } from "@/features/auth/components/role-card";

/** Completes the profile created by GitHub OAuth, then enters the app. */
export function OnboardingForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingInput),
    defaultValues: {
      name: user?.name ?? "",
      githubHandle: user?.githubHandle ?? "",
    },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const handle = values.githubHandle.replace(/^@/, "");
    await completeOnboarding({
      name: values.name,
      role: values.role,
      githubHandle: handle,
    });
    router.push("/home");
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  className="h-11 rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubHandle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario de GitHub</FormLabel>
              <FormControl>
                <Input
                  placeholder="@ada"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="h-11 rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Cómo quieres entrar?</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_META.map((r) => (
                    <RoleCard
                      key={r.value}
                      emoji={r.emoji}
                      title={r.title}
                      desc={r.desc}
                      selected={field.value === r.value}
                      onSelect={() => field.onChange(r.value)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="craft"
          className="mt-1 h-12 w-full text-base"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Entrando…
            </>
          ) : (
            "Entrar a The Next Ship"
          )}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver
        </button>
      </form>
    </Form>
  );
}
