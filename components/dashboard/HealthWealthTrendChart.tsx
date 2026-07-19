import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { WellFiScore } from '@/lib/wellfilab-score';

/** Dual-line real trend — health (avg of body+mind) vs wealth, over your
 * actual saved score history. Same data source as the single-line
 * ScoreHistoryChart, just split into the two halves shown side by side
 * above it. */
export function HealthWealthTrendChart({ history, limit = 10 }: { history: WellFiScore[]; limit?: number }) {
  const points = history
    .filter(h => h.date)
    .slice()
    .reverse()
    .slice(-limit)
    .map(h => ({
      date: new Date(h.date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      health: Math.round((h.body + h.mind) / 2),
      wealth: h.wealth,
    }));

  if (points.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <p className="text-3xl mb-3">📈</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Not enough history yet</p>
        <p className="text-xs text-gray-400 max-w-xs">Retake your score a few times to see a real trend here.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={points} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="health" name="Health" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="wealth" name="Wealth" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
