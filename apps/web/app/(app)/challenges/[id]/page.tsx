import type { Id } from "@thenextcraft/backend/dataModel";
import { ChallengeDetailView } from "@/features/challenge/components/challenge-detail";

// Next 16: `params` es una Promise. La página (server) la desenvuelve y pasa el
// id al componente cliente que hace el useQuery reactivo.
export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChallengeDetailView id={id as Id<"challenges">} />;
}
