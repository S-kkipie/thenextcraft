import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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

// LEGACY: la viva de autoría (video/entrevista) fue reemplazada por feedback.
// Se mantiene opcional para no romper datos/consumidores antiguos.
export const authorshipStatusValidator = v.union(
  v.literal("pending"),
  v.literal("video"),
  v.literal("interview"),
  v.literal("approved"),
);

// Feedback del reto: se genera en batch al FINALIZAR (cerrar) el reto, corriendo
// el AI Technical Judge sobre cada submission. `ready` cuando su review terminó.
export const feedbackStatusValidator = v.union(
  v.literal("pending"), // shipeado, aún sin feedback (reto abierto)
  v.literal("generating"), // reto cerrado, judge corriendo
  v.literal("ready"), // feedback disponible
  v.literal("failed"),
);

// Un hallazgo del judge con evidencia a nivel de línea (archivo + rango + snippet).
export const feedbackEvidenceValidator = v.object({
  path: v.string(),
  startLine: v.number(),
  endLine: v.number(),
  snippet: v.string(),
});
export const feedbackFindingValidator = v.object({
  title: v.string(),
  severity: v.string(), // critical | high | medium | low
  dimension: v.string(),
  description: v.string(),
  evidence: v.array(feedbackEvidenceValidator),
});
export const feedbackRecommendationValidator = v.object({
  priority: v.string(),
  title: v.string(),
  description: v.string(),
});
// Cita comparativa a otra submission del MISMO reto (peer reference).
export const peerReferenceValidator = v.object({
  builderName: v.string(),
  builderHandle: v.union(v.string(), v.null()),
  path: v.string(),
  startLine: v.number(),
  note: v.string(), // qué hizo el peer y cómo se compara con esta submission
});

export const badgeTypeValidator = v.union(
  v.literal("first-ship"),
  v.literal("shipped"),
  v.literal("startup-approved"),
  v.literal("top-10"),
  v.literal("authorship-verified"),
);

export const schema = defineSchema({
  // Convex Auth tables (authAccounts/authSessions/…); our `users` overrides its minimal one.
  ...authTables,
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
    // Company LinkedIn page. Optional at onboarding; if empty, the submission
    // copilot asks the builder which company the challenge is from.
    linkedinUrl: v.optional(v.string()),
    updatedAt: v.number(),
    email: v.optional(v.string()),
    onboarded: v.optional(v.boolean()),
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

  // Score comparable + feedback line-level. El feedback (findings + peer refs) se
  // genera al FINALIZAR el reto corriendo el AI Technical Judge sobre cada submission.
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
    // Feedback line-level (reemplaza la viva de autoría).
    feedbackStatus: v.optional(feedbackStatusValidator),
    findings: v.optional(v.array(feedbackFindingValidator)),
    recommendations: v.optional(v.array(feedbackRecommendationValidator)),
    peerReferences: v.optional(v.array(peerReferenceValidator)),
    // LEGACY: viva de autoría, ya no se usa en el flujo.
    authorshipStatus: v.optional(authorshipStatusValidator),
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

  // "Te descubrieron": una startup contacta a un builder por su trabajo.
  opportunities: defineTable({
    builderId: v.id("users"),
    startupId: v.id("users"),
    challengeId: v.optional(v.id("challenges")),
    role: v.string(),
    matchPct: v.optional(v.number()),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
    createdAt: v.number(),
  })
    .index("by_builderId", ["builderId"])
    .index("by_startupId", ["startupId"]),

  // AI Technical Judge (static repo review). Self-contained; bridged into
  // `evaluations` on completion so the app UI + shortlist see the scores.
  technicalReviews: defineTable({
    requestId: v.string(),
    repoUrl: v.string(),
    owner: v.string(),
    repo: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("validating_repository"),
      v.literal("reading_repository"),
      v.literal("selecting_files"),
      v.literal("reviewing_code"),
      v.literal("finalizing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    startedAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    failureCode: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
    repository: v.optional(v.any()),
    coverage: v.optional(v.any()),
    result: v.optional(v.any()),
    usage: v.optional(v.any()),
  }).index("by_request_id", ["requestId"]),

  // Ofertas de trabajo scrapeadas de LinkedIn vía Apify (action jobs.scrapeCompany).
  // `company` = clave normalizada (lowercase) para agrupar por empresa.
  jobListings: defineTable({
    company: v.string(),
    title: v.string(),
    companyName: v.string(),
    location: v.optional(v.string()),
    url: v.string(),
    externalId: v.string(),
    source: v.literal("linkedin"),
    postedAt: v.optional(v.number()),
    snippet: v.optional(v.string()),
    scrapedAt: v.number(),
    scrapedBy: v.optional(v.id("users")),
  })
    .index("by_company_and_scrapedAt", ["company", "scrapedAt"])
    .index("by_company_and_externalId", ["company", "externalId"]),
});

export default schema;
