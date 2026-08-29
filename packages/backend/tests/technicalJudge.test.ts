/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";

import { api, internal } from "../convex/_generated/api";
import schema from "../convex/schema";
import {
  boundReviewedFiles,
  canonicalizeGithubUrl,
  filePriority,
  githubApiUrl,
  isReviewableFile,
  rawGithubUrl,
  sanitizeEvidence,
  selectCandidateFiles,
  weightedScore,
} from "../convex/technicalJudge";

const modules = import.meta.glob("../convex/**/*.{ts,js}");

describe("GitHub repository boundaries", () => {
  it("canonicalizes only root public GitHub URLs", () => {
    expect(canonicalizeGithubUrl("https://github.com/openai/openai-node.git/"))
      .toEqual({
        owner: "openai",
        repo: "openai-node",
        url: "https://github.com/openai/openai-node",
      });

    for (const invalid of [
      "http://github.com/openai/openai-node",
      "https://github.com/openai/openai-node/tree/main",
      "https://gitlab.com/openai/openai-node",
      "https://github.com/openai/openai-node?tab=readme",
    ]) {
      expect(() => canonicalizeGithubUrl(invalid)).toThrow();
    }
  });

  it("reconstructs trusted API and raw hosts", () => {
    const repository = { owner: "openai", repo: "openai-node" };
    expect(githubApiUrl(repository, "commits/main")).toBe(
      "https://api.github.com/repos/openai/openai-node/commits/main",
    );
    expect(rawGithubUrl(repository, "abc1234", "src/a file.ts")).toBe(
      "https://raw.githubusercontent.com/openai/openai-node/abc1234/src/a%20file.ts",
    );
  });
});

describe("bounded deterministic sampling", () => {
  it("excludes secrets, generated files, dependencies, lockfiles and binaries", () => {
    const file = (path: string, size = 100) => ({
      path,
      size,
      type: "blob" as const,
    });

    expect(isReviewableFile(file("src/index.ts"))).toBe(true);
    expect(isReviewableFile(file("README.md"))).toBe(true);
    expect(isReviewableFile(file(".env"))).toBe(false);
    expect(isReviewableFile(file("private.pem"))).toBe(false);
    expect(isReviewableFile(file("node_modules/pkg/index.js"))).toBe(false);
    expect(isReviewableFile(file("pnpm-lock.yaml"))).toBe(false);
    expect(isReviewableFile(file("image.png"))).toBe(false);
    expect(isReviewableFile(file("src/huge.ts", 120_001))).toBe(false);
  });

  it("prioritizes README, manifests and security-sensitive code", () => {
    const candidates = selectCandidateFiles([
      { path: "docs/notes.md", size: 100, type: "blob" },
      { path: "src/widget.ts", size: 100, type: "blob" },
      { path: "src/auth/middleware.ts", size: 100, type: "blob" },
      { path: "package.json", size: 100, type: "blob" },
      { path: "README.md", size: 100, type: "blob" },
    ]);

    expect(candidates.map((file) => file.path)).toEqual([
      "README.md",
      "package.json",
      "src/auth/middleware.ts",
      "src/widget.ts",
      "docs/notes.md",
    ]);
    expect(filePriority("README.md")).toBeGreaterThan(
      filePriority("docs/notes.md"),
    );
  });

  it("enforces file, per-file and total character limits", () => {
    const files = Array.from({ length: 45 }, (_, index) => ({
      path: `src/file-${index}.ts`,
      content: "x".repeat(index === 0 ? 35_000 : 5_000),
      lineCount: 1,
      truncated: false,
    }));
    const sample = boundReviewedFiles(files);

    expect(sample.files.length).toBeLessThanOrEqual(40);
    expect(sample.files[0].content).toHaveLength(30_000);
    expect(sample.totalCharacters).toBe(180_000);
    expect(sample.files.every((file) => file.content.length <= 30_000)).toBe(
      true,
    );
  });
});

