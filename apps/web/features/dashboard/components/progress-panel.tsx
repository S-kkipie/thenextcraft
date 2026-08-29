import { ProgressCluster, StatTile } from "@/components/craft";
import type { DashboardStats, ProgressView } from "../schema";

/** Raised card: level ring + XP + streak, and the SHIPPED/APPROVED/AVG-JUDGE tiles. */
export function ProgressPanel({
  progress,
  stats,
}: {
  progress: ProgressView;
  stats: DashboardStats;
}) {
  return (
    <div className="card card-raised">
      <div className="flex flex-wrap items-center gap-7">
        <ProgressCluster
          level={progress.level}
          progress={progress.progress}
          streak={progress.streak}
          xp={{ value: progress.xpValue, max: progress.xpMax }}
        />
        <div className="grid min-w-[260px] flex-1 grid-cols-3 gap-4">
          <StatTile value={stats.shipped} label="SHIPPED" />
          <StatTile value={stats.approved} label="APPROVED" accent="sage" />
          <StatTile
            value={stats.avgJudge ?? "—"}
            label="AVG JUDGE"
            accent="sand"
          />
        </div>
      </div>
    </div>
  );
}
