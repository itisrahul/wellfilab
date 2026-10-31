'use client';
import Link from 'next/link';
import useSWR from 'swr';
import { getHoldings, syncNetWorthGoalFromHoldings } from '@/lib/holdingsStorage';
import { getGoals, type Goal } from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus } from '@/lib/goalPace';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { AssetTrackerPanel } from '@/components/dashboard/AssetTrackerPanel';
import { fmtMoney } from '@/lib/currency';
import { useCurrency } from '@/lib/useCurrency';
import { progressPct } from '@/lib/goalDisplay';
import { SWR_KEYS } from '@/lib/swrKeys';

/**
 * A full-page view of the same real-holdings tracker embedded directly
 * under the net-worth goal card on /goals (components/dashboard/
 * AssetTrackerPanel.tsx) — that's the primary place people land on this,
 * reached via "Track this by actual holding" on the net-worth goal. This
 * page exists for anyone who wants the spacious view, or follows an old
 * bookmark/link — same data, same component, not a second implementation.
 */
export default function AssetsPage() {
  useCurrency(); // re-render this page when the global currency changes
  const { data: holdings } = useSWR(SWR_KEYS.holdings, getHoldings);
  const { data: goals } = useSWR(SWR_KEYS.goals, getGoals);

  const rawNetWorthGoal = (goals ?? []).find(g => g.type === 'net-worth');
  const netWorthGoal = rawNetWorthGoal ? syncNetWorthGoalFromHoldings(rawNetWorthGoal, holdings ?? []) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0F2A27]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-lg font-extrabold text-white">Your Net Worth, Broken Down</h1>
          <p className="text-xs text-white/50 mt-0.5">Real holdings, real monthly contributions — by category, not one lump number.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <Link href="/goals" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">← Your goals</Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <Link href="/dashboard" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">See it on your dashboard →</Link>
        </div>

        {netWorthGoal ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Path to your net worth goal — target {fmtMoney(netWorthGoal.target)}
            </p>
            <NetWorthGoalProgress goal={netWorthGoal} current={netWorthGoal.current} />
            <GoalPathCalculator target={netWorthGoal.target} current={netWorthGoal.current} targetDate={netWorthGoal.targetDate} />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <span className="text-lg flex-shrink-0">🎯</span>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex-1">No net worth target set yet — <Link href="/goals" className="underline">set one</Link> to see a real path to it, calculated from what you're adding each month.</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <AssetTrackerPanel />
        </div>
      </div>
    </div>
  );
}

function NetWorthGoalProgress({ goal, current }: { goal: Goal; current: number }) {
  const eta = estimateGoalETA(goal);
  const pace = getGoalPaceStatus(goal);
  const pct = progressPct(goal);
  return (
    <div className="mb-4">
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-gray-700 dark:text-gray-300">{Math.round(pct)}% there — {fmtMoney(current)} of {fmtMoney(goal.target)}</span>
        <div className="flex items-center gap-2">
          {pace && <span className={`font-bold px-2 py-0.5 rounded-full ${pace === 'ahead' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : pace === 'behind' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{pace === 'ahead' ? 'Ahead' : pace === 'behind' ? 'Behind' : 'On track'}</span>}
          {eta && <span className="text-gray-400">{eta}</span>}
        </div>
      </div>
    </div>
  );
}
