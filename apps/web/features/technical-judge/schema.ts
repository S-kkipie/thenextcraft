import { z } from "zod";

export const repositoryUrlInput = z.object({
  repoUrl: z
    .string()
    .trim()
    .min(1, "Pega la URL de un repositorio público.")
    .refine((value) => {
      try {
        const url = new URL(value);
        const segments = url.pathname.split("/").filter(Boolean);
        return (
          url.protocol === "https:" &&
          url.hostname.toLowerCase() === "github.com" &&
          !url.port &&
          !url.username &&
          !url.password &&
          !url.search &&
          !url.hash &&
          segments.length === 2 &&
          /^[A-Za-z0-9_.-]+$/.test(segments[0]) &&
          /^[A-Za-z0-9_.-]+(?:\.git)?$/.test(segments[1])
        );
      } catch {
        return false;
      }
    }, "Usa el formato https://github.com/owner/repo, sin archivos ni branches."),
});

export type RepositoryUrlInput = z.infer<typeof repositoryUrlInput>;

export const reviewStages = [
  "queued",
  "validating_repository",
  "reading_repository",
  "selecting_files",
  "reviewing_code",
  "finalizing",
] as const;

export type ReviewStage = (typeof reviewStages)[number];
