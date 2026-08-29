import type { Doc } from "@thenextcraft/backend/dataModel";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  submissionSource,
  type CategoryKey,
  type DerivedCategory,
  type SkillMap,
} from "./schema";

/**
 * Derivación del Skill Map (funciones puras — sin I/O, testeable).
 *
 * Regla de producto: los niveles NO se desbloquean, se DERIVAN. Cada ship suma
 * evidencia real; los skills declarados aportan una señal base más débil.
 */

const SHIP_POINTS = 30; // ~3 ships shipeados → categoría al máximo
const DECLARED_POINTS = 10; // skill declarado (sin ship que lo respalde aún)

/** Normaliza un token de tech: minúsculas, solo `[a-z0-9]` ("Next.js" → "nextjs"). */
function normalize(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Categorías (excepto fullstack) a las que mapea un único token de tech. */
function categoriesForToken(token: string): CategoryKey[] {
  const t = normalize(token);
  if (!t) return [];
  const hits: CategoryKey[] = [];
  for (const key of CATEGORY_ORDER) {
    if (key === "fullstack") continue;
    if (CATEGORY_META[key].keywords.some((kw) => t.includes(kw))) hits.push(key);
  }
  return hits;
}

function emptyCounts(): Record<CategoryKey, number> {
  return Object.fromEntries(CATEGORY_ORDER.map((k) => [k, 0])) as Record<
    CategoryKey,
    number
  >;
}

function emptySets(): Record<CategoryKey, Set<string>> {
  return Object.fromEntries(CATEGORY_ORDER.map((k) => [k, new Set<string>()])) as Record<
    CategoryKey,
    Set<string>
  >;
}

/**
 * Deriva el Skill Map desde los ships del builder + sus skills declarados.
 * `raw` es el retorno crudo de `api.submissions.byBuilder` (Doc plano o join).
 */
export function deriveSkillMap(
  raw: unknown,
  user: Doc<"users"> | null,
): SkillMap {
  const parsed = submissionSource.array().safeParse(raw);
  const subs = parsed.success ? parsed.data : [];

  const shipCount = emptyCounts();
  const matchedTech = emptySets();

  for (const s of subs) {
    const tech = s.tech ?? [];
    const touched = new Set<CategoryKey>();
    for (const token of tech) {
      const cats = categoriesForToken(token);
      for (const c of cats) {
        touched.add(c);
        matchedTech[c].add(token);
      }
    }
    // Full Stack = el ship abarca frontend Y backend a la vez.
    if (touched.has("frontend") && touched.has("backend")) touched.add("fullstack");
    for (const c of touched) shipCount[c] += 1;
  }

  // Skills declarados en el perfil → señal base más débil.
  const declared = emptySets();
  for (const skill of user?.skills ?? []) {
    for (const c of categoriesForToken(skill)) declared[c].add(skill);
  }

  const categories: DerivedCategory[] = CATEGORY_ORDER.map((key) => {
    const meta = CATEGORY_META[key];
    const ships = shipCount[key];
    const declaredSkills = [...declared[key]];
    const value = Math.min(
      100,
      ships * SHIP_POINTS + declaredSkills.length * DECLARED_POINTS,
    );
    const level = value <= 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(value / 20)));
    return {
      key,
      label: meta.label,
      emoji: meta.emoji,
      blurb: meta.blurb,
      value,
      level,
      shipCount: ships,
      matchedTech: [...matchedTech[key]].slice(0, 8),
      declaredSkills: declaredSkills.slice(0, 8),
      primary: false,
    };
  });

  // Resalta la categoría más fuerte (mayor value; empate → primera del orden).
  let top: DerivedCategory | null = null;
  for (const c of categories) {
    if (c.value > 0 && (top === null || c.value > top.value)) top = c;
  }
  if (top) top.primary = true;

  return {
    categories,
    totalShips: subs.length,
    activeCategories: categories.filter((c) => c.value > 0).length,
  };
}

/** Etiqueta corta para el pill de nivel de una categoría. */
export function levelLabel(category: DerivedCategory): string {
  return category.level > 0 ? `Nv. ${category.level}` : "Sin ships";
}
