'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { Pencil } from 'lucide-react';
import {
  getHoldings, addHolding, updateHolding, deleteHolding, computeTotals, computeBreakdown, computeMonthOverMonthChanges,
  computeMonthlyNetWorthHistory, computeMonthlyGainHistory, getHoldingsSyncError,
  HOLDING_TYPES, HOLDING_TYPE_META, type HoldingCategory, type HoldingType, type Holding,
} from '@/lib/holdingsStorage';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtMoney } from '@/lib/currency';
import { useCurrency } from '@/lib/useCurrency';
import { SWR_KEYS } from '@/lib/swrKeys';

const GoalTrendChart = dynamic(
  () => import('@/components/dashboard/GoalTrendChart').then(m => m.GoalTrendChart),
  { ssr: false, loading: () => <div className="h-[140px] animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

const fmtINR = fmtMoney;

/**
 * The real-holdings breakdown + history, self-contained (own SWR fetching)
 * so it can be dropped anywhere — the full /assets page, or embedded
 * directly under the net-worth goal card on /goals, which is where most
 * people actually expect to find it (one thing, not two places).
 * `compact` trims the summary row for the embedded context, where the
 * parent goal card already shows current/target/progress.
 */
export function AssetTrackerPanel({ compact = false }: { compact?: boolean }) {
  useCurrency(); // re-render when the global currency changes
  const { data: holdings, isLoading: holdingsLoading, mutate: refreshHoldings } = useSWR(SWR_KEYS.holdings, getHoldings);
  const [showAdd, setShowAdd] = useState(false);

  const h = holdings ?? [];
  const totals = computeTotals(h);
  const breakdown = computeBreakdown(h);
  const monthly = computeMonthlyNetWorthHistory(h);
  const gainHistory = computeMonthlyGainHistory(monthly);
  const changes = computeMonthOverMonthChanges(h);
  const syncError = getHoldingsSyncError();

  if (holdingsLoading) {
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

      {syncError && (
        <p className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg px-2.5 py-2 leading-relaxed">
          ⚠️ Couldn't sync with your account — {syncError}. Showing this device's local copy only until this clears.
        </p>
      )}

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
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Net worth over time — last recorded value each month</p>
            <GoalTrendChart
              history={monthly.map(m => ({ date: m.date, value: m.netWorth }))}
              unit="₹" color="#0d9488"
              emptyLabel="Add a holding above to start seeing your real net-worth trend here."
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
                      <tr key={g.date} className="border-b border-gray-50 dark:border-gray-800/50">
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
              {t.rows.map(h => (
                <HoldingRow key={h.id} holding={h} onChange={onChange} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoldingRow({ holding, onChange }: { holding: Holding; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const { confirmDialog, dialog } = useConfirmDialog();

  const remove = async () => { if (await confirmDialog(`Delete "${holding.subType}"? This can't be undone.`)) { await deleteHolding(holding.id); onChange(); } };

  if (editing) {
    return (
      <HoldingForm existing={holding} compact
        onSaved={() => { setEditing(false); onChange(); }}
        onCancel={() => setEditing(false)} />
    );
  }

  return (
    <>
      {dialog}
      <div className="group flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="truncate">{holding.subType}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono tabular-nums">{fmtINR(holding.currentValue)}</span>
          <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-opacity" title="Edit this holding">
            <Pencil size={11} />
          </button>
          <button onClick={remove} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity" title="Delete this holding">✕</button>
        </div>
      </div>
    </>
  );
}

function AddHoldingForm({ onAdded }: { onAdded: () => void }) {
  return <HoldingForm onSaved={onAdded} />;
}

/**
 * One form for both adding a holding and editing an existing one — editing
 * used to be a bare "type a new number" inline input, so changing a
 * holding's name, type, invested amount, or monthly SIP/EMI meant deleting
 * it and re-adding from scratch. Same fields either way; `existing` just
 * pre-fills them and switches the save to an update instead of a create.
 */
function HoldingForm({ existing, onSaved, onCancel, compact = false }: {
  existing?: Holding; onSaved: () => void; onCancel?: () => void; compact?: boolean;
}) {
  const [category, setCategory] = useState<HoldingCategory>(existing?.category ?? 'asset');
  const [type, setType] = useState<HoldingType>(existing?.type ?? 'Equity');
  const [subType, setSubType] = useState(existing?.subType ?? '');
  const [currentValue, setCurrentValue] = useState(existing ? String(existing.currentValue) : '');
  const [investedAmount, setInvestedAmount] = useState(existing?.investedAmount != null ? String(existing.investedAmount) : '');
  const [monthlyContribution, setMonthlyContribution] = useState(existing?.monthlyContribution != null ? String(existing.monthlyContribution) : '');

  const save = async () => {
    if (!subType.trim() || currentValue === '') return;
    const payload = {
      category, type, subType: subType.trim(),
      currentValue: Math.abs(+currentValue),
      investedAmount: investedAmount !== '' ? Math.abs(+investedAmount) : undefined,
      monthlyContribution: monthlyContribution !== '' ? Math.abs(+monthlyContribution) : undefined,
    };
    if (existing) await updateHolding(existing.id, payload);
    else await addHolding(payload);
    onSaved();
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-3 ${compact ? 'p-3' : 'p-4'}`}>
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

      <div className="flex gap-2">
        <button onClick={save} disabled={!subType.trim() || currentValue === ''}
          className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
          {existing ? 'Save changes' : 'Save holding'}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
