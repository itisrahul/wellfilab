import Link from 'next/link';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { scoreLabel, scoreColor, trendArrow, type ScoreSnapshotLike, type LifeROIHistoryEntry } from '@/lib/dashboardData';

interface Props {
  scoreHistory: ScoreSnapshotLike[];
  lifeRoiHistory: LifeROIHistoryEntry[];
}

const TREND_ICON: Record<'up' | 'down' | 'same', string> = { up: '↑', down: '↓', same: '→' };
const TREND_COLOR: Record<'up' | 'down' | 'same', string> = {
  up: 'text-green-500', down: 'text-red-500', same: 'text-gray-400',
};

function ScoreCard({ title, value, trend, retakeHref, retakeLabel }: {
  title: string; value: number | undefined; trend: 'up' | 'down' | 'same' | null;
  retakeHref: string; retakeLabel: string;
}) {
  if (value == null) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center">
        <div className="w-[120px] h-[120px] rounded-full border-[10px] border-gray-100 dark:border-gray-800 flex items-center justify-center mb-3">
          <span className="text-3xl text-gray-300 dark:text-gray-700">—</span>
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-3">Not taken yet</p>
        <Link href={retakeHref} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
          {retakeLabel} →
        </Link>
      </div>
    );
  }

  const color = scoreColor(value);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center">
      <div className="relative mb-3">
        <ScoreRing pct={value} color={color} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900 dark:text-white">{value}</span>
          <span className="text-[10px] text-gray-400">/100</span>
        </div>
      </div>
      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
      <div className="flex items-center gap-1.5 mt-0.5 mb-3">
        <span className="text-xs font-semibold" style={{ color }}>{scoreLabel(value)}</span>
        {trend && (
          <span className={`text-xs font-bold ${TREND_COLOR[trend]}`}>{TREND_ICON[trend]}</span>
        )}
      </div>
      <Link href={retakeHref} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
        Retake →
      </Link>
    </div>
  );
}

export function ScoreRingsSection({ scoreHistory, lifeRoiHistory }: Props) {
  const latestScore = scoreHistory[scoreHistory.length - 1];
  const prevScore   = scoreHistory[scoreHistory.length - 2];
  const latestRoi   = lifeRoiHistory[0];
  const prevRoi     = lifeRoiHistory[1];

  return (
    <section className="grid sm:grid-cols-3 gap-4">
      <ScoreCard title="Health-Wealth Score" value={latestScore?.overall}
        trend={trendArrow(latestScore?.overall, prevScore?.overall)}
        retakeHref="/score" retakeLabel="Take the Score quiz" />
      <ScoreCard title="Life ROI Score" value={latestRoi?.lifeROIScore}
        trend={trendArrow(latestRoi?.lifeROIScore, prevRoi?.lifeROIScore)}
        retakeHref="/life-roi" retakeLabel="Take the Life ROI quiz" />
      <ScoreCard title="Finance Score" value={latestRoi?.financeScore}
        trend={trendArrow(latestRoi?.financeScore, prevRoi?.financeScore)}
        retakeHref="/life-roi" retakeLabel="Take the Life ROI quiz" />
    </section>
  );
}
