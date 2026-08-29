"use client";

import Link from "next/link";

import { useCurrentUser } from "@/lib/current-user";
import { StatTile } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useBuilderShips } from "../hooks";
import { deriveSkillMap } from "../model";
import { SkillCategoryCard } from "./skill-category-card";

/**
 * Skill Map — página /skills. Cada categoría muestra un nivel DERIVADO de los
 * retos que has shipeado (tech de tus submissions) + tus skills declarados.
 * No es un árbol de RPG que se desbloquea: refleja lo que has construido.
 */
export function SkillMap() {
  const { userId, user } = useCurrentUser();
  const shipsRaw = useBuilderShips(userId);

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {map.categories.map((category) => (
            <SkillCategoryCard key={category.key} category={category} />
          ))}
        </div>
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
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-faint">
          Skill Map
        </p>
        <h1 className="mt-2 font-display text-[32px] font-black tracking-tight text-foreground">
          Tu mapa de skills
        </h1>
      </div>

      <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
        No es un árbol de RPG que se desbloquea. Cada nivel se{" "}
        <span className="font-semibold text-foreground">deriva</span> de los retos
        que has shipeado — leemos el{" "}
        <span className="font-mono text-cream">tech</span> de tus submissions y tus
        skills declarados, y los mapeamos a categorías. Refleja lo que has
        construido, no lo que has clickeado.
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
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-panel p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-lg font-black text-foreground">
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
    <div className="rounded-2xl border border-line bg-panel p-8 text-center">
      <h1 className="font-display text-2xl font-black text-foreground">
        Entra para ver tu Skill Map
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Inicia sesión desde la barra superior. Tu mapa de skills se deriva de los
        retos que has shipeado — no es un árbol que se desbloquea.
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
