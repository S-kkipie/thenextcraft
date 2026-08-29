"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Doc, Id } from "@thenextcraft/backend/dataModel";

type CurrentUser = {
  userId: Id<"users"> | null;
  user: Doc<"users"> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const Ctx = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const auth = useConvexAuth();
  const result = useQuery(
    api.users.current,
    auth.isAuthenticated ? {} : "skip",
  );
  const user = result ?? null;

  return (
    <Ctx.Provider
      value={{
        userId: user?._id ?? null,
        user,
        isAuthenticated: auth.isAuthenticated,
        isLoading:
          auth.isLoading || (auth.isAuthenticated && result === undefined),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}
