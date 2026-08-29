"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LiquidShader, BrandMark } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/current-user";
import { GithubMark } from "@/features/auth/components/github-mark";
import { RoleCard } from "@/features/auth/components/role-card";
import { ROLE_META, startupProfileInput } from "@/features/auth/schema";

/** /login — GitHub OAuth, then a one-time builder/startup pick (onboarding). */
export function LoginScreen() {
  const router = useRouter();
  const { user, userId, authReady, needsOnboarding, signInGithub, setRole } =
    useCurrentUser();
  const [role, setRoleSel] = useState<"builder" | "startup">("builder");
  const [company, setCompany] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Signed in AND onboarded → skip login, landing per role.
  useEffect(() => {
    if (authReady && userId && !needsOnboarding) {
      router.replace(user?.role === "startup" ? "/startup" : "/home");
    }
  }, [authReady, userId, needsOnboarding, user?.role, router]);

  const onSignIn = async () => {
    setBusy(true);
    try {
      await signInGithub();
    } finally {
      setBusy(false);
    }
  };

  const onFinish = async () => {
    setError(null);
    // Startups: validate name (required) + LinkedIn URL (optional) with zod.
    let linkedinUrl: string | undefined;
    if (role === "startup") {
      const parsed = startupProfileInput.safeParse({
        companyName: company.trim(),
        linkedinUrl: linkedin.trim(),
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
        return;
      }
      linkedinUrl = parsed.data.linkedinUrl || undefined;
    }
    setBusy(true);
    try {
      await setRole(
        role,
        role === "startup" ? company.trim() || undefined : undefined,
        linkedinUrl,
      );
      router.replace("/home");
    } finally {
      setBusy(false);
    }
  };

  const showOnboarding = authReady && userId && needsOnboarding;

  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-6 py-10">
      <LiquidShader className="absolute inset-0 -z-10 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/10 to-background/80"
      />

      <div className="w-full max-w-[440px] rounded-3xl border border-line bg-panel/80 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="mb-5" />
          <h1 className="text-[32px] leading-tight font-black">
            Entra a The Next Ship
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Resuelve retos reales. Consigue el trabajo.
          </p>
        </div>

        <div className="mt-7">
          {showOnboarding ? (
            <div className="grid gap-4">
              <p className="text-center text-sm text-muted-foreground">
                Una cosa más — ¿cómo quieres entrar?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_META.map((r) => (
                  <RoleCard
                    key={r.value}
                    emoji={r.emoji}
                    title={r.title}
                    desc={r.desc}
                    selected={role === r.value}
                    onSelect={() => setRoleSel(r.value)}
                  />
                ))}
              </div>
              {role === "startup" && (
                <div className="grid gap-2">
                  <Input
                    placeholder="Nombre de tu startup"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                  <Input
                    placeholder="URL de LinkedIn (opcional)"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                  <p className="text-xs text-faint">
                    Con tu LinkedIn, el copiloto entiende el contexto de tu
                    empresa. Si lo dejas vacío, te preguntará cuál es.
                  </p>
                </div>
              )}
              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
              <Button
                variant="craft"
                className="h-12 w-full text-base"
                onClick={onFinish}
                disabled={busy}
              >
                {busy ? "Entrando…" : "Entrar a The Next Ship"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <Button
                variant="craft"
                className="h-12 w-full text-base"
                onClick={onSignIn}
                disabled={busy}
              >
                <GithubMark className="size-5" />{" "}
                {busy ? "Redirigiendo…" : "Continuar con GitHub"}
              </Button>
              <p className="text-center text-xs text-faint">
                Proof-of-work hiring · nunca corremos tu código
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
