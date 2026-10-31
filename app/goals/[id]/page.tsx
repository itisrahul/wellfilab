'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { Pencil } from 'lucide-react';
import {
  getGoals, updateGoalProgress, updateGoalTarget, deleteGoal, getGoalHistory, GOAL_TYPE_META,
  updateGoalDetails, addMilestone, setMilestoneAchieved, removeMilestone, type GoalPriority,
} from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus } from '@/lib/goalPace';
import { estimateGoalProbability } from '@/lib/goalProbability';
import { buildGoalProgressReport } from '@/lib/goalProgressReport';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { AssetTrackerPanel } from '@/components/dashboard/AssetTrackerPanel';
import { GoalProgressReportPanel } from '@/components/dashboard/GoalProgressReportPanel';
import { getHoldings, syncNetWorthGoalFromHoldings, deleteAllHoldings } from '@/lib/holdingsStorage';
import { fmtVal, progressPct, isGoalComplete, PACE_LABEL, CATEGORY_CHART_COLOR, ACCUMULATION_GOAL_TYPES } from '@/lib/goalDisplay';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCurrency } from '@/lib/useCurrency';
import { SWR_KEYS } from '@/lib/swrKeys';

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
  useCurrency(); // re-render when the global currency changes
  const params = useParams();
  const id = params.id as string;

  const { data: goals, isLoading, mutate: refresh } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: holdingsForSync } = useSWR(SWR_KEYS.holdings, getHoldings);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(0);
  // ?edit=1 (from the pencil icon on the goal's card) opens straight into
  // edit mode instead of landing on the page and making you click again.
  const [editingTarget, setEditingTarget] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edit') === '1'
  );
  const [targetVal, setTargetVal] = useState('');
  const [targetDateVal, setTargetDateVal] = useState('');
  const [notesVal, setNotesVal] = useState<string | null>(null);
  const [newMilestoneLabel, setNewMilestoneLabel] = useState('');
  const [newMilestoneValue, setNewMilestoneValue] = useState('');
  const { confirmDialog, dialog } = useConfirmDialog();

  const rawGoal = (goals ?? []).find(g => g.id === id);
  const goal = rawGoal ? syncNetWorthGoalFromHoldings(rawGoal, holdingsForSync ?? []) : null;

  useEffect(() => {
    if (goal && editingTarget && targetVal === '') {
      setTargetVal(String(goal.target));
      setTargetDateVal(goal.targetDate ? goal.targetDate.slice(0, 10) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal]);

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
  const probability = !complete ? estimateGoalProbability(goal) : null;
  const report = buildGoalProgressReport(goal);
  const notes = notesVal ?? goal.notes ?? '';
  const priority: GoalPriority = goal.priority ?? 'medium';
  const milestones = goal.milestones ?? [];

  const setPriority = async (p: GoalPriority) => { await updateGoalDetails(goal.id, { priority: p }); refresh(); };
  const saveNotes = async () => { await updateGoalDetails(goal.id, { notes }); refresh(); };
  const addMilestoneNow = async () => {
    if (!newMilestoneLabel.trim() || newMilestoneValue === '' || Number.isNaN(+newMilestoneValue)) return;
    await addMilestone(goal, newMilestoneLabel.trim(), +newMilestoneValue);
    setNewMilestoneLabel(''); setNewMilestoneValue('');
    refresh();
  };
  const toggleMilestone = async (milestoneId: string, achieved: boolean) => { await setMilestoneAchieved(goal, milestoneId, achieved); refresh(); };
  const deleteMilestone = async (milestoneId: string) => { await removeMilestone(goal, milestoneId); refresh(); };

  const startEdit = () => { setVal(goal.current); setEditing(true); };
  const save = async () => { await updateGoalProgress(goal.id, val); refresh(); setEditing(false); };
  const startEditTarget = () => { setTargetVal(String(goal.target)); setTargetDateVal(goal.targetDate ? goal.targetDate.slice(0, 10) : ''); setEditingTarget(true); };
  const saveTarget = async () => {
    if (targetVal === '' || Number.isNaN(+targetVal)) return;
    await updateGoalTarget(goal.id, +targetVal, targetDateVal || undefined);
    refresh();
    setEditingTarget(false);
  };
  const remove = async () => {
    const isNetWorth = goal.type === 'net-worth';
    const msg = isNetWorth
      ? `Delete "${goal.label}"? This also deletes every holding you've tracked under it — all your assets and liabilities. This can't be undone.`
      : `Delete "${goal.label}"? This can't be undone.`;
    if (!(await confirmDialog(msg))) return;
    await deleteGoal(goal.id);
    if (isNetWorth) await deleteAllHoldings();
    window.location.href = '/goals';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {dialog}
      <div className="bg-[#0F2A27]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <Link href="/goals" className="text-xs font-bold text-teal-300 hover:underline">← Back to your goals</Link>
          <div className="flex items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{meta.icon}</span>
              <div>
                <h1 className="text-lg font-extrabold text-white leading-tight">{goal.label}</h1>
                {goal.targetDate && <p className="text-xs text-white/50">Target date: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
              </div>
            </div>
            <button onClick={startEditTarget} title="Edit target & date" className="text-white/50 hover:text-white flex-shrink-0"><Pencil size={16} /></button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {editingTarget && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target ({meta.unit || 'value'})</label>
              <input type="number" value={targetVal} onChange={e => setTargetVal(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target date</label>
              <input type="date" value={targetDateVal} onChange={e => setTargetDateVal(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button onClick={saveTarget} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Save</button>
              <button onClick={() => setEditingTarget(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500">Cancel</button>
            </div>
          </div>
        )}

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

          {probability && probability.status === 'estimated' && (
            <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className={`text-lg font-black tabular-nums flex-shrink-0 ${probability.pct >= 60 ? 'text-green-600 dark:text-green-400' : probability.pct >= 35 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{probability.pct}%</p>
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Chance of hitting your target by {new Date(goal.targetDate!).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                <p className="text-[11px] text-gray-400">{probability.basis}</p>
              </div>
            </div>
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
            <button onClick={remove} className="text-xs font-semibold text-gray-400 hover:text-red-500 ml-auto">Delete goal</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Priority</p>
          <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-5">
            {(['low', 'medium', 'high'] as GoalPriority[]).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize transition-colors ${
                  priority === p ? 'bg-white dark:bg-gray-900 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}>{p}</button>
            ))}
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Milestones</p>
          {milestones.length > 0 && (
            <div className="space-y-2 mb-4">
              {milestones.map(m => {
                const achieved = !!m.achievedDate;
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <input type="checkbox" checked={achieved} onChange={e => toggleMilestone(m.id, e.target.checked)}
                      className="w-[18px] h-[18px] accent-teal-600 flex-shrink-0" />
                    <p className={`text-sm flex-1 ${achieved ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                      {m.label} — {fmtVal(m.value, meta.unit)}
                    </p>
                    <button onClick={() => deleteMilestone(m.id)} className="text-gray-300 hover:text-red-500 text-xs flex-shrink-0">Remove</button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <input value={newMilestoneLabel} onChange={e => setNewMilestoneLabel(e.target.value)} placeholder="e.g. Halfway there"
              className="flex-1 min-w-0 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            <input type="number" value={newMilestoneValue} onChange={e => setNewMilestoneValue(e.target.value)} placeholder={meta.unit || 'value'}
              className="w-28 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            <button onClick={addMilestoneNow} className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex-shrink-0">Add</button>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 mt-5">Notes</p>
          <textarea value={notes} onChange={e => setNotesVal(e.target.value)} onBlur={saveNotes} rows={2} placeholder="Anything worth remembering about this goal…"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500 resize-none" />
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
