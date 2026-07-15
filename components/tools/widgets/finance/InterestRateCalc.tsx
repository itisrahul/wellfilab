'use client';
import { useState, useEffect } from 'react';
import { calcInterestRate } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, NumIn, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const BENCHMARKS = [
  { label: 'FD rate', rate: 7 },
  { label: 'PPF rate', rate: 7.1 },
  { label: 'Nifty 50 avg', rate: 12 },
];

export default function InterestRateCalc() {
  const [curr, setCurr] = useState('INR');
  const [pv, setPv] = useState(100000);
  const [fv, setFv] = useState(200000);
  const [years, setYears] = useState(5);
  const [pmt, setPmt] = useState(0);
  const C = useCurr(curr);

  const r = calcInterestRate(pv, fv, Math.max(1, years), pmt);
  const doublingYears = r.annualRate > 0 ? +(72 / r.annualRate).toFixed(1) : null;

  useEffect(() => {
    saveHistory({
      calcSlug: 'interest-rate', calcName: 'Interest Rate Calculator',
      summary: `${C.sym}${fmtFull(pv,0)} → ${C.sym}${fmtFull(fv,0)} in ${years}yr needs ${r.annualRate}% return`,
      inputs: { pv, fv, years, pmt },
    });
  }, [pv, fv, years, pmt]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Present value" value={pv} onChange={setPv} sym={C.sym} step={10000}/>
      <MoneyIn label="Future value (goal)" value={fv} onChange={setFv} sym={C.sym} step={10000}/>
      <NumIn label="Time in years" value={years} onChange={setYears} min={1} max={50}/>
      <MoneyIn label="Monthly contribution (optional)" value={pmt} onChange={setPmt} sym={C.sym} step={1000}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Required Rate of Return</h3>
      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600 mb-0">Annual interest rate needed</p>
        <p className="calc-num-lg text-orange-500">{fmtFull(r.annualRate)}%</p>
        <p className="text-xs text-gray-400 mt-1">Monthly rate: {fmtFull(r.monthlyRate)}%</p>
      </div>
      {doublingYears != null && (
        <Box icon="💡 Rule of 72" text={`At ${fmtFull(r.annualRate)}%, money doubles roughly every ${doublingYears} years (72 ÷ rate).`}/>
      )}
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Compare to benchmarks</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full breakdown-table">
            <thead><tr><th className="bg-gray-700">Rate type</th><th className="bg-orange-500">Rate</th><th className="bg-teal-600">Will you achieve?</th></tr></thead>
            <tbody>
              {BENCHMARKS.map(b => (
                <tr key={b.label}>
                  <td className="calc-num-sm text-gray-700 dark:text-gray-300">{b.label}</td>
                  <td className="calc-num-sm text-right text-gray-800 dark:text-gray-100">{b.rate}%</td>
                  <td className="calc-num-sm text-right">{b.rate >= r.annualRate ? '✅' : '❌'}</td>
                </tr>
              ))}
              <tr className="font-bold bg-orange-50 dark:bg-orange-950/20">
                <td className="calc-num-sm text-gray-700 dark:text-gray-300">Your target</td>
                <td className="calc-num-sm text-right text-gray-800 dark:text-gray-100">{fmtFull(r.annualRate)}%</td>
                <td className="calc-num-sm text-right text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>}/>
  );
}
