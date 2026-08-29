// Iniciales de la startup para el logo cuadrado de la card/detalle.
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Días que faltan hasta el deadline (epoch ms). undefined si no hay deadline.
// Se calcula en el cliente (Date.now) — nunca dentro de una query de Convex.
export function daysLeft(deadline: number | undefined): number | undefined {
  if (deadline === undefined) return undefined;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 86_400_000));
}
