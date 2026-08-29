import { query } from "./_generated/server";
import { v } from "convex/values";

// App read-layer: enriched, array-returning views over Alejandro's CRUD schema.
// Keeps the frontend shapes stable while his domain layer stays canonical.

function initials(name: string | null | undefined): string {
  return (name?.trim()?.[0] ?? "?").toUpperCase();
}

export const challengesOpen = query({
  args: {},
  handler: async (ctx) => {
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_status_and_updatedAt", (q) => q.eq("status", "open"))
      .order("desc")
      .take(100);
    const out = [];
    for (const c of challenges) {
      const s = await ctx.db.get("users", c.startupId);
      const company = s?.companyName ?? s?.name ?? "Startup";
      out.push({
        _id: c._id,
        title: c.title,
        businessProblem: c.businessProblem,
        successCriteria: c.successCriteria,
        reward: c.reward ?? null,
        tech: c.tech ?? [],
        deadline: c.deadline ?? null,
        status: "open" as const,
        company,
        sector: s?.sector ?? null,
        initials: initials(company),
      });
    }
    return out;
  },
});

export const challengeDetail = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const c = await ctx.db.get("challenges", challengeId);
    if (!c) return null;
    const s = await ctx.db.get("users", c.startupId);
    const company = s?.companyName ?? s?.name ?? "Startup";
    return { ...c, company, sector: s?.sector ?? null, initials: initials(company) };
  },
});

export const submissionDetail = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.db.get("submissions", submissionId);
    if (!submission) return null;
    const challenge = await ctx.db.get("challenges", submission.challengeId);
    const startup = challenge
      ? await ctx.db.get("users", challenge.startupId)
      : null;
    return {
      submission,
      challenge,
      company: startup?.companyName ?? startup?.name ?? null,
    };
  },
});

export const builderSubmissions = query({
  args: { builderId: v.id("users") },
  handler: async (ctx, { builderId }) => {
    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_builderId_and_updatedAt", (q) =>
        q.eq("builderId", builderId),
      )
      .order("desc")
      .take(100);
    const out = [];
    for (const s of subs) {
      const ch = await ctx.db.get("challenges", s.challengeId);
      const st = ch ? await ctx.db.get("users", ch.startupId) : null;
      const ev = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) => q.eq("submissionId", s._id))
        .unique();
      out.push({
        _id: s._id,
        challengeId: s.challengeId,
        status: s.status,
        repositoryUrl: s.repositoryUrl,
        tech: s.tech ?? [],
        challengeTitle: ch?.title ?? "Reto",
        challengeStatus: ch?.status ?? null,
        company: st?.companyName ?? st?.name ?? null,
        submittedAt: s.submittedAt,
        feedbackStatus: ev?.feedbackStatus ?? "pending",
        score: ev?.totalScore ?? null,
      });
    }
    return out;
  },
});

export const evaluationForSubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    const ev = await ctx.db
      .query("evaluations")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
      .unique();
    if (!ev) return null;
    const cohort = await ctx.db
      .query("evaluations")
      .withIndex("by_challengeId_and_status_and_totalScore", (q) =>
        q.eq("challengeId", ev.challengeId).eq("status", "completed"),
      )
      .collect();
    const sorted = cohort
      .filter((e) => e.totalScore != null)
      .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
    const idx = sorted.findIndex((e) => e._id === ev._id);
    return { evaluation: ev, rank: idx >= 0 ? idx + 1 : null, cohort: sorted.length };
  },
});

export const profileSummary = query({
  args: { handle: v.string() },
  handler: async (ctx, { handle }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_githubHandle", (q) => q.eq("githubHandle", handle))
      .unique();
    if (!user) return null;

    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_builderId_and_updatedAt", (q) =>
        q.eq("builderId", user._id),
      )
      .collect();
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    let sum = 0;
    let n = 0;
    const projects = [];
    for (const s of subs) {
      const ev = await ctx.db
        .query("evaluations")
        .withIndex("by_submissionId", (q) => q.eq("submissionId", s._id))
        .unique();
      if (ev?.totalScore != null) {
        sum += ev.totalScore;
        n++;
      }
      const ch = await ctx.db.get("challenges", s.challengeId);
      const st = ch ? await ctx.db.get("users", ch.startupId) : null;
      projects.push({
        submissionId: s._id,
        title: ch?.title ?? "Reto",
        startupName: st?.companyName ?? st?.name ?? null,
        sector: st?.sector ?? null,
        score: ev?.totalScore ?? null,
        authorshipApproved: ev?.authorshipStatus === "approved",
        shipUrl: s.repositoryUrl,
      });
    }
    const avgJudge = n ? Math.round(sum / n) : null;
    const approved = badges.filter((b) => b.type === "startup-approved").length;
    const shipped = subs.filter((s) => s.status !== "withdrawn").length;
    const total = Math.min(
      1000,
      shipped * 80 + approved * 120 + (avgJudge ?? 0) * 4,
    );

    return {
      user,
      stats: { shipped, approved, avgJudge, badgeCount: badges.length },
      score: {
        total,
        breakdown: [
          { key: "ships", label: "Ships", value: Math.min(100, shipped * 20), primary: false },
          { key: "approval", label: "Aprobación", value: shipped ? Math.round((approved / shipped) * 100) : 0, primary: false },
          { key: "judge", label: "AI Judge", value: avgJudge ?? 0, primary: true },
          { key: "authorship", label: "Autoría", value: projects.some((p) => p.authorshipApproved) ? 100 : 0, primary: false },
        ],
      },
      skills: user.skills ?? [],
      badges: badges.map((b) => ({ id: b._id, type: b.type })),
      projects,
    };
  },
});
