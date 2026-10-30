'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  getHoldings, addHolding, updateHolding, deleteHolding, computeTotals, computeBreakdown, computeMonthOverMonthChanges,
  HOLDING_TYPES, HOLDING_TYPE_META, type HoldingCategory, type HoldingType,
} from '@/lib/holdingsStorage';
import { getSnapshots, addSnapshot, computeGainHistory } from '@/lib/netWorthHistory';
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

/**
 * The real-holdings breakdown + history, self-contained (own SWR fetching)
 * so it can be dropped anywhere — the full /assets page, or embedded
 * directly under the net-worth goal card on /goals, which is where most
 * people actually expect to find it (one thing, not two places).
 * `compact` trims the summary row for the embedded context, where the
 * parent goal card already shows current/target/progress.
 */
export function AssetTrackerPanel({ compact = false }: { compact?: boolean }) {
  const { data: holdings, isLoading: holdingsLoading, mutate: refreshHoldings } = useSWR(SWR_KEYS.holdings, getHoldings);
  const { data: snapshots, isLoading: snapshotsLoading, mutate: refreshSnapshots } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const [showAdd, setShowAdd] = useState(false);
  const [recording, setRecording] = useState(false);

  const h = holdings ?? [];
  const totals = computeTotals(h);
  const breakdown = computeBreakdown(h);
  const gainHistory = computeGainHistory(snapshots ?? []);
  const changes = computeMonthOverMonthChanges(h);

  const recordSnapshot = async () => {
    setRecording(true);
    await addSnapshot(totals.totalAssets, totals.totalLiabilities);
    await refreshSnapshots();
    setRecording(false);
  };

  if (holdingsLoading || snapshotsLoading) {
    return <div className="h-32 animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Real holdings</p>
        <button onClick={() => setShowAdd(s => !s)} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
          {showAdd ? 'Cancel' : '+ Add holding'}
        </button>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <SummaryCard label="Net worth" value={fmtINR(totals.netWorth)} accent="text-gray-900 dark:text-white" />
          <SummaryCard label="Total assets" value={fmtINR(totals.totalAssets)} accent="text-emerald-600 dark:text-emerald-400" />
          <SummaryCard label="Total liabilities" value={fmtINR(totals.totalLiabilities)} accent="text-red-500" />
          <SummaryCard label="Adding each month" value={fmtINR(totals.monthlyInvestment)} accent="text-teal-600 dark:text-teal-400" />
          <SummaryCard label="EMIs each month" value={fmtINR(totals.monthlyEMI)} accent="text-amber-600 dark:text-amber-400" />
        </div>
      )}
      {compact && h.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          <SummaryCard label="Net worth" value={fmtINR(totals.netWorth)} accent="text-gray-900 dark:text-white" />
          <SummaryCard label="Adding/mo" value={fmtINR(totals.monthlyInvestment)} accent="text-teal-600 dark:text-teal-400" />
          <SummaryCard label="EMIs/mo" value={fmtINR(totals.monthlyEMI)} accent="text-amber-600 dark:text-amber-400" />
        </div>
      )}

      {showAdd && <AddHoldingForm onAdded={() => { setShowAdd(false); refreshHoldings(); }} />}

      {h.length === 0 && !showAdd ? (
        <p className="text-xs text-gray-400 py-3">No holdings yet — add what you actually own and owe (EPF, stocks, a home loan) and your net worth is computed from real numbers, not a guess.</p>
      ) : (
        <>
          {h.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-5 py-2">
              {breakdown.map(cat => (
                <CategoryBlock key={cat.category} cat={cat} onChange={refreshHoldings} />
              ))}
            </div>
          )}

          {changes.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">What changed in the last month</p>
              <div className="space-y-1.5">
                {changes.map(c => {
                  // "Good" for net worth: an asset grew, or a liability shrank.
                  const good = c.category === 'asset' ? c.delta > 0 : c.delta < 0;
                  return (
                    <div key={c.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300 truncate flex-1">
                        {HOLDING_TYPE_META[c.type].icon} {c.subType}
                      </span>
                      <span className="text-gray-400 font-mono tabular-nums mr-2">{fmtINR(c.fromValue)} → {fmtINR(c.toValue)}</span>
                      <span className={`font-mono tabular-nums font-bold flex-shrink-0 ${good ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {c.delta >= 0 ? '+' : ''}{fmtINR(c.delta)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Net worth over time</p>
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
              <div className="mt-3 overflow-x-auto">
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
                    {gainHistory.slice(-6).reverse().map(g => (
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
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5">
      <p className={`text-sm font-black tabular-nums ${accent}`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
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

function AddHoldingForm({ onAdded }: { onAdded: () => void }) {
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
    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-3">
      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">This is a...</label>
        <div className="inline-flex items-center gap-1 bg-white dark:bg-gray-900 rounded-full p-1">
          {(['asset', 'liability'] as HoldingCategory[]).map(c => (
            <button key={c} type="button" onClick={() => setCategory(c)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${category === c ? 'bg-teal-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {c === 'asset' ? '📈 Asset (I own)' : '📉 Liability (I owe)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Type</label>
          <select value={type} onChange={e => setType(e.target.value as HoldingType)}
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500">
            {HOLDING_TYPES.map(t => <option key={t} value={t}>{HOLDING_TYPE_META[t].icon} {HOLDING_TYPE_META[t].label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Name (e.g. EPF, HDFC home loan)</label>
          <input type="text" value={subType} onChange={e => setSubType(e.target.value)} placeholder="e.g. EPF"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{category === 'asset' ? 'Current value (₹)' : 'Outstanding balance (₹)'}</label>
          <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} placeholder="e.g. 500000"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{category === 'asset' ? 'Invested amount (optional)' : 'Original loan amount (optional)'}</label>
          <input type="number" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} placeholder="optional"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{category === 'asset' ? 'Monthly SIP (optional)' : 'Monthly EMI (optional)'}</label>
          <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} placeholder="optional"
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>
      </div>

      <button onClick={save} disabled={!subType.trim() || currentValue === ''}
        className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
        Save holding
      </button>
    </div>
  );
}
