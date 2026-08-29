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
  return useQuery(
    api.submissions.byBuilder,
    userId ? { builderId: userId } : "skip",
  );
}

/**
 * Retos to recommend. Called without the `status` filter arg — the committed
 * generated types don't yet accept it (Convex owner regenerates at integration);
 * we filter to open client-side in ./model.ts.
 */
export function useOpenChallenges() {
  return useQuery(api.challenges.list, {});
}
