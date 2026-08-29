"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Doc, Id } from "@thenextcraft/backend/dataModel";

type Role = "builder" | "startup";

type CurrentUser = {
  userId: Id<"users"> | null;
  user: Doc<"users"> | null;
  /** true once localStorage is read AND (if a uid exists) the user query resolved. */
  authReady: boolean;
  login: (name: string, role: Role, githubHandle?: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<CurrentUser | null>(null);

// DEV AUTH (localStorage stand-in). Real GitHub OAuth (Convex Auth) is a follow-up.
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read the stored uid once, on mount. Until then we don't know the auth state.
  useEffect(() => {
    const s = localStorage.getItem("uid");
    if (s) setUserId(s as Id<"users">);
    setHydrated(true);
  }, []);

  // undefined = loading, null = not found (e.g. deleted / wiped dev DB), Doc = ok.
  const userDoc = useQuery(api.users.get, userId ? { id: userId } : "skip");
  const createOrGet = useMutation(api.users.createOrGet);

  // A stored uid that no longer resolves to a user → clear it (stale session).
  useEffect(() => {
    if (hydrated && userId && userDoc === null) {
      localStorage.removeItem("uid");
      setUserId(null);
    }
  }, [hydrated, userId, userDoc]);

  const login = async (name: string, role: Role, githubHandle?: string) => {
    const id = await createOrGet({ name, role, githubHandle });
    localStorage.setItem("uid", id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("uid");
    setUserId(null);
  };

  const authReady = hydrated && (userId === null || userDoc !== undefined);

  return (
    <Ctx.Provider
      value={{ userId, user: userDoc ?? null, authReady, login, logout }}
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
