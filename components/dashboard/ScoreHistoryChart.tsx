import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { WellFiScore } from '@/lib/wellfilab-score';

export function ScoreHistoryChart({ history }: { history: WellFiScore[] }) {
  const points = history
    .filter(h => h.date)
    .slice()
    .reverse() // stored newest-first — chart wants oldest → newest
    .slice(-10)
    .map(h => ({
      date: new Date(h.date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: h.overall,
    }));

  if (points.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center h-full flex flex-col items-center justify-center">
        <p className="text-3xl mb-3">📈</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No score history yet</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Take the WellFiLab Score to start tracking your trend over time.</p>
        <Link href="/score" className="text-xs font-bold px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors">
          Take the Score
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Score history</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={points} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
          <Line type="monotone" dataKey="score" name="WellFiLab Score" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
