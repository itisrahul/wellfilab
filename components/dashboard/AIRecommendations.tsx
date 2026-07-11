import Link from 'next/link';
import type { LifeROIHistoryEntry } from '@/lib/dashboardData';

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  Medium:   'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
};

export function AIRecommendations({ lifeRoiHistory }: { lifeRoiHistory: LifeROIHistoryEntry[] }) {
  const latest = lifeRoiHistory[0];
  const actions = latest?.topActions.slice(0, 3) ?? [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">🤖 AI Recommendations</p>
      <p className="text-xs text-gray-400 mb-4">Personalised from your own numbers</p>

      {actions.length === 0 ? (
        <Link href="/life-roi"
          className="flex flex-col items-center text-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-teal-400 transition-colors">
          <span className="text-2xl">🎯</span>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Take the Life ROI Quiz to get personalised recommendations →
          </p>
        </Link>
      ) : (
        <div className="space-y-3">
          {actions.map((a, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[a.priority] ?? PRIORITY_COLOR.Medium}`}>{a.priority}</span>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{a.title}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 mb-2">{a.description}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                {a.financialImpact != null && <span>💰 Save ₹{a.financialImpact.toLocaleString('en-IN')}/yr</span>}
                {a.timeToResult && <span>⏱ {a.timeToResult}</span>}
              </div>
              {a.healthImpact && <p className="text-[11px] text-gray-400 mb-2">❤️ {a.healthImpact}</p>}
              {a.toolLink && (
                <Link href={a.toolLink.url} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
                  Try {a.toolLink.label} →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
