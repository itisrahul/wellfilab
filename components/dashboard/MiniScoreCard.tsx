import dynamic from 'next/dynamic';
import { scoreColor, scoreLabel } from '@/lib/wellfilab-score';

const MiniTrendLine = dynamic(() => import('./MiniTrendLine').then(m => m.MiniTrendLine), { ssr: false });

/** One of the 4 dimension cards (Body/Mind/Wealth/Life) in the dashboard's
 * top score row — the same real per-dimension numbers the algorithm
 * returns (score.body/mind/wealth/life), not a derived or invented split. */
export function MiniScoreCard({ label, icon, score, delta, series }: {
  label: string; icon: React.ReactNode; score: number; delta?: number; series: number[];
}) {
  const color = scoreColor(score);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color, backgroundColor: `${color}1a` }}>{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label} Score</p>
      </div>
      <div className="flex items-end gap-1.5 mb-0.5">
        <span className="font-mono tabular-nums text-2xl font-black text-gray-900 dark:text-white">{Math.round(score)}</span>
        <span className="text-gray-400 text-xs mb-0.5">/100</span>
      </div>
      <p className="text-[11px] font-semibold mb-1" style={{ color }}>{scoreLabel(score)}</p>
      {delta != null && (
        <p className={`text-[10px] font-semibold mb-1 ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {delta !== 0 ? Math.abs(delta) : 'No change'}{delta !== 0 ? ' vs last check-in' : ''}
        </p>
      )}
      {series.length > 1 && <div className="-mx-2 -mb-2"><MiniTrendLine data={series} color={color} /></div>}
    </div>
  );
}
