import { describe, expect, test } from "vitest";

import { filePriority, weightedScore } from "./technicalJudge";

describe("technical judge calibration", () => {
  test("samples implementation before README and supporting documentation", () => {
    expect(filePriority("src/api/auth/session.ts")).toBeGreaterThan(
      filePriority("README.md"),
    );
    expect(filePriority("src/api/auth/session.ts")).toBeGreaterThan(
      filePriority("docs/architecture.md"),
    );
  });

  test("caps a submission that does not demonstrably meet the challenge", () => {
    const dimensions = {
      correctness: { score: 90 },
      security: { score: 90 },
      architecture: { score: 90 },
      codeQuality: { score: 90 },
      performance: { score: 90 },
    };

    expect(weightedScore(dimensions, { score: 30 })).toBeLessThan(50);
    expect(weightedScore(dimensions, { score: 80 })).toBeGreaterThan(80);
  });
});
