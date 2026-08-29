"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LiquidShader, BrandMark } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/current-user";
import { GithubMark } from "@/features/auth/components/github-mark";
import { OnboardingForm } from "@/features/auth/forms/onboarding-form";

/** /login — liquid-shader hero, centered auth card. Intro → onboarding step. */
export function LoginScreen() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const [step, setStep] = useState<"intro" | "onboarding">("intro");

  // Already signed in → skip login.
  useEffect(() => {
    if (userId) router.replace("/home");
  }, [userId, router]);

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
          {step === "intro" ? (
            <div className="grid gap-4">
              <Button
                variant="craft"
                className="h-12 w-full text-base"
                onClick={() => setStep("onboarding")}
              >
                <GithubMark className="size-5" /> Continuar con GitHub
              </Button>
              <p className="text-center text-xs text-faint">
                Proof-of-work hiring · nunca corremos tu código
              </p>
            </div>
          ) : (
            <OnboardingForm onBack={() => setStep("intro")} />
          )}
        </div>
      </div>
    </main>
  );
}
