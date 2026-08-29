import type { Metadata } from "next";
import { CommunityFeed } from "@/features/community/components/community-feed";

export const metadata: Metadata = {
  title: "Comunidad · The Next Ship",
};

export default function CommunityPage() {
  return <CommunityFeed />;
}
