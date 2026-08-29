"use client";

import { useState } from "react";
import Link from "next/link";

import { useCurrentUser } from "@/lib/current-user";
import { StatTile } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useBuilderShips } from "../hooks";
import { deriveSkillMap } from "../model";
import type { CategoryKey } from "../schema";
import { SkillCategoryCard } from "./skill-category-card";
import { SkillTree } from "./skill-tree";

/**
 * Skill Map — página /skills.
 *
 * Tiene la FORMA de un árbol de habilidades (ramas, tiers, un camino que se
 * ilumina), pero conserva la regla: el nivel de cada nodo se DERIVA de los
 * retos que has shipeado, no se compra con puntos. El árbol añade lo que la
 * rejilla plana no decía — qué depende de qué — y el detalle de abajo enseña
 * la evidencia real de la rama que elijas.
 */
export function SkillMap() {
  const { userId, user } = useCurrentUser();
  const shipsRaw = useBuilderShips(userId);
  const [picked, setPicked] = useState<CategoryKey | null>(null);

  // Sin sesión → nudge hacia el login de la barra superior.
  if (userId === null) return <SignedOut />;

  const loading = user === null || shipsRaw === undefined;
  const map = deriveSkillMap(shipsRaw, user);
  const empty = !loading && map.totalShips === 0;

  return (
    <div className="flex flex-col gap-6">
      <Header
        loading={loading}
        totalShips={map.totalShips}
        activeCategories={map.activeCategories}
      />

      {empty && <EmptyBanner />}

      {loading ? (
        <SkillGridSkeleton />
      ) : (
        <>
          {/* El árbol pide ancho: por debajo de sm se cae y queda la rejilla. */}
          <div className="hidden sm:block">
            <SkillTree
              categories={map.categories}
              totalShips={map.totalShips}
              selected={picked}
              onSelect={(key) => setPicked(key === picked ? null : key)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {map.categories
              .filter((c) => picked === null || c.key === picked)
              .map((category) => (
                <SkillCategoryCard key={category.key} category={category} />
              ))}
          </div>

          {picked && (
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="self-start text-[13px] font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
            >
              Ver las siete ramas
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------- header -------------------------------- */

function Header({
  loading,
  totalShips,
  activeCategories,
}: {
  loading: boolean;
  totalShips: number;
  activeCategories: number;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <p className="eyebrow">
          Skill Map
        </p>
        <h1 className="mt-2 font-display text-[32px] font-bold text-foreground">
          Tu mapa de skills
        </h1>
      </div>

      <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
        Es un árbol, pero no se desbloquea clickeando. Cada nodo se{" "}
        <span className="font-semibold text-foreground">deriva</span> de los retos
        que has shipeado — leemos el{" "}
        <span className="data text-cream">tech</span> de tus submissions y tus
        skills declarados, y los mapeamos a ramas. Las ramas apagadas no están
        bloqueadas: están esperando tu primer ship en ellas.
      </p>

      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          <StatTile value={totalShips} label="SHIPS" />
          <StatTile
            value={activeCategories}
            label="CATEGORÍAS ACTIVAS"
            accent="sand"
          />
        </div>
      )}
    </header>
  );
}

/* ------------------------------- states --------------------------------- */

function EmptyBanner() {
  return (
    <div className="card flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-lg font-bold text-foreground">
          Aún no has shipeado ningún reto
        </p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Tu mapa se llena con cada ship. Toma un reto de negocio real y deja que
          tu tech hable por ti.
        </p>
      </div>
      <Button render={<Link href="/challenges" />} variant="craftSecondary">
        Ver retos
      </Button>
    </div>
  );
}

function SignedOut() {
  return (
    <div className="card p-8 text-center">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Entra para ver tu Skill Map
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Inicia sesión desde la barra superior. Tu árbol de skills se deriva de
        los retos que has shipeado — ninguna rama se compra con puntos.
      </p>
      <div className="mt-5 flex justify-center">
        <Button render={<Link href="/challenges" />} variant="craftSecondary">
          Explorar retos
        </Button>
      </div>
    </div>
  );
}

function SkillGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-2xl" />
      ))}
    </div>
  );
}
