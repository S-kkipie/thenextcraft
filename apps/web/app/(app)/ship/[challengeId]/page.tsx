import type { Id } from "@thenextcraft/backend/dataModel";
import { ShipView } from "@/features/submission/components/ship-view";

// Next 16: `params` es una Promise (se await en el RSC). La ruta solo resuelve
// el id del reto y delega la UI reactiva al feature.
export default async function ShipPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  return <ShipView challengeId={challengeId as Id<"challenges">} />;
}
