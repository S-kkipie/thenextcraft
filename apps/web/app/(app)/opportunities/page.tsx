import type { Metadata } from "next";
import { OpportunitiesList } from "@/features/opportunities/components/opportunities-list";

export const metadata: Metadata = {
  title: "Oportunidades · The Next Ship",
};

export default function OpportunitiesPage() {
  return <OpportunitiesList />;
}
