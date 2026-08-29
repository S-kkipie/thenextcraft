/// <reference types="vite/client" />

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const paginationOpts = { numItems: 20, cursor: null };

type TestBackend = TestConvex<typeof schema>;

async function createUser(
  t: TestBackend,
  name: string,
  role: "builder" | "startup",
  githubHandle: string,
) {
  return await t.mutation(api.users.createOrGet, {
    name,
    role,
    githubHandle,
  });
}

async function createOpenChallenge(
  t: TestBackend,
  startupId: Awaited<ReturnType<typeof createUser>>,
  title = "Improve customer onboarding",
) {
  const challengeId = await t.mutation(api.challenges.create, {
    startupId,
    title,
    businessProblem:
      "New customers abandon onboarding before completing their first project.",
    successCriteria: [
      "Reduce time to first project",
      "Provide a measurable activation funnel",
    ],
    reward: "Fast-track interview",
    deadline: 4_102_444_800_000,
  });
  await t.mutation(api.challenges.publish, { startupId, challengeId });
  return challengeId;
}

describe("users", () => {
  test("creates, normalizes, lists, updates, and deletes an unused profile", async () => {
    const t = convexTest(schema, modules);
    const builderId = await createUser(t, " Ada ", "builder", "@Ada-L");

    const byHandle = await t.query(api.users.getByHandle, {
      githubHandle: "ADA-L",
    });
    expect(byHandle).toMatchObject({
      _id: builderId,
      name: "Ada",
      role: "builder",
      githubHandle: "ada-l",
    });

    const builders = await t.query(api.users.list, {
      paginationOpts,
      role: "builder",
    });
    expect(builders.page).toHaveLength(1);

    const updated = await t.mutation(api.users.update, {
      userId: builderId,
      bio: "Builds useful products quickly.",
      avatarUrl: "https://example.com/ada.png",
    });
    expect(updated.bio).toBe("Builds useful products quickly.");

    await expect(
      t.mutation(api.users.createOrGet, {
        name: "Fake startup",
        role: "startup",
        githubHandle: "ada-l",
      }),
    ).rejects.toThrow("different user role");

    await t.mutation(api.users.remove, { userId: builderId });
    expect(await t.query(api.users.get, { id: builderId })).toBeNull();
  });
});

describe("challenges", () => {
  test("enforces startup ownership and the draft-open-closed-archived lifecycle", async () => {
    const t = convexTest(schema, modules);
    const startupId = await createUser(t, "Acme", "startup", "acme");
    const otherStartupId = await createUser(
      t,
      "Other Co",
      "startup",
      "other-co",
    );
    const builderId = await createUser(t, "Builder", "builder", "builder");

    await expect(
      t.mutation(api.challenges.create, {
        startupId: builderId,
        title: "A valid challenge title",
        businessProblem:
          "This is a sufficiently detailed business problem for the boundary.",
        successCriteria: ["Ship a measurable result"],
      }),
    ).rejects.toThrow("requires a startup user");

    const challengeId = await t.mutation(api.challenges.create, {
      startupId,
      title: "Improve retention",
      businessProblem:
        "Customers stop using the product during the first seven days.",
      successCriteria: ["Increase week-one retention"],
    });
    expect(
      (await t.query(api.challenges.get, { challengeId }))?.status,
    ).toBe("draft");

    await expect(
      t.mutation(api.challenges.publish, {
        startupId: otherStartupId,
        challengeId,
      }),
    ).rejects.toThrow("does not own this challenge");

    await t.mutation(api.challenges.update, {
      startupId,
      challengeId,
      title: "Improve first-week retention",
    });
    await t.mutation(api.challenges.publish, { startupId, challengeId });

    await expect(
      t.mutation(api.challenges.update, {
        startupId,
        challengeId,
        title: "Changed after publication",
      }),
    ).rejects.toThrow("Only draft challenges can be edited");

    await t.mutation(api.challenges.close, { startupId, challengeId });
    const archived = await t.mutation(api.challenges.archive, {
      startupId,
      challengeId,
    });
    expect(archived.status).toBe("archived");

    const startupChallenges = await t.query(api.challenges.listByStartup, {
      startupId,
      status: "archived",
      paginationOpts,
    });
    expect(startupChallenges.page.map((challenge) => challenge._id)).toEqual([
      challengeId,
    ]);
  });

  test("hard-deletes drafts only", async () => {
    const t = convexTest(schema, modules);
    const startupId = await createUser(t, "Acme", "startup", "acme");
    const challengeId = await t.mutation(api.challenges.create, {
      startupId,
      title: "Temporary draft",
      businessProblem:
        "This temporary business problem exists only to verify draft deletion.",
      successCriteria: ["Confirm deletion behavior"],
    });

    await t.mutation(api.challenges.removeDraft, { startupId, challengeId });
    expect(await t.query(api.challenges.get, { challengeId })).toBeNull();
  });
});

