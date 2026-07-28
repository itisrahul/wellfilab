import Link from 'next/link';
import type { FinanceInputs } from '@/lib/wellfilab-score';
import { fmtINR } from '@/lib/roadmapActions';
import { LinkChip, LinkBar } from './LinkChip';

/** Real monthly income vs. expenses, straight from the finance inputs the
 * user entered on their full score — not a fabricated cash-flow feed (we
 * have no bank/transaction integration). Net savings and savings rate are
 * plain arithmetic on those same two real numbers. */
export function CashFlowCard({ finance }: { finance: FinanceInputs | null }) {
  if (!finance || finance.monthlyIncome <= 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">💵</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No income/expense data yet</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Add your monthly income and expenses on the full score to see your real cash flow.</p>
        <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Complete my full score →</Link>
      </div>
    );
  }

  const { monthlyIncome, monthlyExpenses } = finance;
  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = Math.round((netSavings / monthlyIncome) * 100);
  const maxBar = Math.max(monthlyIncome, monthlyExpenses);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Monthly cash flow</p>
        <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Update →</Link>
      </div>

      <div className="mb-4">
        <p className={`font-mono tabular-nums text-2xl font-black ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmtINR(netSavings)}</p>
        <p className="text-[11px] text-gray-400">Net savings · {savingsRate}% of income</p>
      </div>

      <div className="flex items-end gap-4" style={{ height: 72 }}>
        {[
          { label: 'Income', value: monthlyIncome, color: '#0d9488' },
          { label: 'Expenses', value: monthlyExpenses, color: '#f59e0b' },
        ].map(bar => (
          <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
            <span className="font-mono tabular-nums text-[10px] font-bold text-gray-500 dark:text-gray-400">{fmtINR(bar.value)}</span>
            <div className="w-full rounded-t-lg" style={{ height: `${(bar.value / maxBar) * 100}%`, backgroundColor: bar.color, minHeight: 4 }} />
            <span className="text-[10px] text-gray-400">{bar.label}</span>
          </div>
        ))}
      </div>

      <LinkBar>
        <LinkChip targetId="goal-progress">Net savings funds your Goals</LinkChip>
      </LinkBar>
    </div>
  );
}
