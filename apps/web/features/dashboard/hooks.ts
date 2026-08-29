import { useQuery } from "convex/react";
import { api } from "@thenextcraft/backend/api";
import type { Id } from "@thenextcraft/backend/dataModel";

/**
 * Thin Convex wrappers for the builder dashboard (AGENTS §4).
 *
 * `api.submissions.byBuilder` and the enriched shape of `api.challenges.list`
 * are peer-owned and reconciled at integration — we only read them here, then
 * normalize in ./model.ts so the UI is resilient to their exact return shape.
 */

/** Every submission by the current builder (joined to its reto). `skip` when logged out. */
export function useBuilderSubmissions(userId: Id<"users"> | null) {
  const result = useQuery(
    api.submissions.listByBuilder,
    userId
      ? { builderId: userId, paginationOpts: { numItems: 100, cursor: null } }
      : "skip",
  );
  return result?.page;
}

/**
 * Retos to recommend. Called without the `status` filter arg — the committed
 * generated types don't yet accept it (Convex owner regenerates at integration);
 * we filter to open client-side in ./model.ts.
 */
export function useOpenChallenges() {
  const result = useQuery(api.challenges.list, {
    status: "open",
    paginationOpts: { numItems: 100, cursor: null },
  });
  return result?.page;
}
