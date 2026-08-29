"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/current-user";
import { BrandMark } from "@/components/craft/brand-mark";
import { StreakPill } from "@/components/craft/streak-pill";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Role-aware top nav for The Next Ship. Reads the current user. */
export function TopNav() {
  const { user, logout } = useCurrentUser();
  const router = useRouter();
  const role = user?.role;
  const handle = user?.githubHandle;

  const go = (href: string) => () => router.push(href);

  return (
    <header className="border-line bg-background/70 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[60px] w-full max-w-5xl items-center gap-6 px-6">
        <Link href={role === "startup" ? "/startup" : "/home"}>
          <BrandMark />
        </Link>

        {role === "startup" ? (
          <nav className="text-muted-foreground flex gap-4 text-sm font-semibold">
            <Link href="/startup" className="hover:text-foreground">
              Mis retos
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
            <Link href="/leaderboard" className="hover:text-foreground">
              Ranking
            </Link>
            <Link href="/community" className="hover:text-foreground">
              Comunidad
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3.5">
          {user ? (
            <>
              {role === "builder" && <StreakPill days={user.streak ?? 0} />}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Menú de cuenta"
                  className="font-display text-ink grid size-[34px] cursor-pointer place-items-center rounded-full text-[13px] font-black outline-none focus-visible:ring-2 focus-visible:ring-sand"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg,var(--tan),var(--sand))",
                  }}
                >
                  {(user.name?.[0] ?? "?").toUpperCase()}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  <div className="px-1.5 py-1.5">
                    <div className="font-display text-foreground text-sm font-bold">
                      {user.name}
                    </div>
                    {handle && (
                      <div className="text-muted-foreground font-mono text-xs">
                        @{handle}
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {role === "builder" ? (
                    <>
                      {handle && (
                        <DropdownMenuItem onClick={go(`/u/${handle}`)}>
                          🪪 Passport
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={go("/skills")}>
                        🗺️ Skill Map
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={go("/opportunities")}>
                        💼 Oportunidades
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={go("/rewards")}>
                        🔥 Recompensas
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={go("/startup")}>
                      🏢 Mi panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                  >
                    Salir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "craftSecondary" }),
                "!px-4 !py-2 text-[13px]",
              )}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
