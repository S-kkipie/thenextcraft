/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import { normalizeCompany, toListingRow } from "./jobs";

const modules = import.meta.glob("./**/*.ts");

describe("normalizeCompany", () => {
  test("lowercases y recorta", () => {
    expect(normalizeCompany("  Acme Corp  ")).toBe("acme corp");
  });
  test("colapsa espacios internos", () => {
    expect(normalizeCompany("Acme   Corp")).toBe("acme corp");
  });
});

describe("toListingRow", () => {
  const base = { company: "acme", scrapedAt: 1000 };

  test("mapea campos canónicos", () => {
    const row = toListingRow(
      {
        title: "Senior Dev",
        companyName: "Acme",
        location: "Remote",
        jobUrl: "https://linkedin.com/jobs/view/123",
        id: "123",
        postedAt: "2026-08-01T00:00:00.000Z",
        descriptionText: "x".repeat(500),
      },
      base,
    );
    expect(row).toMatchObject({
      company: "acme",
      title: "Senior Dev",
      companyName: "Acme",
      location: "Remote",
      url: "https://linkedin.com/jobs/view/123",
      externalId: "123",
      source: "linkedin",
      scrapedAt: 1000,
    });
    expect(row?.postedAt).toBe(Date.parse("2026-08-01T00:00:00.000Z"));
    expect((row?.snippet ?? "").length).toBeLessThanOrEqual(280);
  });

  test("soporta aliases (link/jobId/description)", () => {
    const row = toListingRow(
      {
        title: "Dev",
        companyName: "Acme",
        link: "https://l/1",
        jobId: "9",
        description: "hola",
      },
      base,
    );
    expect(row?.url).toBe("https://l/1");
    expect(row?.externalId).toBe("9");
    expect(row?.snippet).toBe("hola");
  });

  test("deriva externalId de la url cuando no hay id", () => {
    const row = toListingRow(
      {
        title: "Dev",
        companyName: "Acme",
        jobUrl: "https://linkedin.com/jobs/view/777/",
      },
      base,
    );
    expect(row?.externalId).toBe("https://linkedin.com/jobs/view/777/");
  });

  test("null si falta title o url", () => {
    expect(
      toListingRow({ companyName: "Acme", jobUrl: "https://l/1" }, base),
    ).toBeNull();
    expect(toListingRow({ title: "Dev", companyName: "Acme" }, base)).toBeNull();
  });

  test("companyName cae a base.company si falta", () => {
    const row = toListingRow(
      { title: "Dev", jobUrl: "https://l/1", id: "1" },
      { company: "acme", scrapedAt: 5 },
    );
    expect(row?.companyName).toBe("acme");
  });
});

describe("saveListings + byCompany", () => {
  const rows = [
    {
      company: "acme",
      title: "A",
      companyName: "Acme",
      location: "Remote",
      url: "u1",
      externalId: "1",
      source: "linkedin" as const,
      scrapedAt: 1,
    },
    {
      company: "acme",
      title: "B",
      companyName: "Acme",
      location: "Remote",
      url: "u2",
      externalId: "2",
      source: "linkedin" as const,
      scrapedAt: 1,
    },
  ];

  test("inserta filas y byCompany las lee (normaliza la empresa)", async () => {
    const t = convexTest(schema, modules);
    const inserted = await t.mutation(internal.jobs.saveListings, { rows });
    expect(inserted).toBe(2);

    const list = await t.query(api.jobs.byCompany, { company: "Acme" });
    expect(list.length).toBe(2);
    expect(list.map((l) => l.title).sort()).toEqual(["A", "B"]);
  });

  test("dedupe por externalId: re-scrape actualiza, no duplica", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.jobs.saveListings, { rows });
    const insertedAgain = await t.mutation(internal.jobs.saveListings, {
      rows: [{ ...rows[0], title: "A (actualizado)", scrapedAt: 2 }],
    });
    expect(insertedAgain).toBe(0);

    const list = await t.query(api.jobs.byCompany, { company: "acme" });
    expect(list.length).toBe(2);
    const a = list.find((l) => l.externalId === "1");
    expect(a?.title).toBe("A (actualizado)");
  });
});
