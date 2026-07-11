/** Animated SVG circular progress ring, shared by /life-roi and the dashboard score section. */
export function ScoreRing({ pct, color, size = 120, thick = 10 }: { pct: number; color: string; size?: number; thick?: number }) {
  const r = (size - thick) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={thick} className="text-gray-100 dark:text-gray-800" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thick} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (Math.max(0, Math.min(100, pct)) / 100) * c}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}
