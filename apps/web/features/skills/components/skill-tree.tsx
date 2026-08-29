"use client";

import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/craft/pixel-icon";

import type { CategoryKey, DerivedCategory } from "../schema";

/*
 * Skill Tree.
 *
 * La forma es la de un árbol de habilidades — nodos, ramas, tiers, un camino
 * que se ilumina — pero la REGLA del producto no cambia: un nodo no se
 * desbloquea gastando puntos, se enciende cuando has shipeado retos cuyo tech
 * cae en esa categoría. El árbol solo hace visible una dependencia que ya
 * existía en el modelo y que la rejilla de cards plana escondía: para llegar a
 * Full Stack hay que pasar por Frontend y Backend.
 *
 * Layout en coordenadas normalizadas 0..100 sobre un contenedor con aspecto
 * fijo, así nodos y conectores no pueden desalinearse al cambiar el ancho. Los
 * conectores son codos ortogonales, no diagonales: misma familia que el resto
 * del chrome de terminal.
 */

type NodeId = CategoryKey | "root";

const POS: Record<NodeId, { x: number; y: number }> = {
  root: { x: 50, y: 8 },
  frontend: { x: 16, y: 34 },
  backend: { x: 50, y: 34 },
  "ai-ml": { x: 84, y: 34 },
  fullstack: { x: 28, y: 63 },
  databases: { x: 63, y: 63 },
  devops: { x: 88, y: 63 },
  security: { x: 88, y: 90 },
};

/** De dónde sale cada rama. Full Stack cuelga de dos: por eso es Full Stack. */
const EDGES: [NodeId, NodeId][] = [
  ["root", "frontend"],
  ["root", "backend"],
  ["root", "ai-ml"],
  ["frontend", "fullstack"],
  ["backend", "fullstack"],
  ["backend", "databases"],
  ["ai-ml", "databases"],
  ["backend", "devops"],
  ["devops", "security"],
];

/** Codo: baja del padre, gira a la altura media, baja al hijo. */
function elbow(a: { x: number; y: number }, b: { x: number; y: number }) {
  const midY = a.y + (b.y - a.y) * 0.55;
  return `${a.x},${a.y} ${a.x},${midY} ${b.x},${midY} ${b.x},${b.y}`;
}

export function SkillTree({
  categories,
  totalShips,
  selected,
  onSelect,
}: {
  categories: DerivedCategory[];
  totalShips: number;
  selected: CategoryKey | null;
  onSelect: (key: CategoryKey) => void;
}) {
  const byKey = new Map(categories.map((c) => [c.key, c]));
  const lit = (id: NodeId) =>
    id === "root" ? totalShips > 0 : (byKey.get(id)?.level ?? 0) > 0;

  return (
    <div className="term">
      <div className="term-bar">
        skill-tree ~ derivado de tus ships
        <span className="term-hint">
          {categories.filter((c) => c.level > 0).length} / {categories.length}{" "}
          ramas activas
        </span>
      </div>

      <div className="relative aspect-[16/12] w-full sm:aspect-[16/9]">
        {/* Rejilla de fondo: el papel milimetrado del terminal. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Conectores. preserveAspectRatio=none deja que el viewBox 0..100 siga
            exactamente al contenedor; non-scaling-stroke evita que el trazo se
            deforme con él. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          {EDGES.map(([from, to]) => {
            const on = lit(from) && lit(to);
            return (
              <polyline
                key={`${from}-${to}`}
                points={elbow(POS[from], POS[to])}
                fill="none"
                stroke={on ? "var(--phos)" : "var(--line-2)"}
                strokeWidth={on ? 2 : 1.5}
                strokeDasharray={on ? undefined : "4 4"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* Raíz: no es una categoría, es el contador de ships que enciende todo. */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${POS.root.x}%`, top: `${POS.root.y}%` }}
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-[10px] border px-3 py-2",
              totalShips > 0
                ? "border-[var(--phos)] bg-[var(--phos-dark)] text-[var(--phos)]"
                : "border-dashed border-[var(--line-2)] text-[var(--faint)]",
            )}
          >
            <PixelIcon name="ship" size={14} />
            <span className="font-display text-[12px] font-bold">
              {totalShips} SHIPS
            </span>
          </div>
        </div>

        {categories.map((c) => {
          const pos = POS[c.key];
          const on = c.level > 0;
          const active = selected === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSelect(c.key)}
              aria-pressed={active}
              title={`${c.label} — ${on ? `Nv. ${c.level}` : "sin ships todavía"}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--phos)]"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span
                className={cn(
                  "flex w-[104px] flex-col items-center gap-1.5 rounded-[10px] border px-2 py-2.5 transition-all",
                  on
                    ? "border-[var(--phos)]/45 bg-[var(--panel-2)] hover:-translate-y-0.5"
                    : "border-dashed border-[var(--line-2)] bg-[var(--ink-2)] hover:border-[var(--line-2)]",
                  active && "ring-2 ring-[var(--phos)] ring-offset-2 ring-offset-[var(--ink-2)]",
                )}
              >
                <PixelIcon
                  name={c.icon}
                  size={20}
                  className={on ? "text-[var(--phos)]" : "text-[var(--faint)]"}
                />
                <span
                  className={cn(
                    "text-[11px] leading-tight font-bold",
                    on ? "text-[var(--text)]" : "text-[var(--faint)]",
                  )}
                >
                  {c.label}
                </span>

                {/* Cinco muescas = los cinco niveles. Se leen sin números. */}
                <span className="flex gap-[3px]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-[3px] w-[9px]",
                        i < c.level ? "bg-[var(--phos)]" : "bg-[var(--line-2)]",
                      )}
                    />
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
