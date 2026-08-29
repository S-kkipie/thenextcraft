"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { CurrentUserProvider } from "@/lib/current-user";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url) : null;

export function Providers({ children }: { children: ReactNode }) {
  // Sin deployment aún (corre `npx convex dev`) → render sin provider.
  if (!convex) return <>{children}</>;
  return (
    <ConvexAuthProvider client={convex}>
      <CurrentUserProvider>{children}</CurrentUserProvider>
    </ConvexAuthProvider>
  );
}
