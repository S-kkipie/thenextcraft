// Preview de apps deployadas. Muchas apps setean X-Frame-Options/CSP y salen
// en blanco dentro de un <iframe>, así que —igual que crafter.run/ships, que
// guarda screenshots— renderizamos una captura del sitio vía thum.io (servicio
// gratis, sin API key). El thumbnail es un <img>; el "visitar" abre el sitio real.
const THUMIO = "https://image.thum.io/get";

/** URL de screenshot del sitio para usar como <img src>. `null` si no hay url. */
export function screenshotUrl(
  target: string | null | undefined,
  opts: { width?: number; crop?: number } = {},
): string | null {
  if (!target) return null;
  const url = normalize(target);
  if (!url) return null;
  const { width = 900, crop = 675 } = opts;
  // thum.io espera la URL destino cruda al final del path (no encodeada).
  return `${THUMIO}/width/${width}/crop/${crop}/noanimate/${url}`;
}

/** Añade https:// si falta y descarta cadenas no-URL. */
function normalize(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    return new URL(withProto).toString();
  } catch {
    return null;
  }
}

/** Host legible para mostrar en la card (ej. "mi-app.vercel.app"). */
export function hostLabel(target: string | null | undefined): string | null {
  if (!target) return null;
  const url = normalize(target);
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}
