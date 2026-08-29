import { cn } from "@/lib/utils";

/**
 * Beto, el castor — la mascota de thenextcraft.
 *
 * Metáfora: el castor no "estudia" construir represas, las construye. Corta,
 * apila y shipea río abajo — build → ship, el loop del producto.
 *
 * Tres estados, uno por momento del loop:
 *   - `build`  → casco puesto, mientras construyes (racha, retos en progreso)
 *   - `ship`   → tabla al hombro, en el pre-submit
 *   - `cheer`  → brazos arriba y destellos, en recompensas y match
 *
 * Colores fijos (no tokens): la mascota se ve igual en claro y en oscuro.
 */

const FUR = "#A9713F";
const FUR_DARK = "#8A5A31";
const BELLY = "#E8CDA6";
const TAIL = "#6B4526";
const TEETH = "#FFFFFF";
const INK = "#2B1B10";

export type BetoVariant = "build" | "ship" | "cheer";

export function Beto({
  variant = "build",
  className,
}: {
  variant?: BetoVariant;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 128"
      role="img"
      aria-label="Beto, el castor de thenextcraft"
      className={cn("size-28", className)}
    >
      {/* cola: paleta con textura de tronco, siempre detrás del cuerpo */}
      <g transform="rotate(-24 26 104)">
        <ellipse cx="26" cy="104" rx="16" ry="11" fill={TAIL} />
        <path
          d="M14 100h24M14 106h24M20 96v14M28 96v14"
          stroke={INK}
          strokeOpacity=".22"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>

      {/* cuerpo */}
      <ellipse cx="60" cy="94" rx="30" ry="26" fill={FUR} />
      <ellipse cx="60" cy="99" rx="19" ry="18" fill={BELLY} />

      {/* patas */}
      <ellipse cx="43" cy="117" rx="10" ry="6" fill={FUR_DARK} />
      <ellipse cx="77" cy="117" rx="10" ry="6" fill={FUR_DARK} />

      {/* brazos: abajo al construir, arriba al celebrar */}
      {variant === "cheer" ? (
        <>
          <ellipse cx="26" cy="76" rx="7" ry="10" fill={FUR_DARK} transform="rotate(-32 26 76)" />
          <ellipse cx="94" cy="76" rx="7" ry="10" fill={FUR_DARK} transform="rotate(32 94 76)" />
        </>
      ) : (
        <>
          <ellipse cx="30" cy="94" rx="7" ry="10" fill={FUR_DARK} />
          <ellipse cx="90" cy="94" rx="7" ry="10" fill={FUR_DARK} />
        </>
      )}

      {/* la caja que va a shipear, abrazada al pecho */}
      {variant === "ship" && (
        <g>
          <rect x="38" y="84" width="44" height="30" rx="4" fill="#C98F53" />
          <path
            d="M60 84v30M38 96h44"
            stroke={INK}
            strokeOpacity=".22"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <ellipse cx="34" cy="98" rx="7" ry="9" fill={FUR_DARK} />
          <ellipse cx="86" cy="98" rx="7" ry="9" fill={FUR_DARK} />
        </g>
      )}

      {/* orejas */}
      <circle cx="36" cy="30" r="9" fill={FUR_DARK} />
      <circle cx="84" cy="30" r="9" fill={FUR_DARK} />

      {/* cabeza */}
      <circle cx="60" cy="50" r="31" fill={FUR} />

      {/* casco de obra: lo que lo hace un builder y no un animal genérico */}
      {variant === "build" && (
        <g>
          <path
            d="M32 30a28 28 0 0 1 56 0z"
            fill="var(--brand, #7C5CFF)"
          />
          <rect x="26" y="28" width="68" height="7" rx="3.5" fill="var(--brand, #7C5CFF)" />
          <path d="M60 4v26" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* ojos */}
      <circle cx="47" cy="44" r="5.5" fill={INK} />
      <circle cx="73" cy="44" r="5.5" fill={INK} />
      <circle cx="48.8" cy="42" r="1.9" fill="#fff" />
      <circle cx="74.8" cy="42" r="1.9" fill="#fff" />

      {/* hocico, nariz y los dos incisivos: la firma del castor */}
      <ellipse cx="60" cy="62" rx="18" ry="13" fill={BELLY} />
      <ellipse cx="60" cy="54" rx="5.5" ry="4" fill={INK} />
      <path
        d="M60 58v4M60 62c0 3-4 4-6 3M60 62c0 3 4 4 6 3"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="53.5" y="66" width="13" height="13" rx="2.5" fill={TEETH} stroke={INK} strokeOpacity=".25" strokeWidth="1" />
      <path d="M60 66.5v12" stroke={INK} strokeOpacity=".25" strokeWidth="1.2" />

      {/* destellos de celebración */}
      {variant === "cheer" && (
        <g fill="var(--warning, #FBBF24)">
          <path d="M14 34l2.4 5.6L22 42l-5.6 2.4L14 50l-2.4-5.6L6 42l5.6-2.4z" />
          <path d="M104 20l1.8 4.2 4.2 1.8-4.2 1.8L104 32l-1.8-4.2L98 26l4.2-1.8z" />
          <path d="M100 56l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4z" />
        </g>
      )}
    </svg>
  );
}

/**
 * Beto diciendo algo. Se usa en estados vacíos y en el panel de racha, donde el
 * copy es del producto pero la voz es de la mascota.
 */
export function BetoSays({
  variant = "build",
  children,
  className,
}: {
  variant?: BetoVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Beto variant={variant} className="size-16 shrink-0" />
      <p className="relative rounded-xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
