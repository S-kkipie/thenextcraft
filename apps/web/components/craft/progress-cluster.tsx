import { LevelRing } from "./level-ring";
import { XpBar } from "./xp-bar";
import { StreakPill } from "./streak-pill";
import { cn } from "@/lib/utils";

/** Level ring + XP bar + streak — the engagement cluster (over real signals). */
export function ProgressCluster({
  level,
  progress,
  streak,
  xp,
  className,
}: {
  level: number;
  progress: number;
  streak: number;
  xp: { value: number; max: number };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <LevelRing level={level} progress={progress} />
      <div className="flex-1">
        <div className="text-faint mb-1.5 flex justify-between data text-xs tabular-nums">
          <span>{xp.value} XP</span>
          <span>{xp.max}</span>
        </div>
        <XpBar value={xp.value} max={xp.max} />
        <div className="mt-2">
          <StreakPill days={streak} />
        </div>
      </div>
    </div>
  );
}
