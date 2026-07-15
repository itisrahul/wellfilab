'use client';
import { useState, useEffect } from 'react';
import { calcRefinance } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function MortgageRefinanceCalc() {
  const [curr, setCurr] = useState('INR');
  const [balance, setBalance] = useState(3000000);
  const [currentRate, setCurrentRate] = useState(9.5);
  const [monthsLeft, setMonthsLeft] = useState(180);
  const [newRate, setNewRate] = useState(8.2);
  const [newYears, setNewYears] = useState(15);
  const [closingCosts, setClosingCosts] = useState(50000);
  const C = useCurr(curr);

  const r = calcRefinance(balance, currentRate, monthsLeft, newRate, newYears, closingCosts);

  const verdict = r.neverBreaksEven
    ? { icon: '❌', label: 'Not worth it', text: 'This refinance does not lower your monthly payment enough to ever recover the closing costs.', color: 'red' as const }
    : r.breakEvenMonths < 24
    ? { icon: '✅', label: 'Good idea', text: `Breaks even in ${r.breakEvenMonths} months — well worth it if you plan to stay in the home longer than that.`, color: 'green' as const }
    : r.breakEvenMonths <= 48
    ? { icon: '⚠️', label: 'Moderate', text: `Breaks even in ${r.breakEvenMonths} months. Worth it only if you're confident you'll stay that long.`, color: 'orange' as const }
    : { icon: '❌', label: 'May not be worth it', text: `Breaks even only after ${r.breakEvenMonths} months — a long time to recover the closing costs.`, color: 'red' as const };

  useEffect(() => {
    saveHistory({
      calcSlug: 'mortgage-refinance', calcName: 'Mortgage Refinance',
      summary: `${C.sym}${fmtFull(r.monthlySavings,0)}/mo savings — ${r.neverBreaksEven ? 'never breaks even' : `breaks even in ${r.breakEvenMonths}mo`}`,
      inputs: { balance, currentRate, monthsLeft, newRate, newYears, closingCosts },
    });
  }, [balance, currentRate, monthsLeft, newRate, newYears, closingCosts]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Current loan balance" value={balance} onChange={setBalance} sym={C.sym} step={50000}/>
      <PctIn label="Current interest rate" value={currentRate} onChange={setCurrentRate} step={0.1}/>
      <NumIn label="Months remaining" value={monthsLeft} onChange={setMonthsLeft} min={1} max={480}/>
      <PctIn label="New interest rate" value={newRate} onChange={setNewRate} step={0.1}/>
      <NumIn label="New loan term (years)" value={newYears} onChange={setNewYears} min={1} max={30}/>
      <MoneyIn label="Closing / processing costs" value={closingCosts} onChange={setClosingCosts} sym={C.sym} step={5000}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Should You Refinance?</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Current EMI" value={`${C.sym}${fmtFull(r.currentEMI,2)}`} color={TC.gray}/>
        <Stat label="New EMI" value={`${C.sym}${fmtFull(r.newEMI,2)}`} color={TC.teal}/>
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Monthly savings</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.monthlySavings,2)}</p>
        </div>
        <Stat label="Break-even" value={r.neverBreaksEven ? 'Never' : `${r.breakEvenMonths} months`} color={r.neverBreaksEven ? TC.red : TC.blue}/>
        <Stat label="Total savings over life" value={`${C.sym}${fmtFull(r.totalSavings,2)}`} color={r.totalSavings > 0 ? TC.green : TC.red}/>
      </div>
      <Box icon={`${verdict.icon} ${verdict.label}`} color={verdict.color} text={verdict.text}/>
    </>}/>
  );
}
