import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { ChartPoint } from '@/lib/dashboardData';

export function ScoreHistoryChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center h-full flex flex-col items-center justify-center">
        <p className="text-3xl mb-3">📈</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No score history yet</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Take the Health-Wealth Score or Life ROI quiz to start tracking your trend over time.</p>
        <div className="flex gap-2">
          <Link href="/score" className="text-xs font-bold px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors">
            Take the Score quiz
          </Link>
          <Link href="/life-roi" className="text-xs font-bold px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400 transition-colors">
            Take the Life ROI quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Score history</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="healthWealth" name="Health-Wealth" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="lifeROI"      name="Life ROI"      stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="finance"      name="Finance"       stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
