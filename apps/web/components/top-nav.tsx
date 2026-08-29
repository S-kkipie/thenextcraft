"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useCurrentUser } from "@/lib/current-user";
import { AvatarFrame } from "@/components/craft/avatar-frame";
import { BrandMark } from "@/components/craft/brand-mark";
import { StreakPill } from "@/components/craft/streak-pill";
import { PixelIcon, type PixelIconName } from "@/components/craft/pixel-icon";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/*
 * Barra superior.
 *
 * Antes eran cinco links de texto plano, todos iguales, y sin decir en cuál
 * estabas. Ahora:
 *
 *  - Cada destino lleva su PixelIcon, así se reconocen por forma y no solo
 *    leyendo. En móvil el texto se cae y quedan los iconos.
 *  - La pestaña activa se marca con fósforo y una barra anclada a la línea del
 *    header: saber dónde estás es lo primero que pide una nav.
 *  - Una segunda fila muestra la ruta como un prompt de terminal, que ata la
 *    app al lenguaje de la landing y da migas en todas las pantallas.
 *  - El avatar es la foto real de GitHub con el nivel encima, no una inicial.
 */

type Tab = { href: string; label: string; icon: PixelIconName };

const BUILDER_TABS: Tab[] = [
  { href: "/home", label: "Inicio", icon: "terminal" },
  { href: "/challenges", label: "Retos", icon: "target" },
  { href: "/leaderboard", label: "Ranking", icon: "trophy" },
  { href: "/community", label: "Comunidad", icon: "users" },
];

const STARTUP_TABS: Tab[] = [
  { href: "/startup", label: "Mis retos", icon: "building" },
  { href: "/startup/publicar", label: "Publicar", icon: "plus" },
];

/** Una ruta hija marca activa a su pestaña: /challenges/abc activa /challenges. */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav() {
  const { user, logout } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const role = user?.role;
  const handle = user?.githubHandle;
  const tabs = role === "startup" ? STARTUP_TABS : BUILDER_TABS;
  const go = (href: string) => () => router.push(href);

  const menu: Tab[] =
    role === "startup"
      ? [{ href: "/startup", label: "Mi panel", icon: "building" }]
      : [
          ...(handle
            ? [
                {
                  href: `/u/${handle}`,
                  label: "Passport",
                  icon: "card" as const,
                },
              ]
            : []),
          { href: "/skills", label: "Skill Map", icon: "map" },
          { href: "/opportunities", label: "Oportunidades", icon: "briefcase" },
          { href: "/rewards", label: "Recompensas", icon: "fire" },
        ];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgb(11_14_11_/_0.82)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[60px] w-full max-w-5xl items-center gap-5 px-6">
        <Link
          href={role === "startup" ? "/startup" : "/home"}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--phos)]"
        >
          <BrandMark />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Principal">
          {tabs.map((tab) => {
            const on = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={on ? "page" : undefined}
                title={tab.label}
                className={cn(
                  "relative flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[13px] font-semibold transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phos)]",
                  on
                    ? "text-[var(--phos)]"
                    : "text-muted-foreground hover:bg-[var(--panel)] hover:text-foreground",
                )}
              >
                <PixelIcon name={tab.icon} size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
                {on && (
                  <span
                    aria-hidden
                    className="absolute inset-x-1.5 -bottom-[11px] h-[2px] bg-[var(--phos)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3.5">
          {user ? (
            <>
              {role === "builder" && <StreakPill days={user.streak ?? 0} />}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Menú de cuenta"
                  className="cursor-pointer rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--phos)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
                >
                  <AvatarFrame
                    name={user.name}
                    src={user.avatarUrl}
                    size={34}
                    level={user.level ?? undefined}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <div className="flex items-center gap-3 px-1.5 py-2">
                    <AvatarFrame
                      name={user.name}
                      src={user.avatarUrl}
                      size={38}
                      brackets={false}
                    />
                    <div className="min-w-0">
                      <div className="font-display truncate text-sm font-bold text-foreground">
                        {user.name}
                      </div>
                      {handle && (
                        <div className="data truncate text-xs text-muted-foreground">
                          @{handle}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {menu.map((item) => (
                    <DropdownMenuItem key={item.href} onClick={go(item.href)}>
                      <PixelIcon
                        name={item.icon}
                        size={13}
                        className="mr-2 text-[var(--phos)]"
                      />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                  >
                    <PixelIcon name="cross" size={13} className="mr-2" />
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

      {/* Prompt de ruta: migas en todas las pantallas, en el idioma de la landing. */}
      <div className="border-t border-[var(--line)] bg-[var(--ink-2)]">
        <div className="data mx-auto flex h-[26px] w-full max-w-5xl items-center gap-2 px-6 text-[11px] text-[var(--faint)]">
          <span className="size-1.5 rounded-full bg-[var(--phos)]" />
          the-next-ship
          <span className="text-[var(--line-2)]">~</span>
          <span className="truncate text-[var(--muted)]">{pathname}</span>
        </div>
      </div>
    </header>
  );
}
