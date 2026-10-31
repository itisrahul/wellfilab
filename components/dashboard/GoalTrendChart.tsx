import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { formatCurrencyAmount, convertFromINR } from '@/lib/currency';
import { useCurrency } from '@/lib/useCurrency';

interface TrendPoint { date: string; value: number }

// n arrives already converted to the display currency (the component
// converts history/target once, up front) — this just applies the right
// notation (Lakh/Crore for INR, K/M/B elsewhere) without converting again.
function fmtCompact(n: number, unit: string): string {
  if (unit.startsWith('₹')) return formatCurrencyAmount(n, 1);
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
  useCurrency(); // re-render (and re-convert) when the global currency changes
  const isMoney = unit.startsWith('₹');
  // history/target always arrive as real INR numbers — converted here, once,
  // to the selected display currency so the axis, tooltip, and reference
  // line all agree instead of just relabeling the symbol on an INR value.
  const points = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: isMoney ? convertFromINR(h.value) : h.value,
  }));
  const convertedTarget = target != null && isMoney ? convertFromINR(target) : target;

  if (points.length < 2) {
    // A one-line message never needs the full chart height — real data
    // shows a real 140px chart below; this is just "nothing to plot yet."
    return (
      <div className="h-11 flex items-center justify-center text-center">
        <p className="text-xs text-gray-400">{emptyLabel}</p>
      </div>
    );
  }

  const values = convertedTarget != null ? [...points.map(p => p.value), convertedTarget] : points.map(p => p.value);
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
        {convertedTarget != null && (
          <ReferenceLine y={convertedTarget} stroke={color} strokeDasharray="4 3" strokeOpacity={0.6}
            label={{ value: 'Target', position: 'insideTopRight', fontSize: 9, fill: color }} />
        )}
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          fill={`url(#goalFill-${color.replace('#', '')})`} dot={{ r: 2.5, fill: color }} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
