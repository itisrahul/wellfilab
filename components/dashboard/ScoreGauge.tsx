import { scoreColor, scoreLabel } from '@/lib/wellfilab-score';

/**
 * Circular score gauge — real 0-100 scale (same as every other score
 * display in the app: /score, the dashboard header, history). A design
 * reference for this dashboard used a 3-digit gauge (e.g. "768") styled
 * like a credit score, but WellFiLab has never used that scale anywhere —
 * introducing a second, incompatible number for the same score would just
 * be confusing, not more premium.
 */
export function ScoreGauge({ score, size = 96, strokeWidth = 8, showLabel = true }: {
  score: number; size?: number; strokeWidth?: number; showLabel?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const color = scoreColor(score);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono tabular-nums font-black" style={{ color, fontSize: size * 0.3 }}>{Math.round(score)}</span>
        {showLabel && <span className="text-[10px] font-bold uppercase tracking-wide text-white/50">{scoreLabel(score)}</span>}
      </div>
    </div>
  );
}
