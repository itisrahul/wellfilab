'use client';
import { useState, useEffect } from 'react';
import { calcLoan } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Table, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

/** Remaining term implied by balance + rate + the EMI already being paid —
 * reverse-amortization, not a change to calcLoan itself (which takes months
 * as an input, not EMI). Falls back to a long horizon if the EMI doesn't
 * even cover the interest (balance would never reduce). */
function deriveMonths(balance: number, ratePercent: number, emi: number): number {
  const r = ratePercent / 100 / 12;
  if (r === 0) return Math.max(1, Math.ceil(balance / Math.max(1, emi)));
  if (emi <= balance * r) return 600;
  return Math.min(600, Math.ceil(Math.log(emi / (emi - balance * r)) / Math.log(1 + r)));
}

function fmtTime(months: number): string {
  return months >= 600 ? '50+ years' : `${Math.floor(months / 12)}y ${months % 12}m`;
}

export default function LoanPayoffCalc() {
  const [curr, setCurr] = useState('INR');
  const [balance, setBalance] = useState(2000000);
  const [rate, setRate] = useState(9);
  const [emi, setEmi] = useState(18000);
  const [lumpSum, setLumpSum] = useState(200000);
  const C = useCurr(curr);

  const months = deriveMonths(balance, rate, emi);

  const strategies = [
    { label: 'Pay minimum EMI', ...calcLoan(balance, rate, months, 0) },
    { label: 'Extra ₹2,000/month', ...calcLoan(balance, rate, months, 2000) },
    { label: 'Extra ₹5,000/month', ...calcLoan(balance, rate, months, 5000) },
    { label: 'Lump sum now', ...calcLoan(Math.max(0, balance - lumpSum), rate, months, 0) },
    { label: 'Lump sum + extra ₹5,000', ...calcLoan(Math.max(0, balance - lumpSum), rate, months, 5000) },
  ];
  const best = strategies.reduce((b, s) => s.totalMonths < b.totalMonths ? s : b, strategies[0]);
  const worst = strategies[0];
  const maxMonths = Math.max(...strategies.map(s => s.totalMonths), 1);

  useEffect(() => {
    saveHistory({
      calcSlug: 'loan-payoff', calcName: 'Loan Payoff Calculator',
      summary: `Best strategy: ${best.label} — clears in ${fmtTime(best.totalMonths)}, saves ${C.sym}${fmtFull(worst.interest-best.interest,0)}`,
      inputs: { balance, rate, emi, lumpSum },
    });
  }, [balance, rate, emi, lumpSum]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Loan balance" value={balance} onChange={setBalance} sym={C.sym} step={50000}/>
      <PctIn label="Interest rate" value={rate} onChange={setRate} step={0.1}/>
      <MoneyIn label="Current EMI" value={emi} onChange={setEmi} sym={C.sym} step={500} hint={`Implied remaining term: ${fmtTime(months)}`}/>
      <MoneyIn label="Lump sum available now (optional)" value={lumpSum} onChange={setLumpSum} sym={C.sym} step={10000}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Payoff Strategy Comparison</h3>
      <Table headers={['Strategy','Time','Interest','Total']}
        rows={strategies.map(s => [s.label, fmtTime(s.totalMonths), `${C.sym}${fmtFull(s.interest,0)}`, `${C.sym}${fmtFull(s.total,0)}`])}
        note="Best strategy (fastest payoff) highlighted below."/>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2.5">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Time to clear — visual comparison</p>
        {strategies.map(s => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className={s.label === best.label ? 'font-bold text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}>{s.label}{s.label === best.label ? ' 🏆' : ''}</span>
              <span className="text-gray-400">{fmtTime(s.totalMonths)}</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.label === best.label ? 'bg-teal-500' : 'bg-orange-400'}`} style={{ width: `${(s.totalMonths / maxMonths) * 100}%` }}/>
            </div>
          </div>
        ))}
      </div>
      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600 mb-0">Best strategy saves you</p>
        <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(Math.max(0, worst.interest - best.interest),2)} <span className="text-base font-semibold">in interest</span></p>
      </div>
    </>}/>
  );
}
