import type { Metadata } from "next";
import { BuilderDashboard } from "@/features/dashboard/components/builder-dashboard";

export const metadata: Metadata = {
  title: "Home · The Next Ship",
};

export default function HomePage() {
  return <BuilderDashboard />;
}
