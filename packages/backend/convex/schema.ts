import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// thenextcraft — schema MVP. Ver README raíz para el concepto/flow.
export default defineSchema({
  users: defineTable({
    role: v.union(v.literal("builder"), v.literal("startup")),
    name: v.string(),
    githubHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("by_github", ["githubHandle"]),

  // Reto = problema de negocio real de una startup.
  challenges: defineTable({
    startupId: v.id("users"),
    title: v.string(),
    businessProblem: v.string(),
    successCriteria: v.array(v.string()),
    reward: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.union(v.literal("open"), v.literal("closed")),
  }).index("by_status", ["status"]),

  // Ship de un builder: siempre un link. La plataforma nunca corre código.
  submissions: defineTable({
    challengeId: v.id("challenges"),
    builderId: v.id("users"),
    link: v.string(),
    mediaUrl: v.optional(v.string()), // video/audio de la defensa (etapa C, humana)
    createdAt: v.number(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_builder", ["builderId"]),

  // Score comparable: (1) fit vs criterios, (2) calidad, (3) autoría humana.
  evaluations: defineTable({
    submissionId: v.id("submissions"),
    fitScore: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
    totalScore: v.optional(v.number()),
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
    type: v.string(), // shipped | startup-approved | top-10
    challengeId: v.optional(v.id("challenges")),
  }).index("by_user", ["userId"]),
});
