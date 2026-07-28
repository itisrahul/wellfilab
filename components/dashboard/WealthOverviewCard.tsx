import type { FinanceInputs } from '@/lib/wellfilab-score';
import { fmtINR } from '@/lib/roadmapActions';
import { LockedInsightTile } from './LockedInsightTile';

function StatTile({ icon, label, value, sub, warn }: { icon: string; label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
      <p className="text-base mb-1.5">{icon}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className={`font-mono tabular-nums font-bold text-sm ${warn ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className={`text-[10px] ${warn ? 'text-red-400' : 'text-gray-400'}`}>{sub}</p>
    </div>
  );
}

/** Wealth's equivalent of HealthOverviewCard — every tile sources straight
 * from the real finance inputs (emergency fund flag, total debt, monthly
 * investing) the user entered on their full score, never fabricated. */
export function WealthOverviewCard({ finance }: { finance: FinanceInputs | null }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Wealth overview</p>
      <div className="grid grid-cols-2 gap-3">
        {finance ? (
          <>
            <StatTile icon="🛟" label="Emergency fund" value={finance.hasEmergencyFund ? 'Yes' : 'None'} sub={finance.hasEmergencyFund ? 'Covered' : 'Not built yet'} warn={!finance.hasEmergencyFund} />
            <StatTile icon="📈" label="Monthly investing" value={fmtINR(finance.monthlyInvestments)} sub={finance.monthlyInvestments > 0 ? 'Active' : 'Not started'} warn={finance.monthlyInvestments === 0} />
            <StatTile icon="💳" label="Total debt" value={fmtINR(finance.totalDebt)} sub={finance.totalDebt === 0 ? 'Debt-free' : 'Outstanding'} />
            <StatTile icon="🏥" label="Insurance" value={finance.hasInsurance ? 'Covered' : 'None'} sub="Health" warn={!finance.hasInsurance} />
          </>
        ) : (
          <>
            <LockedInsightTile icon="🛟" label="Emergency fund" connectLabel="Add on the score" />
            <LockedInsightTile icon="📈" label="Investing" connectLabel="Add on the score" />
            <LockedInsightTile icon="💳" label="Debt" connectLabel="Add on the score" />
            <LockedInsightTile icon="🏥" label="Insurance" connectLabel="Add on the score" />
          </>
        )}
      </div>
    </div>
  );
}
