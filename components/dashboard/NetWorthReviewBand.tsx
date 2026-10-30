import Link from 'next/link';
import type { NetWorthSnapshot } from '@/lib/netWorthHistory';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Consecutive calendar months with at least one real snapshot, counting
 * back from the most recent one — real arithmetic on actual recorded
 * dates, same honesty rule as every other streak in this app. */
function computeMonthStreak(snapshots: NetWorthSnapshot[]): number {
  if (snapshots.length === 0) return 0;
  const months = new Set(snapshots.map(s => s.date.slice(0, 7))); // YYYY-MM
  const sorted = [...months].sort().reverse();
  let [y, m] = sorted[0].split('-').map(Number);
  let streak = 0;
  while (months.has(`${y}-${String(m).padStart(2, '0')}`)) {
    streak++;
    m--;
    if (m === 0) { m = 12; y--; }
  }
  return streak;
}

/**
 * Same "last / next due / streak" pattern as the score's MonthlyReviewBand,
 * for net worth specifically — the whole point of the holdings tracker is
 * a monthly habit, so it needs the same visible nudge on the dashboard the
 * score already gets, not just a page someone has to remember to visit.
 */
export function NetWorthReviewBand({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null; // getSnapshots() sorts oldest → newest
  const daysSince = latest ? Math.floor((Date.now() - new Date(latest.date).getTime()) / 86400000) : null;
  const nextDue = latest ? new Date(new Date(latest.date).getTime() + 28 * 86400000) : null;
  const due = daysSince == null || daysSince >= 28;
  const streak = computeMonthStreak(snapshots);

  return (
    <div className="rounded-2xl bg-gray-950 dark:bg-black p-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div>
            <p className="font-mono tabular-nums text-lg font-black">{latest ? fmtDate(latest.date) : '—'}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Last recorded</p>
          </div>
          <div>
            <p className={`font-mono tabular-nums text-lg font-black ${due ? 'text-amber-400' : ''}`}>
              {!latest ? 'Not started' : due ? 'Due now' : fmtDate(nextDue!.toISOString())}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">Next update due</p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-lg font-black">{streak}{streak > 0 ? '🔥' : ''}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{streak === 1 ? 'Month tracked' : 'Months tracked'}</p>
          </div>
        </div>

        <Link href="/assets" className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-gray-950 text-xs font-bold transition-colors whitespace-nowrap">
          {latest ? 'Update my holdings →' : 'Add your first holding →'}
        </Link>
      </div>
    </div>
  );
}
