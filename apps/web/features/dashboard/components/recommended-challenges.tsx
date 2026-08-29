import { ChallengeCard } from "@/components/craft";
import { SectionTitle } from "./section-title";
import type { ChallengeCardData } from "../schema";

/** "Retos para ti" — grid of open retos to participate in. */
export function RecommendedChallenges({ items }: { items: ChallengeCardData[] }) {
  if (items.length === 0) {
    return (
      <section>
        <SectionTitle>Retos para ti</SectionTitle>
        <div className="card text-[13px] text-muted-foreground">
          No hay retos abiertos ahora mismo. Vuelve pronto.
        </div>
      </section>
    );
  }
  return (
    <section>
      <SectionTitle>Retos para ti</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <ChallengeCard
            key={c.id}
            title={c.title}
            company={c.company}
            sector={c.sector}
            initials={c.initials}
            problem={c.problem}
            reward={c.reward}
            tech={c.tech}
            participants={c.participants}
            days={c.days}
            href={c.href}
          />
        ))}
      </div>
    </section>
  );
}
