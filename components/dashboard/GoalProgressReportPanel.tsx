import { fmtVal } from '@/lib/goalDisplay';
import { useCurrency } from '@/lib/useCurrency';
import type { buildGoalProgressReport } from '@/lib/goalProgressReport';

const REPORT_STATUS_STYLE: Record<string, { label: string; color: string }> = {
  ahead:      { label: 'Ahead of pace',   color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  'on-track': { label: 'On track',        color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' },
  behind:     { label: 'Behind pace',     color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
  'no-target':        { label: 'No target date', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  'not-enough-data':  { label: 'Not enough data', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

/** The "days elapsed / days remaining / real pace / pace needed" breakdown
 * shared by the goal card grid and a single goal's full-page view. */
export function GoalProgressReportPanel({ report, meta, bordered = true }: {
  report: ReturnType<typeof buildGoalProgressReport>;
  meta: { unit: string };
  bordered?: boolean;
}) {
  useCurrency(); // re-render when the global currency changes
  const statusStyle = REPORT_STATUS_STYLE[report.status];

  return (
    <div className={bordered ? 'mt-4 pt-4 border-t border-gray-100 dark:border-gray-800' : ''}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Advanced progress report</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.color}`}>{statusStyle.label}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Days elapsed</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">{report.daysElapsed}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Days remaining</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">{report.daysRemaining ?? '—'}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Your real pace</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">
            {report.actualMonthlyPace != null ? `${fmtVal(report.actualMonthlyPace, meta.unit)}/mo` : '—'}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Pace needed</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">
            {report.requiredMonthlyPace != null ? `${fmtVal(report.requiredMonthlyPace, meta.unit)}/mo` : '—'}
          </p>
        </div>
      </div>

      {report.monthlyBreakdown.length > 1 && (
        <div className="mb-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Monthly breakdown — real recorded updates</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {report.monthlyBreakdown.slice(-6).map((m, i) => (
              <div key={i} className="flex-shrink-0 min-w-[64px] p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-[9px] text-gray-400">{m.monthLabel}</p>
                <p className="font-mono tabular-nums text-xs font-bold text-gray-900 dark:text-white">{fmtVal(m.value, meta.unit)}</p>
                {m.change != null && (
                  <p className={`font-mono tabular-nums text-[9px] font-bold ${m.change > 0 ? 'text-emerald-600 dark:text-emerald-400' : m.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {m.change > 0 ? '+' : ''}{fmtVal(m.change, meta.unit)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
