"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/*
 * Un filtro que vive en useState no se puede compartir: no puedes mandarle a
 * nadie "mira estos retos de LLM", ni volver atrás, ni recargar sin perderlo.
 * Este hook mueve ese estado a la query string y se comporta como useState.
 *
 * `replace` y no `push`: teclear en un buscador no debe llenar el historial de
 * una entrada por letra. `scroll: false` porque cambiar un filtro no es
 * navegar — la página no debe saltar arriba.
 *
 * El valor por defecto NO se escribe en la URL: /challenges se queda limpio
 * hasta que filtras de verdad.
 */
export function useQueryParam(
  key: string,
  fallback = "",
): [string, (next: string) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = params.get(key) ?? fallback;

  const set = useCallback(
    (next: string) => {
      const q = new URLSearchParams(params.toString());
      if (next === fallback || next === "") q.delete(key);
      else q.set(key, next);
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [params, router, pathname, key, fallback],
  );

  return [value, set];
}
