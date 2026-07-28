import Link from 'next/link';
import type { FinanceInputs } from '@/lib/wellfilab-score';

/** Real equity-allocation donut — sourced only from the rough
 * equityAllocationPct the user self-reported on their full score. We don't
 * have broker/investment-account linking, so this deliberately stays a
 * single real number (equity vs. everything else), never a fabricated
 * multi-fund breakdown we have no way of actually knowing. */
export function EquityAllocationCard({ finance }: { finance: FinanceInputs | null }) {
  const pct = finance?.equityAllocationPct;

  if (pct == null) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">🥧</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No allocation data yet</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Add your rough equity allocation on the full score to see this — we don't fabricate a fund-by-fund breakdown without it.</p>
        <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Add my allocation →</Link>
      </div>
    );
  }

  const other = 100 - pct;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Equity allocation</p>
        <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Update →</Link>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
          <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#0d9488 0% ${pct}%, #e5e7eb ${pct}% 100%)` }} />
          <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
            <span className="font-mono tabular-nums font-black text-lg text-gray-900 dark:text-white">{pct}%</span>
            <span className="text-[8px] text-gray-400">Equity</span>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <p className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />Equity — {pct}%</p>
          <p className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700 inline-block" />Other — {other}%</p>
          <p className="text-[10px] text-gray-400 max-w-[9rem]">Self-reported estimate, not linked to a real brokerage.</p>
        </div>
      </div>
    </div>
  );
}
