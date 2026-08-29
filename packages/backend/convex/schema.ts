import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The Next Ship — schema MVP. Ver README raíz + docs/design-foundation.md.
// Regla: streak/level/xp = capa de engagement sobre señales reales; la
// plataforma NUNCA corre código (AI Judge estático, autoría humana).
export const userRoleValidator = v.union(
  v.literal("builder"),
  v.literal("startup"),
);

export const challengeStatusValidator = v.union(
  v.literal("draft"),
  v.literal("open"),
  v.literal("closed"),
  v.literal("archived"),
);

export const submissionStatusValidator = v.union(
  v.literal("submitted"),
  v.literal("evaluating"),
  v.literal("evaluated"),
  v.literal("withdrawn"),
);

export const evaluationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

export const authorshipStatusValidator = v.union(
  v.literal("pending"),
  v.literal("video"),
  v.literal("interview"),
  v.literal("approved"),
);

export const badgeTypeValidator = v.union(
  v.literal("first-ship"),
  v.literal("shipped"),
  v.literal("startup-approved"),
  v.literal("top-10"),
  v.literal("authorship-verified"),
);

export const schema = defineSchema({
  users: defineTable({
    role: userRoleValidator,
    name: v.string(),
    githubHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    level: v.optional(v.number()),
    xp: v.optional(v.number()),
    streak: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    companyName: v.optional(v.string()),
    sector: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_githubHandle", ["githubHandle"])
    .index("by_role_and_updatedAt", ["role", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),

  challenges: defineTable({
    startupId: v.id("users"),
    title: v.string(),
    businessProblem: v.string(),
    successCriteria: v.array(v.string()),
    reward: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
    deadline: v.optional(v.number()),
    status: challengeStatusValidator,
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_status_and_updatedAt", ["status", "updatedAt"])
    .index("by_startupId_and_updatedAt", ["startupId", "updatedAt"])
    .index("by_startupId_and_status_and_updatedAt", [
      "startupId",
      "status",
      "updatedAt",
    ]),

  submissions: defineTable({
    challengeId: v.id("challenges"),
    builderId: v.id("users"),
    repositoryUrl: v.string(),
    demoUrl: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    pitch: v.optional(v.string()),
    description: v.optional(v.string()),
    tech: v.optional(v.array(v.string())),
    status: submissionStatusValidator,
    submittedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_challengeId_and_builderId", ["challengeId", "builderId"])
    .index("by_challengeId_and_updatedAt", ["challengeId", "updatedAt"])
    .index("by_challengeId_and_status_and_updatedAt", [
      "challengeId",
      "status",
      "updatedAt",
    ])
    .index("by_builderId_and_updatedAt", ["builderId", "updatedAt"])
    .index("by_builderId_and_status_and_updatedAt", [
      "builderId",
      "status",
      "updatedAt",
    ]),

  // Score comparable: (1) fit vs criterios, (2) calidad build (estático), (3) autoría humana.
  evaluations: defineTable({
    challengeId: v.id("challenges"),
    submissionId: v.id("submissions"),
    status: evaluationStatusValidator,
    fitScore: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
    architectureScore: v.optional(v.number()),
    securityScore: v.optional(v.number()),
    totalScore: v.optional(v.number()),
    rank: v.optional(v.number()),
    strengths: v.optional(v.array(v.string())),
    issues: v.optional(v.array(v.string())),
    rankedReview: v.optional(v.string()),
    authorshipStatus: authorshipStatusValidator,
    aiEvidence: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_challengeId_and_status_and_totalScore", [
      "challengeId",
      "status",
      "totalScore",
    ]),

  badges: defineTable({
    userId: v.id("users"),
    type: badgeTypeValidator,
    challengeId: v.optional(v.id("challenges")),
    awardedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_type_and_challengeId", [
      "userId",
      "type",
      "challengeId",
    ]),
});

export default schema;
