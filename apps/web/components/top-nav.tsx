"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/lib/current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function TopNav() {
  const { user, login, logout } = useCurrentUser();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState<"builder" | "startup">("builder");

  return (
    <header className="flex flex-wrap items-center gap-4 border-b px-6 py-3">
      <Link href="/challenges" className="font-semibold tracking-tight">
        thenextcraft
      </Link>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/challenges" className="hover:text-foreground">
          Retos
        </Link>
        <Link href="/startup" className="hover:text-foreground">
          Publicar
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <>
            <span className="text-sm">{user.name}</span>
            <Badge variant="secondary">{user.role}</Badge>
            <Button size="sm" variant="ghost" onClick={logout}>
              Salir
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="nombre"
              className="h-8 w-28"
            />
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="github"
              className="h-8 w-28"
            />
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "builder" | "startup")}
            >
              <SelectTrigger className="h-8 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="builder">builder</SelectItem>
                <SelectItem value="startup">startup</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!name}
              onClick={() => login(name, role, handle || undefined)}
            >
              Entrar
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
