import type { Metadata } from "next";
import { SkillMap } from "@/features/skills/components/skill-map";

export const metadata: Metadata = {
  title: "Skill Map · The Next Ship",
};

export default function SkillsPage() {
  return <SkillMap />;
}
