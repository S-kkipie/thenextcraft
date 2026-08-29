"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/current-user";
import { BrandMark } from "@/components/craft/brand-mark";
import { StreakPill } from "@/components/craft/streak-pill";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Role-aware top nav for The Next Ship. Reads the current user. */
export function TopNav() {
  const { user } = useCurrentUser();
  const role = user?.role;
  const handle = user?.githubHandle;

  return (
    <header className="border-line bg-background/70 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[60px] w-full max-w-5xl items-center gap-6 px-6">
        <Link href="/home">
          <BrandMark />
        </Link>

        {role === "startup" ? (
          <nav className="text-muted-foreground flex gap-4 text-sm font-semibold">
            <Link href="/challenges" className="hover:text-foreground">
              Retos
            </Link>
            <Link href="/startup/publicar" className="hover:text-foreground">
              Publicar
            </Link>
          </nav>
        ) : (
          <nav className="text-muted-foreground flex gap-4 text-sm font-semibold">
            <Link href="/challenges" className="hover:text-foreground">
              Retos
            </Link>
            {handle && (
              <Link href={`/u/${handle}`} className="hover:text-foreground">
                Passport
              </Link>
            )}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3.5">
          {user ? (
            <>
              {role === "builder" && <StreakPill days={user.streak ?? 0} />}
              <span
                className="font-display text-ink grid size-[34px] place-items-center rounded-full text-[13px] font-black"
                style={{ backgroundImage: "linear-gradient(135deg,var(--tan),var(--sand))" }}
              >
                {(user.name?.[0] ?? "?").toUpperCase()}
              </span>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "craftSecondary" }), "!px-4 !py-2 text-[13px]")}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
