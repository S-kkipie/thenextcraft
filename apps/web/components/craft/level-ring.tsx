import { cn } from "@/lib/utils";

/** Circular level ring. progress in 0..1. */
export function LevelRing({
  level,
  progress,
  size = 60,
  className,
}: {
  level: number;
  progress: number;
  size?: number;
  className?: string;
}) {
  const r = 25;
  const circ = 2 * Math.PI * r; // ~157
  const offset = circ * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div
      className={cn("relative flex-none", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        className="-rotate-90"
      >
        <circle cx="30" cy="30" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          stroke="var(--sand)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="font-display absolute inset-0 grid place-items-center text-[15px] font-black leading-none">
        {level}
        <span className="text-faint text-[8px] font-extrabold">NIVEL</span>
      </div>
    </div>
  );
}
