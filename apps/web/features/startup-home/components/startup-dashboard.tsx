"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import { useCurrentUser } from "@/lib/current-user";
import { StatTile, StatusPill } from "@/components/craft";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StartupDashboard() {
  const { user, userId } = useCurrentUser();
  const data = useQuery(
    api.startup.dashboard,
    userId ? { startupId: userId } : "skip",
  );

  if (!userId) {
    return (
      <Notice>
        <Link href="/login" className="text-sand font-semibold">
          Entra
        </Link>{" "}
        para ver tu panel de startup.
      </Notice>
    );
  }
  if (user && user.role !== "startup") {
    return <Notice>Esta vista es para cuentas de startup.</Notice>;
  }

  const stats = data?.stats;
  const challenges = data?.challenges ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">
            Hola, {user?.companyName ?? user?.name ?? "startup"} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Tus retos de negocio y candidatos.
          </p>
        </div>
        <Link
          href="/startup/publicar"
          className={cn(buttonVariants({ variant: "craftSecondary" }))}
        >
          Publicar reto
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile value={stats?.activeRetos ?? "—"} label="RETOS ACTIVOS" accent="sand" />
        <StatTile value={stats?.totalSubmissions ?? "—"} label="SUBMISSIONS" />
        <StatTile value={stats?.shortlisted ?? "—"} label="EN SHORTLIST" accent="sage" />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[15px] font-extrabold">Tus retos</h2>
        {data === undefined ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : challenges.length === 0 ? (
          <div className="border-line bg-card rounded-2xl border p-6 text-center">
            <p className="text-muted-foreground text-sm">Aún no publicaste retos.</p>
            <Link
              href="/startup/publicar"
              className={cn(buttonVariants({ variant: "craft" }), "mt-4")}
            >
              Publicar tu primer reto
            </Link>
          </div>
        ) : (
          challenges.map((c) => (
            <Link
              key={c._id}
              href={`/startup/shortlist/${c._id}`}
              className="border-line bg-card hover:border-line-2 flex items-center gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
            >
              <div className="flex-1">
                <div className="font-display font-extrabold">{c.title}</div>
                <div className="text-faint text-xs">
                  {c.submissionsCount} submissions · {c.shortlistedCount} en shortlist
                </div>
              </div>
              <StatusPill status={c.status === "open" ? "live" : "closed"} />
              {c.reward && (
                <div className="font-display text-sand text-sm">{c.reward}</div>
              )}
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="border-line bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm">
      {children}
    </div>
  );
}
