'use client';
import { useState, useEffect } from 'react';
import { calcTermInsurance } from '@/lib/calc';
import { Shell, MoneyIn, NumIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function TermInsuranceCalc() {
  const [income, setIncome] = useState(800000);
  const [years, setYears] = useState(20);
  const [loans, setLoans] = useState(2000000);
  const [savings, setSavings] = useState(500000);
  const [dependents, setDependents] = useState(2);
  const C = useCurr('INR');
  const r = calcTermInsurance(income, years, loans, savings, dependents);

  useEffect(() => {
    saveHistory({
      calcSlug: 'term-insurance', calcName: 'Term Insurance Calculator',
      summary: `Recommended cover: ${C.sym}${fmtFull(r.recommendedCover,0)}`,
      inputs: { income, years, loans, savings, dependents },
    });
  }, [income, years, loans, savings, dependents]);

  return (
    <Shell
      left={<>
        <MoneyIn label="Annual income" value={income} onChange={setIncome} sym={C.sym} step={50000}/>
        <NumIn label="Years of income to replace" value={years} onChange={setYears} min={5} max={35}
          hint="Typically until your youngest dependent becomes financially independent"/>
        <MoneyIn label="Outstanding loans (home, car, etc.)" value={loans} onChange={setLoans} sym={C.sym} step={100000}/>
        <MoneyIn label="Existing savings & investments" value={savings} onChange={setSavings} sym={C.sym} step={50000}/>
        <NumIn label="Number of dependents" value={dependents} onChange={setDependents} min={0} max={6}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Recommended term cover
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Recommended sum assured</p>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.recommendedCover, 0)}</p>
          </div>
          <Stat label="Income replacement need" value={`${C.sym}${fmtFull(r.incomeReplacement,0)}`} color={TC.gray}/>
          <Stat label="Total need (before savings)" value={`${C.sym}${fmtFull(r.totalNeed,0)}`} color={TC.gray}/>
        </div>
        <Box icon="💡 Human Life Value method" color="orange"
          text="This estimates the cover needed to replace your income for your dependents, plus clear outstanding debts, minus what you've already saved. A common rule of thumb is 10-15x annual income, but this method accounts for your specific liabilities and dependents rather than a flat multiple."/>
      </>}
    />
  );
}
