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
  login: (name: string, role: Role, githubHandle?: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("uid");
    if (s) setUserId(s as Id<"users">);
  }, []);

  const user = useQuery(api.users.get, userId ? { id: userId } : "skip") ?? null;
  const createOrGet = useMutation(api.users.createOrGet);

  const login = async (name: string, role: Role, githubHandle?: string) => {
    const id = await createOrGet({ name, role, githubHandle });
    localStorage.setItem("uid", id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("uid");
    setUserId(null);
  };

  return (
    <Ctx.Provider value={{ userId, user, login, logout }}>
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
