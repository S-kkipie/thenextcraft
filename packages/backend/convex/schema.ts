import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The Next Ship — schema MVP. Ver README raíz + docs/design-foundation.md.
// Regla: streak/level/xp = capa de engagement sobre señales reales; la
// plataforma NUNCA corre código (AI Judge estático, autoría humana).
export default defineSchema({
  users: defineTable({
    role: v.union(v.literal("builder"), v.literal("startup")),
    name: v.string(),
    githubHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    // engagement layer (derivable; almacenado para el MVP)
    level: v.optional(v.number()),
    xp: v.optional(v.number()),
    streak: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    // startup profile
    companyName: v.optional(v.string()),
    sector: v.optional(v.string()),
  })
    .index("by_github", ["githubHandle"])
    .index("by_role", ["role"]),

  // Reto = problema de negocio real de una startup.
  challenges: defineTable({
    startupId: v.id("users"),
    title: v.string(),
    businessProblem: v.string(),
    successCriteria: v.array(v.string()),
    reward: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
    deadline: v.optional(v.number()),
    status: v.union(v.literal("open"), v.literal("closed")),
  })
    .index("by_status", ["status"])
    .index("by_startup", ["startupId"]),

  // Ship de un builder: siempre un link. La plataforma nunca corre código.
  submissions: defineTable({
    challengeId: v.id("challenges"),
    builderId: v.id("users"),
    repoUrl: v.string(),
    demoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
    mediaUrl: v.optional(v.string()), // video/audio de la defensa (etapa C, humana)
    status: v.union(
      v.literal("submitted"),
      v.literal("evaluating"),
      v.literal("evaluated"),
    ),
    createdAt: v.number(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_builder", ["builderId"]),

  // Score comparable: (1) fit vs criterios, (2) calidad build (estático), (3) autoría humana.
  evaluations: defineTable({
    submissionId: v.id("submissions"),
    fitScore: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
    architectureScore: v.optional(v.number()),
    securityScore: v.optional(v.number()),
    totalScore: v.optional(v.number()),
    rank: v.optional(v.number()),
    strengths: v.optional(v.array(v.string())),
    issues: v.optional(v.array(v.string())),
    authorshipStatus: v.union(
      v.literal("pending"),
      v.literal("video"),
      v.literal("interview"),
      v.literal("approved"),
    ),
    aiEvidence: v.optional(v.string()),
  }).index("by_submission", ["submissionId"]),

  badges: defineTable({
    userId: v.id("users"),
    type: v.string(), // first-ship | shipped | startup-approved | top-10 | authorship-verified
    challengeId: v.optional(v.id("challenges")),
  }).index("by_user", ["userId"]),

  // "Te descubrieron": una startup contacta a un builder por su trabajo.
  opportunities: defineTable({
    builderId: v.id("users"),
    startupId: v.id("users"),
    challengeId: v.optional(v.id("challenges")),
    role: v.string(), // puesto ofrecido
    matchPct: v.optional(v.number()),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
    createdAt: v.number(),
  })
    .index("by_builder", ["builderId"])
    .index("by_startup", ["startupId"]),
});
