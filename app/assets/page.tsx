'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  getHoldings, addHolding, updateHolding, deleteHolding, computeTotals, computeBreakdown,
  HOLDING_TYPES, HOLDING_TYPE_META, type Holding, type HoldingCategory, type HoldingType,
} from '@/lib/holdingsStorage';
import { getSnapshots, addSnapshot, computeGainHistory, syncNetWorthGoal } from '@/lib/netWorthHistory';
import { getGoals, type Goal } from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus } from '@/lib/goalPace';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { SWR_KEYS } from '@/lib/swrKeys';

const GoalTrendChart = dynamic(
  () => import('@/components/dashboard/GoalTrendChart').then(m => m.GoalTrendChart),
  { ssr: false, loading: () => <div className="h-[140px] animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

function fmtINR(n: number): string {
  const sign = n < 0 ? '−' : '';
  const abs = Math.abs(n);
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

export default function AssetsPage() {
  const { data: holdings, isLoading: holdingsLoading, mutate: refreshHoldings } = useSWR(SWR_KEYS.holdings, getHoldings);
  const { data: snapshots, isLoading: snapshotsLoading, mutate: refreshSnapshots } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const { data: goals } = useSWR(SWR_KEYS.goals, getGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [recording, setRecording] = useState(false);

  const h = holdings ?? [];
  const totals = computeTotals(h);
  const breakdown = computeBreakdown(h);
  const gainHistory = computeGainHistory(snapshots ?? []);
  const rawNetWorthGoal = (goals ?? []).find(g => g.type === 'net-worth');
  // Synced against the real snapshot history (not the live holdings total
  // below) — pace/ETA need a genuine recorded data point to measure a rate
  // against, never "right now" standing in for a real update.
  const netWorthGoal = rawNetWorthGoal ? syncNetWorthGoal(rawNetWorthGoal, snapshots ?? []) : undefined;

  const recordSnapshot = async () => {
    setRecording(true);
    await addSnapshot(totals.totalAssets, totals.totalLiabilities);
    await refreshSnapshots();
    setRecording(false);
  };

  if (holdingsLoading || snapshotsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0F2A27]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-2">Asset Tracker</p>
              <h1 className="text-3xl font-extrabold text-white mb-2">Your Net Worth, Broken Down</h1>
              <p className="text-sm text-white/50">Real holdings, real monthly contributions — by category, not one lump number.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all flex-shrink-0">
              + Add Holding
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <Link href="/goals" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">← Your goals</Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <Link href="/dashboard" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">See it on your dashboard →</Link>
        </div>

        {/* ── Summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <SummaryCard label="Net worth" value={fmtINR(totals.netWorth)} accent="text-gray-900 dark:text-white" />
          <SummaryCard label="Total assets" value={fmtINR(totals.totalAssets)} accent="text-emerald-600 dark:text-emerald-400" />
          <SummaryCard label="Total liabilities" value={fmtINR(totals.totalLiabilities)} accent="text-red-500" />
          <SummaryCard label="Adding each month" value={fmtINR(totals.monthlyInvestment)} accent="text-teal-600 dark:text-teal-400" />
          <SummaryCard label="EMIs each month" value={fmtINR(totals.monthlyEMI)} accent="text-amber-600 dark:text-amber-400" />
        </div>

        {h.length === 0 && !showAdd && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-4xl mb-4">🧾</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No holdings yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Add what you actually own and owe — EPF, stocks, a home loan, anything — and your net worth gets computed from real numbers, not a guess.</p>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
              Add your first holding →
            </button>
          </div>
        )}

        {showAdd && <AddHoldingForm onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); refreshHoldings(); }} />}

        {h.length > 0 && (
          <>
            {/* ── Category breakdown ── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Breakdown</p>
              <div className="grid md:grid-cols-2 gap-5">
                {breakdown.map(cat => (
                  <CategoryBlock key={cat.category} cat={cat} onChange={refreshHoldings} />
                ))}
              </div>
            </div>

            {/* ── Net worth path ── */}
            {netWorthGoal && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Path to your net worth goal — target {fmtINR(netWorthGoal.target)}
                </p>
                <NetWorthGoalProgress goal={netWorthGoal} current={totals.netWorth} />
                <GoalPathCalculator target={netWorthGoal.target} current={totals.netWorth} targetDate={netWorthGoal.targetDate} />
              </div>
            )}
            {!netWorthGoal && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <span className="text-lg flex-shrink-0">🎯</span>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex-1">No net worth target set yet — <Link href={`/goals?prefill=net-worth&current=${Math.round(totals.netWorth)}`} className="underline">set one</Link> to see a real path to it, calculated from what you're adding each month.</p>
              </div>
            )}

            {/* ── History ── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Net worth over time</p>
                <button onClick={recordSnapshot} disabled={recording}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50">
                  {recording ? 'Saving…' : '+ Record this month →'}
                </button>
              </div>

              <GoalTrendChart
                history={(snapshots ?? []).map(s => ({ date: s.date, value: s.netWorth }))}
                unit="₹" color="#0d9488"
                emptyLabel="Record a snapshot each month to see your real net-worth trend here."
              />

              {gainHistory.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <th className="pb-2 font-semibold">Month</th>
                        <th className="pb-2 font-semibold text-right">Value</th>
                        <th className="pb-2 font-semibold text-right">Change</th>
                        <th className="pb-2 font-semibold text-right">% Gain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gainHistory.slice(-12).reverse().map(g => (
                        <tr key={g.id} className="border-b border-gray-50 dark:border-gray-800/50">
                          <td className="py-2 text-gray-600 dark:text-gray-300">{new Date(g.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                          <td className="py-2 text-right font-mono tabular-nums font-bold text-gray-900 dark:text-white">{fmtINR(g.netWorth)}</td>
                          <td className={`py-2 text-right font-mono tabular-nums font-semibold ${g.amountGain == null ? 'text-gray-300' : g.amountGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {g.amountGain == null ? '—' : `${g.amountGain >= 0 ? '+' : ''}${fmtINR(g.amountGain)}`}
                          </td>
                          <td className={`py-2 text-right font-mono tabular-nums font-semibold ${g.pctGain == null ? 'text-gray-300' : g.pctGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {g.pctGain == null ? '—' : `${g.pctGain >= 0 ? '+' : ''}${g.pctGain.toFixed(1)}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
      <p className={`text-lg font-black tabular-nums ${accent}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

/**
 * `current` is today's live holdings total — used for the progress bar so
 * "how far there" is always real-time. `goal` is the version already
 * synced to the latest real snapshot (see syncNetWorthGoal, called by the
 * parent) — used for pace/ETA, which need a genuine recorded data point to
 * measure a rate against. Deliberately two different "current"s: one
 * instantaneous, one a real history point — never blended into one
 * fabricated "as of right now" rate.
 */
function NetWorthGoalProgress({ goal, current }: { goal: Goal; current: number }) {
  const eta = estimateGoalETA(goal);
  const pace = getGoalPaceStatus(goal);
  const span = goal.target - goal.startValue;
  const pct = span === 0 ? 100 : Math.max(0, Math.min(100, ((current - goal.startValue) / span) * 100));
  return (
    <div className="mb-4">
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-gray-700 dark:text-gray-300">{Math.round(pct)}% there — {fmtINR(current)} of {fmtINR(goal.target)}</span>
        <div className="flex items-center gap-2">
          {pace && <span className={`font-bold px-2 py-0.5 rounded-full ${pace === 'ahead' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : pace === 'behind' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{pace === 'ahead' ? 'Ahead' : pace === 'behind' ? 'Behind' : 'On track'}</span>}
          {eta && <span className="text-gray-400">{eta}</span>}
        </div>
      </div>
    </div>
  );
}

function CategoryBlock({ cat, onChange }: { cat: ReturnType<typeof computeBreakdown>[number]; onChange: () => void }) {
  if (cat.types.length === 0) return null;
  const isAsset = cat.category === 'asset';
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
        <p className={`text-sm font-extrabold ${isAsset ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {isAsset ? '📈 Assets' : '📉 Liabilities'}
        </p>
        <p className={`text-sm font-black tabular-nums ${isAsset ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{fmtINR(cat.total)}</p>
      </div>
      <div className="space-y-3">
        {cat.types.map(t => (
          <div key={t.type}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-gray-600 dark:text-gray-300">{HOLDING_TYPE_META[t.type].icon} {HOLDING_TYPE_META[t.type].label}</span>
              <span className="font-mono tabular-nums font-semibold text-gray-500 dark:text-gray-400">{fmtINR(t.total)}</span>
            </div>
            <div className="space-y-1 pl-5">
              {t.rows.map(r => (
                <HoldingRow key={r.id} id={r.id} subType={r.subType} value={r.value} onChange={onChange} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoldingRow({ id, subType, value, onChange }: { id: string; subType: string; value: number; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));

  const remove = async () => { if (confirm(`Delete "${subType}"?`)) { await deleteHolding(id); onChange(); } };
  const save = async () => {
    const n = +val;
    if (val !== '' && !Number.isNaN(n)) await updateHolding(id, { currentValue: Math.abs(n) });
    setEditing(false);
    onChange();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="truncate flex-1 text-gray-500 dark:text-gray-400">{subType}</span>
        <input type="number" autoFocus value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setVal(String(value)); } }}
          className="w-24 text-xs border border-teal-400 rounded px-1.5 py-0.5 bg-white dark:bg-gray-800 focus:outline-none" />
        <button onClick={save} className="text-teal-600 dark:text-teal-400 font-bold">✓</button>
        <button onClick={() => { setEditing(false); setVal(String(value)); }} className="text-gray-400">✕</button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span className="truncate">{subType}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => setEditing(true)} className="font-mono tabular-nums hover:text-teal-600 dark:hover:text-teal-400 hover:underline" title="Update this month's value">
          {fmtINR(value)}
        </button>
        <button onClick={remove} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity">✕</button>
      </div>
    </div>
  );
}

function AddHoldingForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [category, setCategory] = useState<HoldingCategory>('asset');
  const [type, setType] = useState<HoldingType>('Equity');
  const [subType, setSubType] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  const save = async () => {
    if (!subType.trim() || currentValue === '') return;
    await addHolding({
      category, type, subType: subType.trim(),
      currentValue: Math.abs(+currentValue),
      investedAmount: investedAmount !== '' ? Math.abs(+investedAmount) : undefined,
      monthlyContribution: monthlyContribution !== '' ? Math.abs(+monthlyContribution) : undefined,
    });
    onAdded();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-900 dark:text-white">Add a holding</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      <div className="space-y-3 max-w-sm">
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">This is a...</label>
          <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            {(['asset', 'liability'] as HoldingCategory[]).map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${category === c ? 'bg-white dark:bg-gray-900 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {c === 'asset' ? '📈 Asset (I own)' : '📉 Liability (I owe)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Type</label>
          <select value={type} onChange={e => setType(e.target.value as HoldingType)}
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500">
            {HOLDING_TYPES.map(t => <option key={t} value={t}>{HOLDING_TYPE_META[t].icon} {HOLDING_TYPE_META[t].label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Name (e.g. EPF, HDFC home loan, Reliance shares)</label>
          <input type="text" value={subType} onChange={e => setSubType(e.target.value)} placeholder="e.g. EPF"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{category === 'asset' ? 'Current value (₹)' : 'Outstanding balance (₹)'}</label>
          <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} placeholder="e.g. 500000"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{category === 'asset' ? 'Invested amount, if known (optional)' : 'Original loan amount, if known (optional)'}</label>
          <input type="number" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} placeholder="optional"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{category === 'asset' ? 'Monthly contribution / SIP (optional)' : 'Monthly EMI (optional)'}</label>
          <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} placeholder="optional"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>

        <button onClick={save} disabled={!subType.trim() || currentValue === ''}
          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
          Save holding
        </button>
      </div>
    </div>
  );
}
