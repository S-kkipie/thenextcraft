/**
 * Tipos de la capa de presentación.
 *
 * Espejan `packages/backend/convex/schema.ts` y le suman lo que hoy solo vive en
 * la UI (XP, racha, Builder Score, skill map). Cuando el backend exista, cada
 * `mock.*` se reemplaza por un `useQuery` y estos tipos son el contrato.
 */

export type Difficulty = "principiante" | "intermedio" | "avanzado";

export type Track =
  | "backend"
  | "frontend"
  | "fullstack"
  | "ai-ml"
  | "devops"
  | "base-de-datos"
  | "seguridad";

export type Builder = {
  handle: string;
  name: string;
  avatarUrl: string;
  title: string;
  location: string;
  verified: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gems: number;
  streakWeeks: number;
  builderScore: number;
  scorePercentile: string;
  shipped: number;
  startupApproved: number;
  avgScore: number;
};

export type Challenge = {
  slug: string;
  title: string;
  summary: string;
  businessProblem: string;
  company: { name: string; logoText: string; industry: string };
  difficulty: Difficulty;
  track: Track;
  xpReward: number;
  gemReward: number;
  successCriteria: string[];
  technologies: string[];
  participants: number;
  estimatedHours: string;
  closesIn: string;
  /** Pesos del scorecard con que la IA evalúa. Suman 100. */
  rubric: { label: string; weight: number }[];
};

/** Un paso de "Tu camino": la secuencia de retos del builder. */
export type PathStep = {
  slug: string;
  title: string;
  state: "completado" | "en-progreso" | "bloqueado";
  xpReward: number;
  /** 0-100, solo cuando `state === "en-progreso"`. */
  progress?: number;
  requiredLevel?: number;
};

export type SkillNode = {
  id: Track;
  label: string;
  level: number;
  /** Posición en la grilla del Skill Map, en porcentaje del contenedor. */
  x: number;
  y: number;
  /** Nodos con los que conecta, por `id`. */
  links: Track[];
  hub?: boolean;
};

export type Skill = { name: string; mastery: number };

export type Submission = {
  challengeSlug: string;
  repo: string;
  repoUrl: string;
  devTimeHours: string;
  commits: number;
  testsPassing: number;
  filesChanged: number;
  linesOfCode: number;
  linesChanged: number;
  filesCreated: number;
  filesModified: number;
  checklist: { label: string; done: boolean }[];
};

export type EvaluationCriterion = {
  label: string;
  score: number;
  verdict: "Excelente" | "Muy bueno" | "Bueno" | "Mejorable";
};

export type Evaluation = {
  challengeSlug: string;
  totalScore: number;
  percentile: string;
  rank: number;
  totalSubmissions: number;
  criteria: EvaluationCriterion[];
  summary: string;
  strengths: string[];
  improvements: string[];
  /** Distribución de scores de todas las submissions, para el histograma. */
  distribution: number[];
};

export type Authorship = {
  confidence: number;
  githubHandle: string;
  githubUrl: string;
  commits: number;
  linesChanged: number;
  filesCreated: number;
  filesModified: number;
  devTimeHours: string;
  /** 7 columnas (Lun→Dom) × 5 filas, intensidad 0-4. Estilo contribution graph. */
  activity: number[][];
  analysis: string;
  suspicious: boolean;
};

export type Project = {
  challengeSlug: string;
  title: string;
  track: Track;
  score: number;
  percentile: string;
  difficulty: Difficulty;
  approved: boolean;
  shippedAgo: string;
  technologies: string[];
};

export type Achievement = {
  id: string;
  label: string;
  hue: "brand" | "success" | "warning" | "gem" | "destructive";
};
