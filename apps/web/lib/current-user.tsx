"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@thenextcraft/backend/api";
import type { Doc, Id } from "@thenextcraft/backend/dataModel";

type Role = "builder" | "startup";

type CurrentUser = {
  userId: Id<"users"> | null;
  user: Doc<"users"> | null;
  /** true once auth resolved AND (if authed) the viewer query returned. */
  authReady: boolean;
  /** authed but hasn't picked builder/startup yet. */
  needsOnboarding: boolean;
  signInGithub: () => Promise<void>;
  setRole: (
    role: Role,
    companyName?: string,
    linkedinUrl?: string,
  ) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<CurrentUser | null>(null);

// Real auth via Convex Auth (GitHub OAuth). The signed-in user is read from
// `api.users.viewer` (identity from the session, never the client).
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");
  const setRoleMut = useMutation(api.users.setRole);

  const authReady = !isLoading && (!isAuthenticated || user !== undefined);
  const resolvedUser = user ?? null;

  return (
    <Ctx.Provider
      value={{
        userId: resolvedUser?._id ?? null,
        user: resolvedUser,
        authReady,
        needsOnboarding: Boolean(
          isAuthenticated && resolvedUser && !resolvedUser.onboarded,
        ),
        signInGithub: async () => {
          await signIn("github");
        },
        setRole: async (role, companyName, linkedinUrl) => {
          await setRoleMut({ role, companyName, linkedinUrl });
        },
        logout: () => {
          void signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
