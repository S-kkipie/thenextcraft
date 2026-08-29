"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "@/lib/current-user";

// Routes browsable without a session. Everything else under (app) is gated.
const PUBLIC: (string | RegExp)[] = [
  "/challenges", // browse + detail
  "/leaderboard",
  "/community",
  /^\/u\//, // public passports
];

function isPublic(path: string): boolean {
  return PUBLIC.some((p) =>
    typeof p === "string"
      ? path === p || path.startsWith(p + "/")
      : p.test(path),
  );
}

/** Redirects unauthenticated users on private routes to /login. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { userId, authReady } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const pub = isPublic(pathname);

  useEffect(() => {
    if (authReady && !userId && !pub) {
      router.replace("/login");
    }
  }, [authReady, userId, pub, router]);

  // Private route while resolving auth or logged out → hold (no flash of private UI).
  if (!pub && (!authReady || !userId)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-muted-foreground text-sm">Cargando…</span>
      </div>
    );
  }

  return <>{children}</>;
}
