import Image from "next/image";

import { cn } from "@/lib/utils";

/*
 * AvatarFrame — la foto de perfil, montada como un retrato de arcade.
 *
 * Tres cosas que el avatar redondo de shadcn no hacía:
 *
 *  1. Usa de verdad `avatarUrl`. Desde que el login es GitHub OAuth real, cada
 *     usuario trae su foto; antes la app pintaba siempre una inicial.
 *  2. Cuadrado con esquinas de 3px y corchetes de fósforo, no un círculo. Un
 *     círculo suavizado pelea con el resto del sistema; los corchetes son de
 *     la misma familia que el chrome de terminal.
 *  3. Degrada en tres pasos: foto → inicial sobre el degradado de fósforo →
 *     hueco marcado. Nunca una imagen rota.
 *
 * `unoptimized` a propósito: el optimizador de Next re-encoda y mete un blur
 * de transición que ensucia el borde duro del marco. Los avatares de GitHub ya
 * vienen servidos al tamaño que pides con `?s=`.
 */

function initialsOf(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Pide a GitHub el avatar ya escalado en vez de traer el original de 460px. */
function sized(src: string, px: number): string {
  if (!src.includes("avatars.githubusercontent.com")) return src;
  const url = new URL(src);
  url.searchParams.set("s", String(px * 2)); // 2x para pantallas densas
  return url.toString();
}

export function AvatarFrame({
  name,
  src,
  size = 36,
  level,
  className,
  brackets = true,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  /** Si se pasa, aparece el nivel en la esquina inferior derecha. */
  level?: number;
  className?: string;
  /** Los corchetes de mira. Se apagan donde el avatar es pequeño o va en fila. */
  brackets?: boolean;
}) {
  const initials = initialsOf(name);
  // El corchete crece con el marco, pero nunca por debajo de 5px o desaparece.
  const arm = Math.max(5, Math.round(size * 0.22));

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="block size-full overflow-hidden rounded-[3px] border border-[var(--line-2)]"
        style={
          src
            ? undefined
            : { backgroundImage: "linear-gradient(135deg,var(--phos-dark),var(--phos))" }
        }
      >
        {src ? (
          <Image
            src={sized(src, size)}
            alt=""
            width={size}
            height={size}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <span
            className="font-display grid size-full place-items-center text-ink"
            style={{ fontSize: Math.max(9, Math.round(size * 0.36)) }}
          >
            {initials}
          </span>
        )}
      </span>

      {brackets && (
        <>
          {/* Cuatro corchetes de mira: el marco de arcade, no un borde entero. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-px -left-px border-t-2 border-l-2 border-[var(--phos)]"
            style={{ width: arm, height: arm }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-px -right-px border-t-2 border-r-2 border-[var(--phos)]"
            style={{ width: arm, height: arm }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px -left-px border-b-2 border-l-2 border-[var(--phos)]"
            style={{ width: arm, height: arm }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-px -bottom-px border-r-2 border-b-2 border-[var(--phos)]"
            style={{ width: arm, height: arm }}
          />
        </>
      )}

      {level != null && (
        <span
          className="font-display absolute -right-1.5 -bottom-1.5 rounded-[4px] border border-[var(--phos)] bg-[var(--ink)] px-1 text-[9px] leading-[1.5] font-bold text-[var(--phos)] tabular-nums"
          title={`Nivel ${level}`}
        >
          {level}
        </span>
      )}
    </span>
  );
}
