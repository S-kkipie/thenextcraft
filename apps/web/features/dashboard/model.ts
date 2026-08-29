import type { Doc } from "@thenextcraft/backend/dataModel";
import {
  challengeSource,
  submissionSource,
  type ActiveSubmission,
  type ActivityItem,
  type ChallengeCardData,
  type DashboardStats,
  type NextStep,
  type ProgressView,
  type StatusTone,
} from "./schema";

const DAY_MS = 86_400_000;

/** XP band width for a level. Mockup: level 12 → 3000 XP band. */
function xpMaxForLevel(level: number): number {
  return Math.max(250, level * 250);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Level ring + XP bar + streak from the user's engagement layer. */
export function deriveProgress(user: Doc<"users"> | null): ProgressView {
  const level = user?.level ?? 1;
  const xpValue = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const xpMax = xpMaxForLevel(level);
  return { level, xpValue, xpMax, streak, progress: clamp01(xpValue / xpMax) };
}

/** Whole-word initials from a company/title, max 2 chars, uppercased. */
function initialsFrom(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  const chars =
    words.length === 1
      ? words[0].slice(0, 2)
      : words[0][0] + words[1][0];
  return chars.toUpperCase();
}

function daysLeftFrom(deadline: number | undefined, now: number): number | undefined {
  if (deadline === undefined) return undefined;
  return Math.max(0, Math.ceil((deadline - now) / DAY_MS));
}

/** Spanish relative time, coarse buckets. */
export function relativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

function companyOf(s: {
  company?: string;
  companyName?: string;
  startupName?: string;
}): string | undefined {
  return s.company ?? s.companyName ?? s.startupName;
}

const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  submitted: { label: "En progreso", tone: "sand" },
  evaluating: { label: "Evaluando", tone: "sage" },
  evaluated: { label: "Evaluado", tone: "sage" },
};

/** Normalize `api.challenges.list` (plain Docs or enriched) → ChallengeCard data. */
export function toChallengeCards(raw: unknown, now: number): ChallengeCardData[] {
  const parsed = challengeSource.array().safeParse(raw);
  if (!parsed.success) return [];
  return parsed.data
    .filter((c) => c.status === undefined || c.status === "open")
    .map((c) => {
    const id = c._id ?? c.id ?? "";
    const company = companyOf(c) ?? "";
    return {
      id,
      title: c.title ?? "Reto",
      problem: c.problem ?? c.businessProblem ?? "",
      company,
      sector: c.sector ?? "",
      initials: initialsFrom(company || c.title || "Reto"),
      reward: c.reward,
      tech: c.tech,
      participants: c.participants ?? c.participantCount,
      days: daysLeftFrom(c.deadline, now),
      href: id ? `/challenges/${id}` : "/challenges",
    };
  });
}

type NormalizedSubmission = {
  id: string;
  challengeId: string;
  status: string;
  createdAt: number;
  company: string;
  sector: string;
  title: string;
  daysLeft?: number;
};

type ChallengeMeta = {
  title: string;
  company: string;
  sector: string;
  days?: number;
};

/**
 * Lookup of challengeId → display meta, built from `api.challenges.list`.
 * `byBuilder` returns plain submissions (no reto join), so we enrich active
 * cards from the challenges we already fetched.
 */
export function toChallengeIndex(
  raw: unknown,
  now: number,
): Map<string, ChallengeMeta> {
  const parsed = challengeSource.array().safeParse(raw);
  const index = new Map<string, ChallengeMeta>();
  if (!parsed.success) return index;
  for (const c of parsed.data) {
    const id = c._id ?? c.id;
    if (!id) continue;
    index.set(id, {
      title: c.title ?? "Reto",
      company: companyOf(c) ?? "",
      sector: c.sector ?? "",
      days: daysLeftFrom(c.deadline, now),
    });
  }
  return index;
}

