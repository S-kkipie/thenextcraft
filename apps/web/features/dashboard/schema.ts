import { z } from "zod";

/**
 * Dashboard view-models (zod = single type source, per AGENTS §1).
 *
 * The Convex queries this feature reads (`api.challenges.list`,
 * `api.submissions.byBuilder`) may return either the plain committed Docs or an
 * enriched join (startup name, sector, participant count) that peers own. We
 * normalize whatever arrives into these strict shapes at the boundary
 * (see ./model.ts), so the UI never depends on enrichment landing first.
 */

export const statusTone = z.enum(["sand", "sage", "terra"]);
export type StatusTone = z.infer<typeof statusTone>;

/** Card in "Retos para ti" — feeds the craft <ChallengeCard/>. */
export const challengeCard = z.object({
  id: z.string(),
  title: z.string(),
  problem: z.string(),
  company: z.string(),
  sector: z.string(),
  initials: z.string(),
  reward: z.string().optional(),
  tech: z.array(z.string()).optional(),
  participants: z.number().optional(),
  days: z.number().optional(),
  href: z.string(),
});
export type ChallengeCardData = z.infer<typeof challengeCard>;

/** Card in "Tus retos activos" — an in-flight submission joined to its reto. */
export const activeSubmission = z.object({
  id: z.string(),
  challengeId: z.string(),
  title: z.string(),
  company: z.string(),
  sector: z.string(),
  statusLabel: z.string(),
  statusTone,
  daysLeft: z.number().optional(),
  href: z.string(),
});
export type ActiveSubmission = z.infer<typeof activeSubmission>;

/** SHIPPED / APPROVED / AVG JUDGE tiles. */
export const dashboardStats = z.object({
  shipped: z.number(),
  approved: z.number(),
  avgJudge: z.number().nullable(),
});
export type DashboardStats = z.infer<typeof dashboardStats>;

/** Level ring + XP bar + streak (feeds craft <ProgressCluster/>). */
export const progressView = z.object({
  level: z.number(),
  progress: z.number(), // 0..1
  streak: z.number(),
  xpValue: z.number(),
  xpMax: z.number(),
});
export type ProgressView = z.infer<typeof progressView>;

/** "Próximo paso" callout. */
export const nextStep = z.object({
  title: z.string(),
  body: z.string(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});
export type NextStep = z.infer<typeof nextStep>;

/** "Actividad reciente" row. */
export const activityItem = z.object({
  id: z.string(),
  icon: z.string(), // nombre de PixelIcon
  text: z.string(),
  when: z.string(),
});
export type ActivityItem = z.infer<typeof activityItem>;

/**
 * Permissive source schemas — read loosely-typed query results (plain Doc OR
 * enriched join) without exploding when a field is absent. Unknown keys are
 * stripped; every enriched field is optional with a graceful fallback in
 * ./model.ts.
 */
export const challengeSource = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string().optional(),
  businessProblem: z.string().optional(),
  problem: z.string().optional(),
  reward: z.string().optional(),
  tech: z.array(z.string()).optional(),
  deadline: z.number().optional(),
  status: z.string().optional(),
  // enriched (peer-owned join) — optional
  company: z.string().optional(),
  companyName: z.string().optional(),
  startupName: z.string().optional(),
  sector: z.string().optional(),
  participants: z.number().optional(),
  participantCount: z.number().optional(),
});
export type ChallengeSource = z.infer<typeof challengeSource>;

export const submissionSource = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  challengeId: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.number().optional(),
  // enriched (peer-owned join) — optional
  company: z.string().optional(),
  companyName: z.string().optional(),
  startupName: z.string().optional(),
  sector: z.string().optional(),
  challenge: challengeSource.optional(),
});
export type SubmissionSource = z.infer<typeof submissionSource>;
