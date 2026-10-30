import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

interface TrendPoint { date: string; value: number }

function fmtCompact(n: number, unit: string): string {
  if (unit.startsWith('₹')) {
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (Math.abs(n) >= 1000) return `₹${Math.round(n / 1000)}K`;
    return `₹${Math.round(n)}`;
  }
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${Math.round(n * 10) / 10}`;
}

/**
 * A real line-over-area chart of a goal's (or net worth's) own recorded
 * history (never interpolated — real points only), with an optional target
 * reference line so "how far to go" reads visually, not just as a
 * percentage bar. Used for both a single goal's history and the broader
 * net-worth snapshot history (no target there unless a net-worth goal
 * exists), so `target` is optional.
 */
export function GoalTrendChart({ history, target, unit, color = '#0d9488', emptyLabel = 'Update this a couple more times to see a real trend here.' }: {
  history: TrendPoint[]; target?: number; unit: string; color?: string; emptyLabel?: string;
}) {
  const points = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: h.value,
  }));

  if (points.length < 2) {
    return (
      <div className="h-[140px] flex flex-col items-center justify-center text-center">
        <p className="text-xs text-gray-400">{emptyLabel}</p>
      </div>
    );
  }

  const values = target != null ? [...points.map(p => p.value), target] : points.map(p => p.value);
  const min = Math.min(...values), max = Math.max(...values);
  const pad = Math.max((max - min) * 0.15, max * 0.02, 1);

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`goalFill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis domain={[min - pad, max + pad]} tick={{ fontSize: 10 }} width={42}
          tickFormatter={v => fmtCompact(v, unit)} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 11 }}
          formatter={(v: number) => [fmtCompact(v, unit), 'Value']} />
        {target != null && (
          <ReferenceLine y={target} stroke={color} strokeDasharray="4 3" strokeOpacity={0.6}
            label={{ value: 'Target', position: 'insideTopRight', fontSize: 9, fill: color }} />
        )}
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          fill={`url(#goalFill-${color.replace('#', '')})`} dot={{ r: 2.5, fill: color }} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
