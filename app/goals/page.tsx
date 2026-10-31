'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { ExternalLink, Pencil, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getGoals, addGoal, updateGoalProgress, updateGoalTarget, deleteGoal, getGoalHistory,
  getGoalsSyncError, GOAL_TYPE_META, type Goal, type GoalType,
} from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus } from '@/lib/goalPace';
import { getScoreHistory } from '@/lib/scoreStorage';
import type { WellFiScore } from '@/lib/wellfilab-score';
import { getScoreFocus, setScoreFocus, type ScoreFocus } from '@/lib/scoreFocus';
import { FocusSelector } from '@/components/dashboard/FocusSelector';
import { buildGoalProgressReport } from '@/lib/goalProgressReport';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { AssetTrackerPanel } from '@/components/dashboard/AssetTrackerPanel';
import { GoalProgressReportPanel } from '@/components/dashboard/GoalProgressReportPanel';
import { getHoldings, computeTotals, syncNetWorthGoalFromHoldings, deleteAllHoldings } from '@/lib/holdingsStorage';
import { fmtVal, progressPct, isGoalComplete, PACE_LABEL, CATEGORY_STYLE, CATEGORY_CHART_COLOR, ACCUMULATION_GOAL_TYPES } from '@/lib/goalDisplay';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCurrency } from '@/lib/useCurrency';
import { SWR_KEYS } from '@/lib/swrKeys';
import { FlowNav } from '@/components/ui/FlowNav';

