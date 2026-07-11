'use client';
import { useState, useEffect } from 'react';
import { calcPersonalLoan } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function PersonalLoanCalc() {
  const [curr, setCurr] = useState('INR');
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(13);
  const [years, setYears] = useState(3);
  const C = useCurr(curr);
  const r = calcPersonalLoan(principal, rate, years);

  useEffect(() => {
    saveHistory({
      calcSlug: 'personal-loan', calcName: 'Personal Loan Calculator',
      summary: `${C.sym}${fmtFull(principal,0)} @ ${rate}% — EMI ${C.sym}${fmtFull(r.emi,0)}/mo`,
      inputs: { principal, rate, years },
    });
  }, [principal, rate, years]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Loan amount" value={principal} onChange={setPrincipal} sym={C.sym} step={10000}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.5}
          hint="Personal loans are unsecured — typically 10-24% depending on credit profile"/>
        <NumIn label="Tenure (years)" value={years} onChange={setYears} min={1} max={7}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Personal loan of {C.sym}{fmtFull(principal,0)}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Monthly EMI</p>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.emi, C.sym)}</span>
            </div>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.emi, 2)}</p>
          </div>
          <Stat label="Total interest" value={`${C.sym}${fmtFull(r.interest,2)}`} color={TC.gray}/>
          <Stat label="Total payable" value={`${C.sym}${fmtFull(r.total,2)}`} color={TC.gray}/>
        </div>
        <Box icon="⚠️ Highest priority debt" color="orange"
          text="Unsecured personal loans almost always carry a higher rate than home or car loans. If you're carrying multiple debts, this is usually the one to attack first — see the Debt Payoff Calculator to compare strategies."/>
      </>}
    />
  );
}
