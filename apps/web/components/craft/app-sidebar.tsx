"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Home,
  MessageSquare,
  Swords,
  Trophy,
  Boxes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentBuilder } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { Meter } from "./metrics";

type NavItem = { href: string; label: string; icon: LucideIcon; ready: boolean };

const NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: Home, ready: true },
  { href: "/desafios", label: "Desafíos", icon: Swords, ready: true },
  { href: "/proyectos", label: "Proyectos", icon: Boxes, ready: false },
  { href: "/skill-map", label: "Skill Map", icon: Compass, ready: false },
  { href: "/mensajes", label: "Mensajes", icon: MessageSquare, ready: false },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell, ready: false },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, ready: false },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2" aria-label="thenextcraft">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
        <svg viewBox="0 0 24 24" className="size-4 text-primary" aria-hidden>
          <path
            d="M3 6l9 5 9-5M3 6v12l9 5 9-5V6M3 6l9-5 9 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[200px] shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar py-4 md:flex">
      <Logo />

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV.map(({ href, label, icon: Icon, ready }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          // Las secciones que aún no existen se ven, pero no navegan a un 404.
          if (!ready) {
            return (
              <span
                key={href}
                aria-disabled
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground/50"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href={`/u/${currentBuilder.handle}`}
        className="mx-2 flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors hover:bg-sidebar-accent/50"
      >
        <Avatar size="lg">
          <AvatarFallback className="bg-brand/20 text-xs font-medium text-foreground">
            AR
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-xs font-medium">{currentBuilder.name}</div>
          <div className="text-[11px] text-muted-foreground">
            Nivel {currentBuilder.level}
          </div>
        </div>
        <Meter
          value={currentBuilder.xp}
          max={currentBuilder.xpToNextLevel}
          className="h-1 w-16"
        />
      </Link>
    </aside>
  );
}

/** En móvil el rail se vuelve una barra superior deslizable. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-sidebar-border bg-sidebar px-2 py-2 md:hidden">
      <Logo />
      {NAV.filter((i) => i.ready).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm",
              active
                ? "bg-sidebar-accent font-medium"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