// recharts is heavy — load it only on the client, same pattern the
// dashboard's trend chart already uses.
const GoalTrendChart = dynamic(
  () => import('@/components/dashboard/GoalTrendChart').then(m => m.GoalTrendChart),
  { ssr: false, loading: () => <div className="h-[140px] animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

export default function GoalsPage() {
  useCurrency(); // re-render when the global currency changes
  const { data: goals, isLoading: goalsLoading, mutate: refresh } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: holdingsForSync } = useSWR(SWR_KEYS.holdings, getHoldings);
  const { data: history } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const score = history?.[0] ?? null;
  const [showAdd, setShowAdd] = useState(false);
  const [prefill, setPrefill] = useState<{ type: GoalType; current: number; target?: number } | null>(null);
  const [focus, setFocus] = useState<ScoreFocus>('both');

  useEffect(() => {
    setFocus(getScoreFocus());
    // Deep link from a calculator's real result, e.g. /goals?prefill=net-worth&current=550000 —
    // read directly from the URL rather than useSearchParams, which would force this
    // otherwise-static page into a Suspense boundary just for this one optional feature.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('prefill') as GoalType | null;
      const current = params.get('current');
      const target = params.get('target');
      if (type && GOAL_TYPE_META[type] && current != null && !Number.isNaN(+current)) {
        setPrefill({ type, current: +current, target: target != null && !Number.isNaN(+target) ? +target : undefined });
        setShowAdd(true);
      }
    }
  }, []);

  const handleFocusChange = (f: ScoreFocus) => { setFocus(f); setScoreFocus(f); };

  const needsUpdate = (goals ?? []).some(g => Date.now() - new Date(g.lastUpdated).getTime() > 25 * 86400000);
  // Net-worth goals get their current/history overridden here from the real
  // holdings-derived monthly series (last recorded value each month) — so
  // the progress bar, pace, ETA, trend chart, and recommendation on this
  // card all reflect the latest actual month, not a stale typed-in number.
  const visibleGoals = (goals ?? [])
    .filter(g => focus === 'both' || GOAL_TYPE_META[g.type].category === focus || GOAL_TYPE_META[g.type].category === 'score')
    .map(g => syncNetWorthGoalFromHoldings(g, holdingsForSync ?? []));

  if (goalsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0F2A27]">
        <FlowNav current="goals" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-white/5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-2">Goal Tracking</p>
              <h1 className="text-3xl font-extrabold text-white mb-2">Your Goals</h1>
              <p className="text-sm text-white/50">Track progress toward what matters most — health and wealth, side by side.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all flex-shrink-0">
              + Add Goal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <Link href="/roadmap" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">← Back to your roadmap</Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <Link href="/dashboard" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">See progress on your dashboard →</Link>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-400">Show goals for:</p>
          <FocusSelector focus={focus} onChange={handleFocusChange} />
        </div>

        {needsUpdate && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <span className="text-lg flex-shrink-0">⏰</span>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex-1">It's been a while since you updated a goal — a quick monthly check-in keeps your progress accurate.</p>
          </div>
        )}

        {getGoalsSyncError() && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 flex-1">Couldn't sync your goals with your account — {getGoalsSyncError()}. Showing this device's local copy only until this clears.</p>
          </div>
        )}

        {showAdd && <AddGoalForm onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); refresh(); }} prefill={prefill} existing={goals ?? []} />}

        {visibleGoals.length === 0 && !showAdd ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-4xl mb-4">🎯</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{goals.length === 0 ? 'No goals yet' : `No ${focus} goals yet`}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {goals.length === 0 ? 'Set a target for your health or wealth and track it every month.' : `Switch focus above, or add a ${focus} goal below.`}
            </p>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
              Add your first goal →
            </button>
            <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-lg mx-auto opacity-40">
              {(['net-worth', 'sleep', 'wellfilab-score'] as GoalType[]).map(t => (
                <div key={t} className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                  <span className="text-2xl">{GOAL_TYPE_META[t].icon}</span>
                  <p className="text-xs font-semibold text-gray-500 mt-1">{GOAL_TYPE_META[t].label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {visibleGoals.map(g => <GoalCard key={g.id} goal={g} score={score} onChange={refresh} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalCard({ goal, score, onChange }: { goal: Goal; score: WellFiScore | null; onChange: () => void }) {
  const meta = GOAL_TYPE_META[goal.type];
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal.current);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetVal, setTargetVal] = useState(String(goal.target));
  const [targetDateVal, setTargetDateVal] = useState(goal.targetDate ? goal.targetDate.slice(0, 10) : '');
  const { confirmDialog, dialog } = useConfirmDialog();
  const pct = progressPct(goal);
  const complete = isGoalComplete(goal);
  const paceStatus = getGoalPaceStatus(goal);
  const pace = paceStatus ? PACE_LABEL[paceStatus] : null;
  const eta = !complete ? estimateGoalETA(goal) : null;
  // Computed unconditionally (cheap — pure arithmetic on the goal's own
  // history, no I/O) so the recommendation can be the headline, visible
  // by default, not something earned by clicking "Progress report" first.
  const report = buildGoalProgressReport(goal);

  const save = async () => {
    const willComplete = !complete && isGoalComplete({ ...goal, current: val });
    await updateGoalProgress(goal.id, val);
    onChange();
    setEditing(false);
    if (willComplete) { setJustCompleted(true); setTimeout(() => setJustCompleted(false), 4000); }
  };
  const remove = async () => {
    const isNetWorth = goal.type === 'net-worth';
    const msg = isNetWorth
      ? `Delete "${goal.label}"? This also deletes every holding you've tracked under it — all your assets and liabilities. This can't be undone.`
      : `Delete "${goal.label}"? This can't be undone.`;
    if (!(await confirmDialog(msg))) return;
    await deleteGoal(goal.id);
    if (isNetWorth) { await deleteAllHoldings(); mutate(SWR_KEYS.holdings); }
    onChange();
  };
  const saveTarget = async () => {
    if (targetVal === '' || Number.isNaN(+targetVal)) return;
    await updateGoalTarget(goal.id, +targetVal, targetDateVal || undefined);
    onChange();
    setEditingTarget(false);
  };

  const scoreInsight = score && meta.category === 'wealth' && score.trajectories
    ? score.trajectories.find(t => t.scenario === 'improved')
    : null;

  return (
    <div className={`rounded-2xl border p-5 ${CATEGORY_STYLE[meta.category]} bg-white dark:bg-gray-900`}>
      {dialog}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setCollapsed(c => !c)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <span className="text-2xl flex-shrink-0">{meta.icon}</span>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{goal.label}</p>
            {goal.targetDate && <p className="text-[11px] text-gray-400">Target: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
          <Link href={`/goals/${goal.id}`} title="Full page" className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"><ExternalLink size={15} /></Link>
          <button onClick={() => setEditingTarget(e => !e)} title="Edit target & date" className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"><Pencil size={15} /></button>
          <button onClick={remove} title="Delete goal" className="text-gray-300 hover:text-red-500"><X size={16} /></button>
        </div>
      </div>

      {editingTarget && (
        <div className="mb-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 grid sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">Target ({meta.unit || 'value'})</label>
            <input type="number" value={targetVal} onChange={e => setTargetVal(e.target.value)}
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">Target date</label>
            <input type="date" value={targetDateVal} onChange={e => setTargetDateVal(e.target.value)}
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button onClick={saveTarget} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Save</button>
            <button onClick={() => setEditingTarget(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {justCompleted && (
        <div className="mb-3 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold text-center animate-pulse">
          🎉 Goal reached! Great work.
        </div>
      )}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
        <span>{fmtVal(goal.current, meta.unit)}</span>
        <span>{fmtVal(goal.target, meta.unit)}</span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-700 ${complete ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{complete ? '🎉 Goal reached' : `${Math.round(pct)}% complete`}</p>
        {pace && !complete && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pace.tone === 'ahead' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : pace.tone === 'behind' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{pace.label}</span>
        )}
      </div>

      {!collapsed && (
      <>
      <div className="mb-3 mt-3 -mx-1">
        <GoalTrendChart history={getGoalHistory(goal)} target={goal.target} unit={meta.unit} color={CATEGORY_CHART_COLOR[meta.category]} />
      </div>

      {eta && <p className="text-[11px] text-gray-400 mb-2">{eta}</p>}

      {!complete && report.status !== 'no-target' && report.status !== 'not-enough-data' && (
        <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2 mb-2 leading-relaxed">
          💡 {report.recommendation}
        </p>
      )}

      {scoreInsight && !complete && (
        <p className="text-[11px] text-gray-400 mb-2">Your roadmap's "Fix top 3 issues" path projects a monthly passive income of ~{fmtVal(scoreInsight.monthlyPassiveIncome, '₹')} by 60 — <Link href="/roadmap" className="underline hover:text-teal-600">see the actions behind it →</Link></p>
      )}

      {goal.type === 'net-worth' && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <AssetTrackerPanel compact />
        </div>
      )}

      {editing ? (
        <div className="flex gap-2 mt-2">
          <input type="number" value={val} onChange={e => setVal(+e.target.value)}
            className="flex-1 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          <button onClick={save} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Save</button>
          <button onClick={() => { setEditing(false); setVal(goal.current); }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-1">
          {goal.type === 'net-worth' ? (
            <span className="text-[11px] text-gray-400">Updates automatically from your holdings below</span>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Update progress</button>
          )}
          <button onClick={() => setShowReport(s => !s)} className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto">
            📊 Advanced progress report {showReport ? '▲' : '▼'}
          </button>
        </div>
      )}

      {showReport && (
        <>
          <GoalProgressReportPanel report={report} meta={meta} />
          {ACCUMULATION_GOAL_TYPES.includes(goal.type) && !complete && (
            <GoalPathCalculator target={goal.target} current={goal.current} targetDate={goal.targetDate} />
          )}
        </>
      )}
      </>
      )}
    </div>
  );
}

const TYPE_OPTIONS: GoalType[] = [
  'net-worth', 'sip-target', 'emergency-fund', 'debt-freedom', 'fire-corpus',
  'home-down-payment', 'education-fund', 'vacation-fund', 'vehicle-fund',
  'life-insurance-cover', 'credit-score', 'monthly-budget',
  'weight', 'sleep', 'fitness', 'hydration', 'steps', 'body-fat', 'screen-time', 'wellfilab-score',
];

function AddGoalForm({ onClose, onAdded, prefill, existing }: { onClose: () => void; onAdded: () => void; prefill?: { type: GoalType; current: number; target?: number } | null; existing: Goal[] }) {
  const [type, setType] = useState<GoalType | null>(prefill?.type ?? null);
  const [target, setTarget] = useState(prefill?.target != null ? String(prefill.target) : '');
  const [current, setCurrent] = useState(prefill ? String(prefill.current) : '');
  const [targetDate, setTargetDate] = useState('');

  const meta = type ? GOAL_TYPE_META[type] : null;
  const isNetWorth = type === 'net-worth' && !prefill;
  // Every goal type gets a fixed, non-editable label straight from
  // GOAL_TYPE_META — a second goal of the same type would be genuinely
  // indistinguishable from the first in the UI (same icon, same label),
  // not just redundant, so each type is blocked at the picker once one
  // already exists.
  const existingTypes = new Set(existing.map(g => g.type));

  // Net worth's "current value" is never typed in — it's the live sum of
  // real holdings, computed right here so the form is the actual place to
  // set up assets/liabilities, not a plain number field pointing
  // somewhere else to go do that.
  const { data: holdingsForNetWorth } = useSWR(isNetWorth ? SWR_KEYS.holdings : null, getHoldings);
  const liveNetWorth = holdingsForNetWorth != null ? computeTotals(holdingsForNetWorth).netWorth : 0;
  useEffect(() => {
    if (isNetWorth) setCurrent(String(Math.round(liveNetWorth)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNetWorth, liveNetWorth]);

  const save = async () => {
    if (!type || !meta || target === '' || current === '' || existingTypes.has(type)) return;
    await addGoal({ type, label: meta.label, target: +target, current: +current, targetDate: targetDate || undefined });
    onAdded();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-900 dark:text-white">Add a goal</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      {!type ? (
        <div className="grid sm:grid-cols-3 gap-2.5">
          {TYPE_OPTIONS.map(t => {
            const blocked = existingTypes.has(t);
            return (
              <button key={t} disabled={blocked} onClick={() => !blocked && setType(t)}
                className={`p-3.5 rounded-xl border-2 text-center transition-all ${blocked ? 'border-gray-100 dark:border-gray-800 opacity-40 cursor-not-allowed' : 'border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600'}`}>
                <span className="text-2xl">{GOAL_TYPE_META[t].icon}</span>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1.5">{GOAL_TYPE_META[t].label}</p>
                {blocked && <p className="text-[9px] font-bold text-teal-600 dark:text-teal-400 mt-1">✓ Already tracking</p>}
              </button>
            );
          })}
        </div>
      ) : isNetWorth ? (
        <div className="space-y-5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">{meta!.icon}</span>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{meta!.label}</p>
            <button onClick={() => setType(null)} className="text-xs text-gray-400 hover:underline ml-auto">Change type</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 max-w-md">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target net worth (₹)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. 10000000"
                className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target date (optional)</label>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Add what you actually own and owe below — your current net worth (shown as you go) is computed from these, not typed in.
            </p>
            <AssetTrackerPanel />
          </div>

          {target !== '' && !Number.isNaN(+target) && +target > liveNetWorth && (
            <GoalPathCalculator target={+target} current={liveNetWorth} targetDate={targetDate || undefined} />
          )}

          <button onClick={save} disabled={target === ''}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
            Save goal — current net worth {fmtVal(liveNetWorth, '₹')}
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{meta!.icon}</span>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{meta!.label}</p>
            <button onClick={() => setType(null)} className="text-xs text-gray-400 hover:underline ml-auto">Change type</button>
          </div>
          {prefill && (
            <p className="text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 rounded-lg px-2.5 py-1.5">
              ✓ Current value filled in from your calculator result — just set a target.
            </p>
          )}
          {type && existingTypes.has(type) && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-2.5 py-1.5">
              You're already tracking a {meta!.label.toLowerCase()} goal — delete it first if you want to replace it, rather than adding a second one you can't tell apart from the first.
            </p>
          )}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target ({meta!.unit || 'value'})</label>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. 10000000"
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Current value</label>
            <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="e.g. 500000"
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target date (optional)</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>

          {type && ACCUMULATION_GOAL_TYPES.includes(type) && target !== '' && current !== '' && !Number.isNaN(+target) && !Number.isNaN(+current) && +target > +current && (
            <GoalPathCalculator target={+target} current={+current} targetDate={targetDate || undefined} />
          )}

          <button onClick={save} disabled={target === '' || current === '' || (!!type && existingTypes.has(type))}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
            Save goal
          </button>
        </div>
      )}
    </div>
  );
}
