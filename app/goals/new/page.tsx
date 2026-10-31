'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  getGoals, addGoal, GOAL_TYPE_META, type Goal, type GoalType,
} from '@/lib/goalsStorage';
import { syncScoreInputsFromAccount } from '@/lib/scoreInputs';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { AssetTrackerPanel } from '@/components/dashboard/AssetTrackerPanel';
import { getHoldings, computeTotals } from '@/lib/holdingsStorage';
import { fmtVal, ACCUMULATION_GOAL_TYPES } from '@/lib/goalDisplay';
import { useCurrency } from '@/lib/useCurrency';
import { SWR_KEYS } from '@/lib/swrKeys';

const TYPE_OPTIONS: GoalType[] = [
  'net-worth', 'sip-target', 'emergency-fund', 'debt-freedom', 'fire-corpus',
  'home-down-payment', 'education-fund', 'vacation-fund', 'vehicle-fund',
  'life-insurance-cover', 'credit-score', 'monthly-budget',
  'weight', 'sleep', 'fitness', 'hydration', 'steps', 'body-fat', 'screen-time', 'wellfilab-score',
];

/**
 * A full page, not a form dropped into the top of /goals pushing every
 * existing goal card down — reached from "+ Add Goal" there, or a deep
 * link from a calculator's real result (?prefill=type&current=X&target=Y).
 * Saving or cancelling both return to /goals to see the full list.
 */
export default function NewGoalPage() {
  useCurrency();
  const router = useRouter();
  const { data: existing } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: rawInputs } = useSWR(SWR_KEYS.scoreInputs, syncScoreInputsFromAccount);
  const { data: holdings } = useSWR(SWR_KEYS.holdings, getHoldings);

  const [type, setType] = useState<GoalType | null>(null);
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [prefill, setPrefill] = useState<{ type: GoalType; current: number; target?: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get('prefill') as GoalType | null;
    const c = params.get('current');
    const g = params.get('target');
    if (t && GOAL_TYPE_META[t] && c != null && !Number.isNaN(+c)) {
      const p = { type: t, current: +c, target: g != null && !Number.isNaN(+g) ? +g : undefined };
      setPrefill(p);
      setType(p.type);
      setCurrent(String(p.current));
      if (p.target != null) setTarget(String(p.target));
    }
  }, []);

  const meta = type ? GOAL_TYPE_META[type] : null;
  const isNetWorth = type === 'net-worth' && !prefill;
  const existingTypes = new Set((existing ?? []).map(g => g.type));

  const liveNetWorth = holdings != null ? computeTotals(holdings).netWorth : 0;
  useEffect(() => {
    if (isNetWorth) setCurrent(String(Math.round(liveNetWorth)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNetWorth, liveNetWorth]);

  // Intelligent prefill, not a second blank field to fill in by hand — reuse
  // real numbers you've already entered elsewhere instead of asking again.
  // Only applies on a fresh pick (not a calculator deep link, which already
  // filled in its own real result) and only while the user hasn't typed
  // their own value yet.
  useEffect(() => {
    if (!type || prefill || current !== '') return;
    if (type === 'weight' && rawInputs?.body?.weight != null) setCurrent(String(rawInputs.body.weight));
    else if (type === 'sleep' && rawInputs?.body?.sleepHours != null) setCurrent(String(rawInputs.body.sleepHours));
    else if (type === 'fitness' && rawInputs?.body?.exerciseDays != null) setCurrent(String(rawInputs.body.exerciseDays));
    else if (type === 'emergency-fund' && holdings != null) {
      const liquid = holdings.filter(h => h.category === 'asset' && h.type === 'Liquid').reduce((s, h) => s + h.currentValue, 0);
      if (liquid > 0) setCurrent(String(Math.round(liquid)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, rawInputs, holdings]);

  const intelligentSource = (): string | null => {
    if (prefill || !type) return null;
    if (type === 'weight' && rawInputs?.body?.weight != null) return 'your weight from the WellFiLab Score';
    if (type === 'sleep' && rawInputs?.body?.sleepHours != null) return 'your sleep hours from the WellFiLab Score';
    if (type === 'fitness' && rawInputs?.body?.exerciseDays != null) return 'your exercise days from the WellFiLab Score';
    if (type === 'emergency-fund' && holdings?.some(h => h.category === 'asset' && h.type === 'Liquid')) return 'your liquid/cash holdings';
    return null;
  };

  const goBack = () => router.push('/goals');

  const save = async () => {
    if (!type || !meta || target === '' || current === '' || existingTypes.has(type)) return;
    await addGoal({ type, label: meta.label, target: +target, current: +current, targetDate: targetDate || undefined });
    goBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0F2A27]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/goals" className="text-xs font-bold text-teal-300 hover:underline">← Back to your goals</Link>
          <h1 className="text-xl font-extrabold text-white mt-2">Add a goal</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
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
            <div className="space-y-5">
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

              <div className="flex gap-2">
                <button onClick={save} disabled={target === ''}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
                  Save goal — current net worth {fmtVal(liveNetWorth, '₹')}
                </button>
                <button onClick={goBack} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">Cancel</button>
              </div>
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
              {intelligentSource() && (
                <p className="text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 rounded-lg px-2.5 py-1.5">
                  ✓ Current value filled in from {intelligentSource()} — change it if that's not up to date.
                </p>
              )}
              {existingTypes.has(type) && (
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
                <p className="text-[11px] text-gray-400 mt-1">Set this to unlock pace and ETA tracking on the goal card.</p>
              </div>

              {ACCUMULATION_GOAL_TYPES.includes(type) && target !== '' && current !== '' && !Number.isNaN(+target) && !Number.isNaN(+current) && +target > +current && (
                <GoalPathCalculator target={+target} current={+current} targetDate={targetDate || undefined} />
              )}

              <div className="flex gap-2">
                <button onClick={save} disabled={target === '' || current === '' || existingTypes.has(type)}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
                  Save goal
                </button>
                <button onClick={goBack} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
