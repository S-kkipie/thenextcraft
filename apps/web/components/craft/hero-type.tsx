"use client";

import Link from "next/link";

import { useParallax } from "./reveal";
import { PixelIcon } from "@/components/craft/pixel-icon";

/**
 * Bloque tipográfico del hero.
 *
 * Va en su propio componente cliente para que el parallax no obligue a marcar
 * toda la página como cliente: el titular se mueve más lento que el scroll y se
 * despega del shader, que queda quieto detrás.
 */
export function HeroType() {
  const parallax = useParallax(-0.14);

  return (
    <div className="relative mx-auto max-w-[1120px] px-6 pt-[92px] pb-28">
      <div ref={parallax} className="parallax">
        {/* Lo único que queda del referente C64. */}
        <a
          href="https://thenextcraft.org/es"
          target="_blank"
          rel="noreferrer"
          className="data inline-flex items-center text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--phos)]"
        >
          READY.
          <span className="cursor-block ml-1 inline-block h-[0.9em] w-[0.55em] translate-y-[0.05em] bg-[var(--phos)]" />
        </a>

        <div className="eyebrow mt-6 text-[var(--phos)]">Proof-of-work hiring</div>

        <h1 className="mt-3.5 text-[clamp(22px,4.2vw,48px)] leading-[1.3] font-bold">
          Resuelve el reto real
          <br />
          de una startup.
          <br />
          <span className="bg-gradient-to-r from-[var(--phos)] to-[var(--cyan)] bg-clip-text text-transparent">
            Consigue el trabajo.
          </span>
        </h1>
      </div>

      {/* Fuera del parallax: el texto de apoyo y los CTA no deben derivar. */}
      <p className="mt-6 max-w-[50ch] text-[clamp(16px,2vw,20px)] text-[#B9C9B7]">
        Las startups publican su problema de negocio. Tú shipeas una solución
        pública. La IA filtra y rankea, tú defiendes tu autoría, la startup
        contrata.
      </p>

      <div className="mt-9 flex flex-wrap gap-3.5">
        <Link href="/desafios" className="btn btn-primary">
          Explorar retos <PixelIcon name="arrowRight" size={12} />
        </Link>
        <a href="#startups" className="btn btn-ghost">
          Publicar reto
        </a>
      </div>

      <p className="mt-7 max-w-[58ch] text-[13px] text-[var(--muted)]">
        Streak · Nivel · XP = capa de progreso sobre señales{" "}
        <b className="text-[var(--text)]">reales</b> (shipped · startup-approved ·
        AI review · autoría verificada).
      </p>
    </div>
  );
}
