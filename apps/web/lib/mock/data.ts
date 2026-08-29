import type {
  Achievement,
  Authorship,
  Builder,
  Challenge,
  Evaluation,
  PathStep,
  Project,
  Skill,
  SkillNode,
  Submission,
} from "./types";

/**
 * Datos de demo. Un solo builder ("tú") recorriendo el loop completo:
 * reto → build → ship → evaluación IA → pasaporte público.
 *
 * `avatarUrl` va vacío a propósito: el Avatar cae a las iniciales y la demo no
 * depende de la red. Con auth real serán los avatares de GitHub.
 */

export const currentBuilder: Builder = {
  handle: "alexrivera",
  name: "Alex Rivera",
  avatarUrl: "",
  title: "Full Stack Developer",
  location: "Lima, Perú",
  verified: true,
  level: 12,
  xp: 1250,
  xpToNextLevel: 2000,
  gems: 24,
  streakWeeks: 7,
  builderScore: 1842,
  scorePercentile: "Top 6% de devs",
  shipped: 18,
  startupApproved: 7,
  avgScore: 91,
};

export const featuredChallenge: Challenge = {
  slug: "stripe-analytics-dashboard",
  title: "Stripe Analytics Dashboard",
  summary:
    "Crea un dashboard de analíticas de suscripciones similar al de Stripe.",
  businessProblem:
    "Nuestros clientes no entienden por qué su MRR sube o baja. Hoy exportan CSVs a mano y arman gráficas en Sheets, lo que retrasa cada decisión de pricing entre 3 y 5 días. Necesitamos que vean MRR, churn y segmentos en una sola pantalla, con datos que puedan sacar por API.",
  company: { name: "Stripe", logoText: "stripe", industry: "Fintech" },
  difficulty: "intermedio",
  track: "backend",
  xpReward: 250,
  gemReward: 3,
  successCriteria: [
    "Construir dashboard de MRR",
    "Gráficas de ingresos y churn rate",
    "Segmentación de clientes",
    "Exportación de datos vía API",
  ],
  technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind", "Recharts"],
  participants: 184,
  estimatedHours: "10–12 horas",
  closesIn: "5 días",
  rubric: [
    { label: "Correctitud", weight: 30 },
    { label: "Performance", weight: 20 },
    { label: "Arquitectura", weight: 20 },
    { label: "Seguridad", weight: 15 },
    { label: "Calidad de código", weight: 15 },
  ],
};

/** Catálogo de retos abiertos. `featuredChallenge` es el primero de la lista. */
export const challenges: Challenge[] = [
  featuredChallenge,
  {
    slug: "devops-pipeline",
    title: "DevOps Pipeline",
    summary: "Automatiza el camino de commit a producción para un equipo de 20 devs.",
    businessProblem:
      "Cada release nos cuesta media jornada de un ingeniero y se rompe una de cada tres veces. Queremos que un merge a main llegue a producción sin intervención manual y con rollback en menos de 2 minutos.",
    company: { name: "Railway", logoText: "railway", industry: "Infraestructura" },
    difficulty: "intermedio",
    track: "devops",
    xpReward: 250,
    gemReward: 3,
    successCriteria: [
      "Pipeline de CI con tests y lint bloqueantes",
      "Despliegue automático a staging en cada merge",
      "Rollback en un comando",
      "Alertas cuando un deploy degrada latencia",
    ],
    technologies: ["Docker", "GitHub Actions", "Terraform", "Grafana"],
    participants: 96,
    estimatedHours: "8–10 horas",
    closesIn: "9 días",
    rubric: [
      { label: "Correctitud", weight: 30 },
      { label: "Performance", weight: 15 },
      { label: "Arquitectura", weight: 25 },
      { label: "Seguridad", weight: 20 },
      { label: "Calidad de código", weight: 10 },
    ],
  },
  {
    slug: "ml-model-api",
    title: "ML Model API",
    summary: "Sirve un modelo de clasificación con latencia predecible bajo carga.",
    businessProblem:
      "Tenemos un modelo que funciona en un notebook y no en producción: los picos de tráfico lo tumban y no sabemos cuánto cuesta cada predicción. Necesitamos servirlo con p95 estable y costo medible por request.",
    company: { name: "Replicate", logoText: "replicate", industry: "AI infra" },
    difficulty: "avanzado",
    track: "ai-ml",
    xpReward: 300,
    gemReward: 5,
    successCriteria: [
      "Endpoint de inferencia con p95 bajo 200 ms",
      "Batching de requests concurrentes",
      "Métricas de costo por predicción",
      "Versionado de modelos sin downtime",
    ],
    technologies: ["Python", "FastAPI", "ONNX", "Redis"],
    participants: 61,
    estimatedHours: "14–18 horas",
    closesIn: "12 días",
    rubric: [
      { label: "Correctitud", weight: 25 },
      { label: "Performance", weight: 30 },
      { label: "Arquitectura", weight: 20 },
      { label: "Seguridad", weight: 10 },
      { label: "Calidad de código", weight: 15 },
    ],
  },
  {
    slug: "saas-dashboard",
    title: "SaaS Dashboard",
    summary: "Panel de uso y facturación que los clientes entiendan sin soporte.",
    businessProblem:
      "El 40% de nuestros tickets son 'no entiendo mi factura'. Queremos un panel donde el cliente vea su consumo en tiempo real y proyecte su gasto del mes antes de que le llegue el cobro.",
    company: { name: "Resend", logoText: "resend", industry: "Developer tools" },
    difficulty: "intermedio",
    track: "frontend",
    xpReward: 200,
    gemReward: 2,
    successCriteria: [
      "Consumo en tiempo real por producto",
      "Proyección de gasto a fin de mes",
      "Historial de facturas descargable",
      "Accesible y usable en móvil",
    ],
    technologies: ["React", "TypeScript", "Tailwind", "Recharts"],
    participants: 143,
    estimatedHours: "8–10 horas",
    closesIn: "6 días",
    rubric: [
      { label: "Correctitud", weight: 25 },
      { label: "Performance", weight: 20 },
      { label: "Arquitectura", weight: 15 },
      { label: "Seguridad", weight: 10 },
      { label: "Calidad de código", weight: 30 },
    ],
  },
];

