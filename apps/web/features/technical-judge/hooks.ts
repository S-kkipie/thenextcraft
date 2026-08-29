"use client";

import { useMutation, useQuery } from "convex/react";
import type { Id } from "@thenextcraft/backend/dataModel";
import { api } from "@thenextcraft/backend/api";

export function useStartTechnicalReview() {
  return useMutation(api.technicalJudge.start);
}

export function useTechnicalReview(
  reviewId: Id<"technicalReviews"> | null,
) {
  return useQuery(
    api.technicalJudge.get,
    reviewId ? { reviewId } : "skip",
  );
}
