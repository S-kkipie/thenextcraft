"use client";

import { use } from "react";
import type { Id } from "@thenextcraft/backend/dataModel";

import { ShortlistView } from "@/features/shortlist/components/shortlist-view";

export default function ShortlistPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = use(params);
  return <ShortlistView challengeId={challengeId as Id<"challenges">} />;
}
