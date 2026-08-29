import { Suspense } from "react";

import { ChallengeList } from "@/features/challenge/components/challenge-list";

// Los filtros de esta vista viven en la query string, y useSearchParams obliga
// a un límite de Suspense para que la página siga prerenderizándose estática.
export default function ChallengesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChallengeList />
    </Suspense>
  );
}

/* El bailout de useSearchParams deja la página vacía durante el prerender: sin
   un fallback real se ve un parpadeo en blanco antes de hidratar. */
function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-[var(--panel-2)]" />
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--panel-2)]" />
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-[10px] bg-[var(--panel-2)]"
          />
        ))}
      </div>
      <div className="h-64 w-full animate-pulse rounded-[16px] bg-[var(--panel-2)]" />
    </div>
  );
}
