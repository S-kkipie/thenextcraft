"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

import { LiquidShader, BrandMark } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/current-user";
import { GithubMark } from "@/features/auth/components/github-mark";
import { OnboardingForm } from "@/features/auth/forms/onboarding-form";

/** /login — liquid-shader hero, centered auth card. Intro → onboarding step. */
export function LoginScreen() {
  const router = useRouter();
  const { signIn, signOut } = useAuthActions();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      router.replace("/home");
    }
  }, [isAuthenticated, isLoading, router, user]);

  const showOnboarding =
    !isLoading && isAuthenticated && user !== null && !user.role;

  const handleSignIn = async () => {
    setError(null);
    setIsStarting(true);
    try {
      await signIn("github", { redirectTo: "/login" });
    } catch {
      setError("No pudimos iniciar sesión con GitHub. Inténtalo de nuevo.");
      setIsStarting(false);
    }
  };

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
          {!showOnboarding ? (
            <div className="grid gap-4">
              <Button
                variant="craft"
                className="h-12 w-full text-base"
                disabled={isLoading || isStarting}
                onClick={() => void handleSignIn()}
              >
                <GithubMark className="size-5" />
                {isStarting ? "Abriendo GitHub…" : "Continuar con GitHub"}
              </Button>
              {error && (
                <p role="alert" className="text-destructive text-center text-sm">
                  {error}
                </p>
              )}
              <p className="text-center text-xs text-faint">
                Solo perfil básico y email · sin acceso a repositorios privados
              </p>
            </div>
          ) : (
            <OnboardingForm onBack={() => void signOut()} />
          )}
        </div>
      </div>
    </main>
  );
}
