"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/lib/current-user";
import { useBuilderSubmissions } from "@/features/submission/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Estado del feedback → chip.
const FEEDBACK: Record<string, { label: string; cls: string }> = {
  pending: { label: "Sin feedback", cls: "bg-panel-2 text-muted-foreground" },
  generating: { label: "Generando…", cls: "bg-sand/15 text-sand" },
  ready: { label: "Feedback listo", cls: "bg-sage/15 text-sage" },
  failed: { label: "Sin feedback", cls: "bg-panel-2 text-muted-foreground" },
};

export function MySubmissionsView() {
  const { userId, user } = useCurrentUser();
  const subs = useBuilderSubmissions(userId);

  if (!userId) {
    return (
      <Notice>
        <Link href="/login" className="text-sand font-semibold">
          Entra
        </Link>{" "}
        para ver tus envíos.
      </Notice>
    );
  }
  if (user && user.role === "startup") {
    return <Notice>Esta vista es para builders.</Notice>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Mis envíos</h1>
        <p className="text-muted-foreground text-sm">
          Cada reto que shipeaste y su feedback del AI Judge.
        </p>
      </div>

      {subs === undefined ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="border-line bg-card rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Aún no shipeaste nada.
          </p>
          <Link
            href="/challenges"
            className="text-sand mt-3 inline-block text-sm font-semibold"
          >
            Explorar retos →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subs.map((s) => {
            const fb = FEEDBACK[s.feedbackStatus] ?? FEEDBACK.pending;
            return (
              <Link
                key={s._id}
                href={`/submissions/${s._id}`}
                className="border-line bg-card hover:border-line-2 flex items-center gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display truncate font-extrabold">
                    {s.challengeTitle}
                  </div>
                  <div className="text-faint truncate text-xs">
                    {s.company ?? "Startup"}
                  </div>
                </div>
                <span
                  className={cn(
                    "hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex",
                    fb.cls,
                  )}
                >
                  {fb.label}
                </span>
                {s.score != null && (
                  <div className="text-right">
                    <div className="font-display text-foreground text-lg font-black tabular-nums leading-none">
                      {s.score}
                    </div>
                    <div className="text-faint text-[10px] font-semibold">
                      SCORE
                    </div>
                  </div>
                )}
                <span className="text-faint text-sm">→</span>
              </Link>
            );
          })}
        </div>
      )}
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
