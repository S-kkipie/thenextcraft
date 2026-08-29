import type { Id } from "@thenextcraft/backend/dataModel";
import { EvaluationDetail } from "@/features/evaluation/components/evaluation-detail";

// Next 16: `params` es una Promise → hay que await-earla.
export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EvaluationDetail submissionId={id as Id<"submissions">} />;
}
