'use client';

import type { ScoreSnapshot } from './trendTracking';

interface Props {
  history: ScoreSnapshot[];
}

/**
 * Renders overall/health/wealth as three lines over the stored history.
 * Pure SVG, no chart library — consistent with how the rest of the Score
 * app avoids extra client-side dependencies for things this simple.
 */
export function TrendChart({ history }: Props) {
  if (history.length < 2) return null;

  const W = 600, H = 200, PAD_X = 28, PAD_Y = 24;
  const n = history.length;
  const stepX = (W - PAD_X * 2) / (n - 1);
  const toY = (v: number) => H - PAD_Y - (v / 100) * (H - PAD_Y * 2);

  const series: { name: string; color: string; key: 'overall' | 'health' | 'wealth' }[] = [
    { name: 'Overall', color: '#5eead4', key: 'overall' },
    { name: 'Health',  color: '#34d399', key: 'health' },
    { name: 'Wealth',  color: '#fbbf24', key: 'wealth' },
  ];

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map((f, fi) => (
          <line key={fi}
            x1={PAD_X} x2={W - PAD_X}
            y1={PAD_Y + f * (H - PAD_Y * 2)} y2={PAD_Y + f * (H - PAD_Y * 2)}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}

        {series.map(s => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            points={history.map((h, i) => `${PAD_X + i * stepX},${toY(h[s.key])}`).join(' ')}
          />
        ))}
        {series.map(s => history.map((h, i) => (
          <circle key={`${s.key}-${i}`} cx={PAD_X + i * stepX} cy={toY(h[s.key])} r={3} fill={s.color} />
        )))}

        <text x={PAD_X} y={H - 4} fontSize={10} fill="#475569">{dateLabel(history[0].date)}</text>
        <text x={W - PAD_X} y={H - 4} fontSize={10} fill="#475569" textAnchor="end">{dateLabel(history[n - 1].date)}</text>
      </svg>
      <div className="flex gap-4 mt-3 justify-center">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
