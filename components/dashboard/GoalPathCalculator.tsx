'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { calcSavingsGoal, calcMonthlyNeeded } from '@/lib/calc';
import { convertFromINR, formatCurrencyAmount } from '@/lib/currency';
import { useCurrency } from '@/lib/useCurrency';

const DEFAULT_RATE = 10;

/**
 * Real, interactive "how do I actually get there" calculator for a
 * lump-sum money goal — wraps the same calcSavingsGoal/calcMonthlyNeeded
 * formulas every SIP/savings-goal tool page already uses (correctness-
 * audited in lib/calc.test.ts), not a new invented formula.
 *
 * target/current arrive as real INR amounts (the goal's stored values);
 * converted once here to the selected display currency so the monthly
 * input, presets, and result text all stay in the same, consistent unit.
 *
 * The one assumption here (an annual return rate) is always user-set and
 * always labeled as an assumption — this project's standing rule is real
 * math on numbers the user controls, never a silently-chosen return baked
 * into the result (see lib/goalProgressReport.ts's "no invented
 * compounding return" for the complementary, assumption-free number this
 * sits next to).
 */
export function GoalPathCalculator({ target, current, targetDate }: { target: number; current: number; targetDate?: string }) {
  const currency = useCurrency();
  const dTarget = convertFromINR(target);
  const dCurrent = convertFromINR(current);
  const remaining = Math.max(0, dTarget - dCurrent);
  const defaultMonthly = () => Math.max(500, Math.round(remaining / 36 / 100) * 100 || 500);
  const [monthly, setMonthly] = useState(defaultMonthly);
  const [rate, setRate] = useState(DEFAULT_RATE);

  // A figure typed in one currency is meaningless after switching to
  // another — reset to a sensible default in the new currency's own scale
  // rather than leaving a stale number sitting there.
  const prevCode = useRef(currency.currency);
  useEffect(() => {
    if (prevCode.current !== currency.currency) {
      prevCode.current = currency.currency;
      setMonthly(defaultMonthly());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency.currency]);

  const path = useMemo(() => calcSavingsGoal(dTarget, dCurrent, monthly, rate), [dTarget, dCurrent, monthly, rate]);

  const monthsToTargetDate = targetDate
    ? Math.max(1, Math.round((new Date(targetDate).getTime() - Date.now()) / (30.44 * 86400000)))
    : null;
  const neededForDate = monthsToTargetDate ? calcMonthlyNeeded(dTarget, dCurrent, monthsToTargetDate, rate) : null;

  const presets = [...new Set([0.5, 1, 1.5, 2].map(m => Math.max(500, Math.round((monthly * m) / 100) * 100)))];
  const sym = currency.sym;
  const money = (n: number) => formatCurrencyAmount(n, 2);

  if (remaining <= 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Path to your goal <span className="normal-case font-normal">— a projection based on a return rate you set, not a promise</span>
      </p>

      <div className="grid gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Monthly investment</label>
          <input type="number" value={monthly} min={0} step={500} onChange={e => setMonthly(Math.max(0, +e.target.value))}
            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Assumed annual return</label>
          <div className="flex items-center gap-2 h-[38px]">
            <input type="range" min={0} max={20} step={0.5} value={rate} onChange={e => setRate(+e.target.value)} className="flex-1 accent-teal-600" />
            <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right tabular-nums flex-shrink-0">{rate}%</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20 mb-3">
        {path.neverReaches ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">At {sym}{monthly.toLocaleString()}/month and {rate}% return, this doesn't reach the target within 100 years — try a higher monthly amount.</p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            At <strong className="text-gray-900 dark:text-white">{sym}{monthly.toLocaleString()}/month</strong> and <strong className="text-gray-900 dark:text-white">{rate}% annual return</strong>, you'd reach {money(dTarget)} in <strong className="text-teal-700 dark:text-teal-400">{path.years}y {path.remMonths}mo</strong> — investing {money(path.totalDeposited)} total, with {money(path.interest)} coming from growth.
          </p>
        )}
      </div>

      {neededForDate != null && targetDate && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          To hit your {new Date(targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} target date specifically, you'd need about <strong className="text-gray-900 dark:text-white">{sym}{Math.round(neededForDate).toLocaleString()}/month</strong> at {rate}% return.
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {presets.map(m => (
          <button key={m} type="button" onClick={() => setMonthly(m)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${m === monthly ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'}`}>
            {sym}{m.toLocaleString()}/mo
          </button>
        ))}
      </div>
    </div>
  );
}