/** Resuelve un reto por slug. Cae al destacado para que la demo nunca dé 404. */
export function getChallenge(slug: string): Challenge {
  return challenges.find((c) => c.slug === slug) ?? featuredChallenge;
}

export const challengePath: PathStep[] = [
  {
    slug: "api-rate-limiter",
    title: "API Rate Limiter",
    state: "completado",
    xpReward: 150,
  },
  {
    slug: "ai-transcription",
    title: "AI Transcription",
    state: "completado",
    xpReward: 200,
  },
  {
    slug: "stripe-analytics-dashboard",
    title: "Stripe Analytics",
    state: "en-progreso",
    xpReward: 250,
    progress: 82,
  },
  {
    slug: "realtime-chat",
    title: "Realtime Chat",
    state: "bloqueado",
    xpReward: 300,
    requiredLevel: 14,
  },
];

export const recommendedChallenges = [
  {
    slug: "devops-pipeline",
    title: "DevOps Pipeline",
    difficulty: "intermedio" as const,
    xpReward: 250,
    track: "devops" as const,
  },
  {
    slug: "ml-model-api",
    title: "ML Model API",
    difficulty: "avanzado" as const,
    xpReward: 300,
    track: "ai-ml" as const,
  },
  {
    slug: "saas-dashboard",
    title: "SaaS Dashboard",
    difficulty: "intermedio" as const,
    xpReward: 200,
    track: "frontend" as const,
  },
];

/** Serie del Builder Score, un punto por semana. Alimenta el sparkline del home. */
export const builderScoreSeries = [
  { label: "May 1", value: 1310 },
  { label: "May 8", value: 1352 },
  { label: "May 15", value: 1428 },
  { label: "May 22", value: 1405 },
  { label: "May 29", value: 1524 },
  { label: "Jun 5", value: 1611 },
  { label: "Jun 12", value: 1590 },
  { label: "Jun 19", value: 1704 },
  { label: "Jun 26", value: 1842 },
];

export const skillNodes: SkillNode[] = [
  {
    id: "fullstack",
    label: "Full Stack",
    level: 12,
    x: 50,
    y: 50,
    links: [],
    hub: true,
  },
  { id: "backend", label: "Backend", level: 13, x: 22, y: 18, links: ["fullstack"] },
  { id: "frontend", label: "Frontend", level: 11, x: 78, y: 18, links: ["fullstack"] },
  {
    id: "base-de-datos",
    label: "Base de Datos",
    level: 10,
    x: 11,
    y: 56,
    links: ["fullstack"],
  },
  { id: "devops", label: "DevOps", level: 8, x: 89, y: 56, links: ["fullstack"] },
  { id: "ai-ml", label: "AI / ML", level: 7, x: 27, y: 88, links: ["fullstack"] },
  {
    id: "seguridad",
    label: "Seguridad",
    level: 9,
    x: 73,
    y: 88,
    links: ["fullstack"],
  },
];

export const focusSkills: Skill[] = [
  { name: "TypeScript", mastery: 85 },
  { name: "PostgreSQL", mastery: 70 },
  { name: "Docker", mastery: 60 },
];

export const topSkills = ["TypeScript", "React", "Node.js", "PostgreSQL", "Python"];

export const nextMilestone = {
  title: "Backend Maestro",
  description: "Completa 5 desafíos de Backend con score 90+",
  current: 3,
  total: 5,
};

