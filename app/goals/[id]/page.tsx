'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  getGoals, updateGoalProgress, toggleGoalPause, deleteGoal, getGoalHistory, GOAL_TYPE_META,
} from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus } from '@/lib/goalPace';
import { buildGoalProgressReport } from '@/lib/goalProgressReport';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { AssetTrackerPanel } from '@/components/dashboard/AssetTrackerPanel';
import { GoalProgressReportPanel } from '@/components/dashboard/GoalProgressReportPanel';
import { getSnapshots, syncNetWorthGoal } from '@/lib/netWorthHistory';
import { fmtVal, progressPct, isGoalComplete, PACE_LABEL, CATEGORY_CHART_COLOR } from '@/lib/goalDisplay';
import { SWR_KEYS } from '@/lib/swrKeys';

const ACCUMULATION_GOAL_TYPES = ['net-worth', 'emergency-fund', 'fire-corpus', 'home-down-payment', 'education-fund', 'vacation-fund'];

const GoalTrendChart = dynamic(
  () => import('@/components/dashboard/GoalTrendChart').then(m => m.GoalTrendChart),
  { ssr: false, loading: () => <div className="h-[220px] animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

/**
 * The full-page "deep dive" for a single goal — same real data as its card
 * on /goals, just given the room a compact grid can't: a bigger trend chart,
 * the advanced report always open (not behind a toggle), and for a
 * net-worth goal, the full (non-compact) holdings tracker. Reached from
 * "Full page →" on that goal's card, the same pattern as "Track by
 * holding →" already uses on the dashboard to send people to /assets.
 */
export default function GoalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: goals, isLoading, mutate: refresh } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: netWorthSnapshots } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(0);

  const rawGoal = (goals ?? []).find(g => g.id === id);
  const goal = rawGoal ? syncNetWorthGoal(rawGoal, netWorthSnapshots ?? []) : null;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Goal not found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">It may have been deleted.</p>
          <Link href="/goals" className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">← Back to your goals</Link>
        </div>
      </div>
    );
  }

  const meta = GOAL_TYPE_META[goal.type];
  const pct = progressPct(goal);
  const complete = isGoalComplete(goal);
  const paceStatus = getGoalPaceStatus(goal);
  const pace = paceStatus ? PACE_LABEL[paceStatus] : null;
  const eta = !complete ? estimateGoalETA(goal) : null;
  const report = buildGoalProgressReport(goal);

  const startEdit = () => { setVal(goal.current); setEditing(true); };
  const save = async () => { await updateGoalProgress(goal.id, val); refresh(); setEditing(false); };
  const pause = async () => { await toggleGoalPause(goal.id); refresh(); };
  const remove = async () => { if (confirm(`Delete "${goal.label}"?`)) { await deleteGoal(goal.id); window.location.href = '/goals'; } };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0F2A27]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/goals" className="text-xs font-bold text-teal-300 hover:underline">← Back to your goals</Link>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-3xl">{meta.icon}</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight">{goal.label}</h1>
              {goal.targetDate && <p className="text-sm text-white/50">Target date: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <span>{fmtVal(goal.current, meta.unit)}</span>
            <span>{fmtVal(goal.target, meta.unit)}</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all duration-700 ${complete ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{complete ? '🎉 Goal reached' : `${Math.round(pct)}% complete`}</p>
            <div className="flex items-center gap-2">
              {pace && !complete && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pace.tone === 'ahead' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : pace.tone === 'behind' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{pace.label}</span>
              )}
              {eta && <span className="text-xs text-gray-400">{eta}</span>}
            </div>
          </div>

          {!complete && report.status !== 'no-target' && report.status !== 'not-enough-data' && (
            <p className="text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2.5 mt-3 leading-relaxed">
              💡 {report.recommendation}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {goal.type === 'net-worth' ? (
              <span className="text-xs text-gray-400">Updates automatically from your holdings below</span>
            ) : editing ? (
              <div className="flex gap-2 flex-1">
                <input type="number" value={val} onChange={e => setVal(+e.target.value)} autoFocus
                  className="flex-1 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
                <button onClick={save} className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Save</button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500">Cancel</button>
              </div>
            ) : (
              <button onClick={startEdit} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Update progress</button>
            )}
            <button onClick={pause} className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">{goal.paused ? 'Resume' : 'Pause'}</button>
            <button onClick={remove} className="text-xs font-semibold text-gray-400 hover:text-red-500 ml-auto">Delete goal</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Real trend, from your own recorded updates</p>
          <GoalTrendChart history={getGoalHistory(goal)} target={goal.target} unit={meta.unit} color={CATEGORY_CHART_COLOR[meta.category]} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <GoalProgressReportPanel report={report} meta={meta} bordered={false} />
        </div>

        {ACCUMULATION_GOAL_TYPES.includes(goal.type) && !complete && (
          <GoalPathCalculator target={goal.target} current={goal.current} targetDate={goal.targetDate} />
        )}

        {goal.type === 'net-worth' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Real holdings behind this number</p>
            <AssetTrackerPanel />
          </div>
        )}
      </div>
    </div>
  );
}
