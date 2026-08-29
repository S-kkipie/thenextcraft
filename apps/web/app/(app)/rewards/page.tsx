import type { Metadata } from "next";
import { RewardsView } from "@/features/rewards/components/rewards-view";

export const metadata: Metadata = {
  title: "Recompensas · The Next Ship",
};

// RSC shell: delega en el feature (client), que lee racha/nivel/XP del usuario
// actual y sus badges reactivamente vía Convex.
export default function RewardsPage() {
  return <RewardsView />;
}