export const submission: Submission = {
  challengeSlug: "stripe-analytics-dashboard",
  repo: "alexrivera/stripe-analytics",
  repoUrl: "https://github.com/alexrivera/stripe-analytics",
  devTimeHours: "7h 42m",
  commits: 34,
  testsPassing: 127,
  filesChanged: 42,
  linesOfCode: 4281,
  linesChanged: 4281,
  filesCreated: 28,
  filesModified: 16,
  checklist: [
    { label: "Tests pasando", done: true },
    { label: "Repositorio conectado", done: true },
    { label: "Despliegue funcionando", done: true },
    { label: "README completo", done: true },
    { label: "Verificación de autoría lista", done: true },
  ],
};

export const evaluation: Evaluation = {
  challengeSlug: "stripe-analytics-dashboard",
  totalScore: 91,
  percentile: "Top 8% de las submissions",
  rank: 7,
  totalSubmissions: 184,
  criteria: [
    { label: "Correctitud", score: 96, verdict: "Excelente" },
    { label: "Performance", score: 94, verdict: "Excelente" },
    { label: "Arquitectura", score: 89, verdict: "Muy bueno" },
    { label: "Seguridad", score: 91, verdict: "Excelente" },
    { label: "Calidad de código", score: 88, verdict: "Muy bueno" },
  ],
  summary:
    "Excelente implementación con una arquitectura sólida y buen manejo de datos. Tu solución es eficiente y escalable.",
  strengths: [
    "Consultas a la base de datos optimizadas",
    "Buena separación de responsabilidades",
    "Manejo de errores robusto",
    "Documentación clara",
  ],
  improvements: [
    "Agregar caché para mejorar performance",
    "Reducir complejidad en el servicio de analytics",
    "Tests de integración más completos",
  ],
  // Histograma de las 184 submissions: la mayoría cae entre 60 y 80.
  distribution: [2, 5, 9, 14, 21, 28, 34, 31, 26, 19, 13, 8, 5, 3, 2],
};

export const authorship: Authorship = {
  confidence: 94,
  githubHandle: "alexrivera",
  githubUrl: "https://github.com/alexrivera",
  commits: 34,
  linesChanged: 4281,
  filesCreated: 28,
  filesModified: 16,
  devTimeHours: "7h 42m",
  activity: [
    [0, 1, 0, 2, 1, 0, 0],
    [1, 2, 3, 4, 2, 1, 0],
    [0, 3, 4, 3, 4, 2, 1],
    [2, 4, 2, 4, 3, 1, 0],
    [1, 2, 3, 2, 4, 3, 1],
  ],
  analysis:
    "Los patrones de contribución son consistentes con desarrollo original: commits incrementales, refactors intermedios y mensajes que describen decisiones de producto.",
  suspicious: false,
};

export const projects: Project[] = [
  {
    challengeSlug: "stripe-analytics-dashboard",
    title: "Stripe Analytics Dashboard",
    track: "backend",
    score: 91,
    percentile: "Top 8%",
    difficulty: "intermedio",
    approved: true,
    shippedAgo: "Hace 3 días",
    technologies: ["TypeScript", "React", "PostgreSQL"],
  },
  {
    challengeSlug: "ai-transcription-api",
    title: "AI Transcription API",
    track: "ai-ml",
    score: 94,
    percentile: "Top 5%",
    difficulty: "avanzado",
    approved: true,
    shippedAgo: "Hace 1 semana",
    technologies: ["Python", "FastAPI", "PostgreSQL"],
  },
  {
    challengeSlug: "taskflow-api",
    title: "TaskFlow API",
    track: "backend",
    score: 87,
    percentile: "Top 20%",
    difficulty: "intermedio",
    approved: false,
    shippedAgo: "Hace 2 semanas",
    technologies: ["TypeScript", "Node.js", "MongoDB"],
  },
  {
    challengeSlug: "carbon-footprint-calculator",
    title: "Carbon Footprint Calculator",
    track: "fullstack",
    score: 85,
    percentile: "Top 25%",
    difficulty: "intermedio",
    approved: false,
    shippedAgo: "Hace 1 mes",
    technologies: ["Python", "Django", "PostgreSQL"],
  },
];

export const achievements: Achievement[] = [
  { id: "primer-ship", label: "Primer ship", hue: "brand" },
  { id: "racha-7", label: "Racha de 7", hue: "warning" },
  { id: "top-10", label: "Top 10%", hue: "destructive" },
  { id: "security-first", label: "Security First", hue: "success" },
  { id: "startup-approved", label: "Startup approved", hue: "gem" },
];

/** El match que cierra el loop: la startup contacta tras leer la evaluación. */
export const opportunity = {
  company: { name: "Stripe", logoText: "stripe", industry: "Fintech" },
  role: "Senior Full Stack Engineer",
  mode: "Remoto · Tiempo completo",
  matchPercent: 94,
  basedOn: featuredChallenge.title,
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
  why: "Tu solución al desafío Stripe Analytics Dashboard destacó por su rendimiento, calidad de código y escalabilidad.",
  about:
    "Buscamos un engineer que nos ayude a escalar nuestra plataforma de analytics y a construir productos que impacten a millones de usuarios.",
};