/** Normalize `api.submissions.byBuilder`, enriched via the challenge index. */
export function toSubmissions(
  raw: unknown,
  now: number,
  index?: Map<string, ChallengeMeta>,
): NormalizedSubmission[] {
  const parsed = submissionSource.array().safeParse(raw);
  if (!parsed.success) return [];
  return parsed.data.map((s) => {
    const ch = s.challenge; // present only if a peer enriches byBuilder later
    const challengeId = s.challengeId ?? ch?._id ?? ch?.id ?? "";
    const meta = index?.get(challengeId);
    return {
      id: s._id ?? s.id ?? "",
      challengeId,
      status: s.status ?? "submitted",
      createdAt: s.createdAt ?? 0,
      company: companyOf(s) ?? (ch ? companyOf(ch) : undefined) ?? meta?.company ?? "",
      sector: s.sector ?? ch?.sector ?? meta?.sector ?? "",
      title: ch?.title ?? meta?.title ?? "Reto",
      daysLeft: daysLeftFrom(ch?.deadline, now) ?? meta?.days,
    };
  });
}

/** In-flight submissions (not yet fully evaluated) → active-challenge cards. */
export function toActiveSubmissions(
  subs: NormalizedSubmission[],
): ActiveSubmission[] {
  return subs
    .filter((s) => s.status === "submitted" || s.status === "evaluating")
    .map((s) => {
      const meta = STATUS_MAP[s.status] ?? STATUS_MAP.submitted;
      return {
        id: s.id,
        challengeId: s.challengeId,
        title: s.title,
        company: s.company,
        sector: s.sector,
        statusLabel: meta.label,
        statusTone: meta.tone,
        daysLeft: s.daysLeft,
        href: s.challengeId ? `/challenges/${s.challengeId}` : "/challenges",
      };
    });
}

/**
 * Stats over real signals. SHIPPED = every ship. APPROVED = passed the pipeline
 * (status "evaluated"). AVG JUDGE needs evaluation scores (not reachable yet) →
 * null renders as "—" until the evaluations query lands.
 */
export function deriveStats(subs: NormalizedSubmission[]): DashboardStats {
  const shipped = subs.length;
  const approved = subs.filter((s) => s.status === "evaluated").length;
  return { shipped, approved, avgJudge: null };
}

/** Next best action from current state. */
export function deriveNextStep(
  active: ActiveSubmission[],
  subs: NormalizedSubmission[],
): NextStep | null {
  const evaluated = subs.find((s) => s.status === "evaluated");
  if (evaluated) {
    const who = evaluated.company || "la startup";
    return {
      title: `Graba tu viva de autoría para ${who}`,
      body: "Tu submission pasó el filtro de la IA — defiende tu autoría en un video corto antes de que cierre.",
      ctaLabel: "Grabar",
      ctaHref: evaluated.challengeId
        ? `/challenges/${evaluated.challengeId}`
        : "/challenges",
    };
  }
  const evaluating = active.find((a) => a.statusLabel === "Evaluando");
  if (evaluating) {
    return {
      title: `La IA está evaluando tu ship${evaluating.company ? ` para ${evaluating.company}` : ""}`,
      body: "Te avisamos apenas tengas score y ranking. Mientras, puedes tomar otro reto.",
    };
  }
  if (active.length > 0) {
    const a = active[0];
    return {
      title: `Termina tu ship${a.company ? ` para ${a.company}` : ""}`,
      body: a.daysLeft !== undefined
        ? `Te quedan ${a.daysLeft} días para enviar tu solución.`
        : "Envía tu solución antes de que cierre el reto.",
      ctaLabel: "Ver reto",
      ctaHref: a.href,
    };
  }
  return {
    title: "Toma tu primer reto",
    body: "Elige un problema de negocio real, shipea tu solución y deja que tu trabajo hable por ti.",
    ctaLabel: "Ver retos",
    ctaHref: "/challenges",
  };
}

/** Recent activity derived from real ships (most recent first). */
export function deriveActivity(
  subs: NormalizedSubmission[],
  user: Doc<"users"> | null,
  now: number,
): ActivityItem[] {
  const items: ActivityItem[] = subs
    .filter((s) => s.createdAt > 0)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4)
    .map((s) => ({
      id: `ship-${s.id}`,
      icon: "ship",
      text: s.company ? `Shipeaste para ${s.company}` : "Shipeaste un reto",
      when: relativeTime(s.createdAt, now),
    }));

  if (user && (user.level ?? 1) > 1) {
    items.push({
      id: `level-${user.level}`,
      icon: "arrowUp",
      text: `Subiste a Nivel ${user.level}`,
      when: "",
    });
  }
  return items;
}
