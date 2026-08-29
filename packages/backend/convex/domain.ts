import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError } from "convex/values";

type DatabaseCtx = Pick<QueryCtx | MutationCtx, "db">;

export function fail(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

export function cleanRequiredText(
  value: string,
  field: string,
  minimum: number,
  maximum: number,
) {
  const cleaned = value.trim();
  if (cleaned.length < minimum || cleaned.length > maximum) {
    fail(
      "INVALID_INPUT",
      `${field} must contain between ${minimum} and ${maximum} characters`,
    );
  }
  return cleaned;
}

export function cleanOptionalText(
  value: string | null | undefined,
  field: string,
  maximum: number,
) {
  if (value === undefined || value === null) return value;
  const cleaned = value.trim();
  if (cleaned.length === 0 || cleaned.length > maximum) {
    fail("INVALID_INPUT", `${field} must contain between 1 and ${maximum} characters`);
  }
  return cleaned;
}

export function cleanGithubHandle(value: string | null | undefined) {
  if (value === undefined || value === null) return value;
  const cleaned = value.trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(cleaned)) {
    fail("INVALID_GITHUB_HANDLE", "githubHandle is not a valid GitHub handle");
  }
  return cleaned;
}

export function cleanSuccessCriteria(values: string[]) {
  if (values.length < 1 || values.length > 20) {
    fail("INVALID_INPUT", "successCriteria must contain between 1 and 20 items");
  }

  const cleaned = values.map((value) =>
    cleanRequiredText(value, "successCriteria item", 1, 500),
  );
  if (new Set(cleaned.map((value) => value.toLowerCase())).size !== cleaned.length) {
    fail("INVALID_INPUT", "successCriteria cannot contain duplicate items");
  }
  return cleaned;
}

export function cleanPublicGithubRepositoryUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    fail("INVALID_REPOSITORY_URL", "repositoryUrl must be a valid URL");
  }

  if (
    url.protocol !== "https:" ||
    !["github.com", "www.github.com"].includes(url.hostname.toLowerCase())
  ) {
    fail(
      "INVALID_REPOSITORY_URL",
      "repositoryUrl must be an HTTPS github.com repository URL",
    );
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) {
    fail(
      "INVALID_REPOSITORY_URL",
      "repositoryUrl must point directly to a public GitHub repository",
    );
  }

  const owner = parts[0];
  const repository = parts[1].replace(/\.git$/i, "");
  if (!owner || !repository || url.search || url.hash) {
    fail(
      "INVALID_REPOSITORY_URL",
      "repositoryUrl must point directly to a public GitHub repository",
    );
  }

  return `https://github.com/${owner}/${repository}`;
}

export function cleanHttpUrl(
  value: string | null | undefined,
  field: string,
) {
  if (value === undefined || value === null) return value;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    fail("INVALID_URL", `${field} must be a valid URL`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    fail("INVALID_URL", `${field} must use HTTP or HTTPS`);
  }
  return url.toString();
}

export function ensureFutureDeadline(deadline: number | null | undefined) {
  if (deadline === undefined || deadline === null) return deadline;
  if (!Number.isFinite(deadline) || deadline <= Date.now()) {
    fail("INVALID_DEADLINE", "deadline must be a future timestamp");
  }
  return deadline;
}

export async function requireUser(ctx: DatabaseCtx, userId: Id<"users">) {
  const user = await ctx.db.get("users", userId);
  if (!user) fail("USER_NOT_FOUND", "User not found");
  return user;
}

export async function requireRole(
  ctx: DatabaseCtx,
  userId: Id<"users">,
  role: "builder" | "startup",
) {
  const user = await requireUser(ctx, userId);
  if (user.role !== role) {
    fail("FORBIDDEN_ROLE", `This operation requires a ${role} user`);
  }
  return user;
}

export async function requireChallenge(
  ctx: DatabaseCtx,
  challengeId: Id<"challenges">,
) {
  const challenge = await ctx.db.get("challenges", challengeId);
  if (!challenge) fail("CHALLENGE_NOT_FOUND", "Challenge not found");
  return challenge;
}

export async function requireOwnedChallenge(
  ctx: DatabaseCtx,
  challengeId: Id<"challenges">,
  startupId: Id<"users">,
) {
  await requireRole(ctx, startupId, "startup");
  const challenge = await requireChallenge(ctx, challengeId);
  if (challenge.startupId !== startupId) {
    fail("NOT_CHALLENGE_OWNER", "The startup does not own this challenge");
  }
  return challenge;
}

export function ensureChallengeAcceptsSubmissions(
  challenge: { status: string; deadline?: number },
) {
  if (challenge.status !== "open") {
    fail("CHALLENGE_NOT_OPEN", "The challenge is not accepting submissions");
  }
  if (challenge.deadline !== undefined && challenge.deadline <= Date.now()) {
    fail("CHALLENGE_DEADLINE_PASSED", "The challenge deadline has passed");
  }
}

export function ensureScore(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    fail("INVALID_SCORE", `${field} must be between 0 and 100`);
  }
  return value;
}