describe("scoring and citation integrity", () => {
  it("computes the documented weighted score server-side", () => {
    expect(
      weightedScore({
        correctness: { score: 80 },
        security: { score: 70 },
        architecture: { score: 90 },
        codeQuality: { score: 60 },
        performance: { score: 50 },
      }),
    ).toBe(73);
  });

  it("drops unknown citations and clamps line evidence to reviewed content", () => {
    expect(
      sanitizeEvidence(
        [
          {
            path: "src/index.ts",
            startLine: 2,
            endLine: 99,
            snippet: "invented",
          },
          {
            path: "src/missing.ts",
            startLine: 1,
            endLine: 2,
            snippet: "invented",
          },
        ],
        [
          {
            path: "src/index.ts",
            content: "one\ntwo\nthree",
            lineCount: 3,
            truncated: false,
          },
        ],
      ),
    ).toEqual([
      {
        path: "src/index.ts",
        startLine: 2,
        endLine: 3,
        snippet: "two\nthree",
      },
    ]);
  });
});

describe("technical review persistence", () => {
  it("creates one queued review for duplicate request IDs", async () => {
    const t = convexTest(schema, modules);
    const input = {
      repoUrl: "https://github.com/openai/openai-node",
      requestId: "request-idempotent-001",
    };

    const first = await t.mutation(api.technicalJudge.start, input);
    const second = await t.mutation(api.technicalJudge.start, input);
    expect(second).toBe(first);

    const review = await t.query(api.technicalJudge.get, { reviewId: first });
    expect(review).toMatchObject({
      repoUrl: input.repoUrl,
      status: "queued",
      owner: "openai",
      repo: "openai-node",
    });
  });

  it("persists status transitions and a completed report", async () => {
    const t = convexTest(schema, modules);
    const reviewId = await t.mutation(api.technicalJudge.start, {
      repoUrl: "https://github.com/openai/openai-node",
      requestId: "request-complete-001",
    });

    await t.mutation(internal.technicalJudge.setStatus, {
      reviewId,
      status: "reading_repository",
    });
    expect(await t.query(api.technicalJudge.get, { reviewId })).toMatchObject({
      status: "reading_repository",
    });

    const repository = {
      owner: "openai",
      name: "openai-node",
      url: "https://github.com/openai/openai-node",
      defaultBranch: "master",
      commitSha: "abcdef1234567890",
      description: "SDK",
      primaryLanguage: "TypeScript",
      stars: 1,
      sizeKb: 100,
    };
    const dimension = {
      score: 80,
      rationale: "La muestra presenta una implementación consistente y verificable.",
      confidence: "alta",
    };
    await t.mutation(internal.technicalJudge.complete, {
      reviewId,
      repository,
      coverage: {
        totalFiles: 10,
        candidateFiles: 8,
        analyzedFiles: 8,
        analyzedCharacters: 10_000,
        omittedFiles: 0,
        limited: false,
      },
      result: {
        dimensions: {
          correctness: dimension,
          security: dimension,
          architecture: dimension,
          codeQuality: dimension,
          performance: dimension,
        },
        overallScore: 80,
        summary: "Resumen técnico con evidencia suficiente para la demostración.",
        verdict: "solido",
        strengths: ["Separación clara de responsabilidades."],
        findings: [],
        recommendations: [
          {
            priority: "media",
            title: "Ampliar pruebas",
            description: "Agregar cobertura sobre los caminos de error más importantes.",
          },
        ],
        limitations: [],
      },
      usage: {
        model: "gpt-5.6-terra",
        inputTokens: 1_000,
        outputTokens: 500,
        totalTokens: 1_500,
        durationMs: 2_000,
      },
    });

    expect(await t.query(api.technicalJudge.get, { reviewId })).toMatchObject({
      status: "completed",
      repository,
      result: { overallScore: 80 },
      usage: { model: "gpt-5.6-terra" },
    });
  });

  it("persists safe failure details", async () => {
    const t = convexTest(schema, modules);
    const reviewId = await t.mutation(api.technicalJudge.start, {
      repoUrl: "https://github.com/openai/openai-node",
      requestId: "request-failed-001",
    });

    await t.mutation(internal.technicalJudge.fail, {
      reviewId,
      code: "openai_rate_limit",
      message: "OpenAI alcanzó su límite de solicitudes.",
    });

    expect(await t.query(api.technicalJudge.get, { reviewId })).toMatchObject({
      status: "failed",
      failureCode: "openai_rate_limit",
      failureMessage: "OpenAI alcanzó su límite de solicitudes.",
    });
  });
});
