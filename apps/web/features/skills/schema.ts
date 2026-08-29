import { z } from "zod";

import type { PixelIconName } from "@/components/craft/pixel-icon";

/**
 * Skill Map — modelos de vista (zod = fuente única de tipos, AGENTS §1).
 *
 * PRODUCTO: el Skill Map NO es un árbol de RPG que se desbloquea. Cada nivel se
 * DERIVA de retos reales que has shipeado: se leen los `tech` de tus submissions
 * (`api.submissions.byBuilder`) + tus `skills` declarados y se mapean a categorías
 * por palabra clave. Refleja lo que has construido, no lo que has clickeado.
 */

/** Orden canónico de categorías. El tipo se DERIVA de la const (AGENTS §1). */
export const CATEGORY_ORDER = [
  "frontend",
  "backend",
  "ai-ml",
  "databases",
  "devops",
  "security",
  "fullstack",
] as const;
export type CategoryKey = (typeof CATEGORY_ORDER)[number];

/**
 * Config estática por categoría: etiqueta, icono, descripción y las palabras
 * clave (ya normalizadas: minúsculas, solo `[a-z0-9]`) que mapean un token de
 * tech a esta categoría. `fullstack` no tiene keywords — se deriva aparte de los
 * ships que abarcan frontend + backend a la vez (ver model.ts).
 */
export const CATEGORY_META: Record<
  CategoryKey,
  { label: string; icon: PixelIconName; blurb: string; keywords: readonly string[] }
> = {
  frontend: {
    label: "Frontend",
    icon: "screen",
    blurb: "Interfaces, componentes y experiencia de usuario.",
    keywords: [
      "next",
      "react",
      "tailwind",
      "css",
      "html",
      "vue",
      "svelte",
      "angular",
      "vite",
      "redux",
      "zustand",
      "shadcn",
      "chakra",
      "framer",
      "tanstack",
      "astro",
      "remix",
    ],
  },
  backend: {
    label: "Backend",
    icon: "gear",
    blurb: "APIs, lógica de servidor y datos en movimiento.",
    keywords: [
      "node",
      "convex",
      "express",
      "fastify",
      "nest",
      "graphql",
      "apollo",
      "grpc",
      "trpc",
      "django",
      "flask",
      "fastapi",
      "rails",
      "laravel",
      "spring",
      "dotnet",
      "golang",
      "rust",
      "elixir",
      "bun",
      "deno",
      "hono",
      "elysia",
      "api",
    ],
  },
  "ai-ml": {
    label: "AI / ML",
    icon: "brain",
    blurb: "Modelos, LLMs, visión y pipelines de datos.",
    keywords: [
      "llm",
      "gpt",
      "anthropic",
      "claude",
      "openai",
      "gemini",
      "mistral",
      "llama",
      "tensorflow",
      "pytorch",
      "keras",
      "huggingface",
      "transformers",
      "langchain",
      "llamaindex",
      "rag",
      "embedding",
      "pinecone",
      "weaviate",
      "nlp",
      "spacy",
      "opencv",
      "yolo",
      "diffusion",
      "vision",
      "mlops",
    ],
  },
  databases: {
    label: "Databases",
    icon: "database",
    blurb: "Persistencia, modelado y consultas.",
    keywords: [
      "postgres",
      "mysql",
      "mariadb",
      "mongo",
      "redis",
      "sqlite",
      "sql",
      "prisma",
      "drizzle",
      "supabase",
      "planetscale",
      "cockroach",
      "dynamodb",
      "firestore",
      "firebase",
      "neo4j",
      "cassandra",
      "elasticsearch",
      "database",
    ],
  },
  devops: {
    label: "DevOps",
    icon: "wrench",
    blurb: "Deploy, infraestructura y automatización.",
    keywords: [
      "docker",
      "kubernetes",
      "k8s",
      "terraform",
      "ansible",
      "pulumi",
      "jenkins",
      "githubactions",
      "gitlabci",
      "circleci",
      "aws",
      "gcp",
      "azure",
      "vercel",
      "netlify",
      "cloudflare",
      "nginx",
      "helm",
      "prometheus",
      "grafana",
      "cicd",
      "serverless",
      "lambda",
      "deploy",
    ],
  },
  security: {
    label: "Security",
    icon: "shield",
    blurb: "Auth, cifrado y superficie de ataque.",
    keywords: [
      "auth",
      "oauth",
      "jwt",
      "clerk",
      "keycloak",
      "cognito",
      "security",
      "encryption",
      "cryptography",
      "owasp",
      "ssl",
      "tls",
      "saml",
      "sso",
      "rbac",
      "vault",
      "snyk",
    ],
  },
  fullstack: {
    label: "Full Stack",
    icon: "grid",
    blurb: "Retos shipeados end-to-end: frontend + backend en una sola solución.",
    keywords: [],
  },
};

/**
 * Lectura permisiva de `api.submissions.byBuilder` (Doc plano O join enriquecido):
 * solo necesitamos `tech`, `status` y `createdAt`. Claves desconocidas se ignoran.
 */
export const submissionSource = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  tech: z.array(z.string()).optional(),
  status: z.string().optional(),
  createdAt: z.number().optional(),
});
export type SubmissionSource = z.infer<typeof submissionSource>;

/** Fila derivada por categoría (alimenta el <ScoreBar/> y la card). */
export const derivedCategory = z.object({
  key: z.enum(CATEGORY_ORDER),
  label: z.string(),
  icon: z.custom<PixelIconName>(),
  blurb: z.string(),
  /** 0..100 — dominio derivado (ships × peso + skills declarados × peso). */
  value: z.number(),
  /** 0 (sin evidencia) .. 5. */
  level: z.number(),
  /** Nº de ships tuyos cuyo tech cae en esta categoría. */
  shipCount: z.number(),
  /** Tokens de tech de tus ships que mapearon aquí (evidencia real). */
  matchedTech: z.array(z.string()),
  /** Skills declarados en tu perfil que caen aquí (señal más débil). */
  declaredSkills: z.array(z.string()),
  /** La categoría más fuerte se resalta como primaria. */
  primary: z.boolean(),
});
export type DerivedCategory = z.infer<typeof derivedCategory>;

/** Mapa completo derivado para un builder. */
export const skillMap = z.object({
  categories: z.array(derivedCategory),
  totalShips: z.number(),
  activeCategories: z.number(),
});
export type SkillMap = z.infer<typeof skillMap>;