describe("submissions", () => {
  test("accepts one public GitHub repository, supports edits, and preserves withdrawal history", async () => {
    const t = convexTest(schema, modules);
    const startupId = await createUser(t, "Acme", "startup", "acme");
    const builderId = await createUser(t, "Builder", "builder", "builder");
    const challengeId = await createOpenChallenge(t, startupId);

    await expect(
      t.mutation(api.submissions.submit, {
        challengeId,
        builderId,
        repositoryUrl: "https://gitlab.com/builder/private-project",
      }),
    ).rejects.toThrow("github.com");

    const submissionId = await t.mutation(api.submissions.submit, {
      challengeId,
      builderId,
      repositoryUrl: "https://www.github.com/builder/project.git",
      demoUrl: "https://demo.example.com",
      pitch: "A focused solution to the onboarding problem.",
    });
    expect(
      (await t.query(api.submissions.get, { submissionId }))?.repositoryUrl,
    ).toBe("https://github.com/builder/project");

    await expect(
      t.mutation(api.submissions.submit, {
        challengeId,
        builderId,
        repositoryUrl: "https://github.com/builder/second-attempt",
      }),
    ).rejects.toThrow("only once per challenge");

    const updated = await t.mutation(api.submissions.update, {
      submissionId,
      builderId,
      repositoryUrl: "https://github.com/builder/project-v2",
      demoUrl: null,
    });
    expect(updated.repositoryUrl).toBe("https://github.com/builder/project-v2");
    expect(updated.demoUrl).toBeUndefined();

    const badgesBeforeWithdrawal = await t.query(api.badges.listByUser, {
      userId: builderId,
      paginationOpts,
    });
    expect(badgesBeforeWithdrawal.page).toMatchObject([
      { type: "shipped", challengeId },
    ]);

    const withdrawn = await t.mutation(api.submissions.withdraw, {
      submissionId,
      builderId,
    });
    expect(withdrawn.status).toBe("withdrawn");
    expect(
      (await t.query(api.rankings.getForSubmission, { submissionId }))?.status,
    ).toBe("cancelled");

    const badgesAfterWithdrawal = await t.query(api.badges.listByUser, {
      userId: builderId,
      paginationOpts,
    });
    expect(badgesAfterWithdrawal.page).toHaveLength(0);

    await expect(
      t.mutation(api.submissions.submit, {
        challengeId,
        builderId,
        repositoryUrl: "https://github.com/builder/retry",
      }),
    ).rejects.toThrow("only once per challenge");
  });
});

describe("ranked evaluation handoff", () => {
  test("lets the evaluator persist bounded scores and exposes ranked results", async () => {
    const t = convexTest(schema, modules);
    const startupId = await createUser(t, "Acme", "startup", "acme");
    const firstBuilderId = await createUser(t, "Ada", "builder", "ada");
    const secondBuilderId = await createUser(t, "Lin", "builder", "lin");
    const challengeId = await createOpenChallenge(t, startupId);

    const firstSubmissionId = await t.mutation(api.submissions.submit, {
      challengeId,
      builderId: firstBuilderId,
      repositoryUrl: "https://github.com/ada/solution",
    });
    const secondSubmissionId = await t.mutation(api.submissions.submit, {
      challengeId,
      builderId: secondBuilderId,
      repositoryUrl: "https://github.com/lin/solution",
    });

    await t.mutation(internal.rankings.markStarted, {
      submissionId: firstSubmissionId,
    });
    await t.mutation(internal.rankings.complete, {
      submissionId: firstSubmissionId,
      fitScore: 78,
      qualityScore: 82,
      totalScore: 80,
      rankedReview: "Strong product fit with a clear activation funnel.",
    });
    await t.mutation(internal.rankings.complete, {
      submissionId: secondSubmissionId,
      fitScore: 92,
      qualityScore: 88,
      totalScore: 90,
      rankedReview: "Best overall fit and the clearest measurable outcome.",
    });

    const ranked = await t.query(api.rankings.listByChallenge, {
      challengeId,
      paginationOpts,
    });
    expect(ranked.page.map((evaluation) => evaluation.submissionId)).toEqual([
      secondSubmissionId,
      firstSubmissionId,
    ]);

    await expect(
      t.mutation(internal.rankings.complete, {
        submissionId: firstSubmissionId,
        fitScore: 101,
        qualityScore: 80,
        totalScore: 90,
        rankedReview: "Invalid score should be rejected.",
      }),
    ).rejects.toThrow("between 0 and 100");

    await expect(
      t.mutation(api.users.remove, { userId: firstBuilderId }),
    ).rejects.toThrow("cannot be deleted");
  });
});
