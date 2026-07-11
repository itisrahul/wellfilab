'use client';
import { useState, useEffect } from 'react';
import { calcTakeHome } from '@/lib/calc';
import { Shell, MoneyIn, PctIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function TakeHomeCalc() {
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(40);
  const [bonus, setBonus] = useState(0);
  const C = useCurr('INR');
  const r = calcTakeHome(ctc, basicPct, bonus);

  useEffect(() => {
    saveHistory({
      calcSlug: 'take-home-salary', calcName: 'Take-Home Salary Calculator',
      summary: `CTC ${C.sym}${fmtFull(ctc,0)} → in-hand ${C.sym}${fmtFull(r.monthlyInHand,0)}/mo`,
      inputs: { ctc, basicPct, bonus },
    });
  }, [ctc, basicPct, bonus]);

  return (
    <Shell
      left={<>
        <MoneyIn label="Annual CTC" value={ctc} onChange={setCtc} sym={C.sym} step={50000}/>
        <PctIn label="Basic salary as % of CTC" value={basicPct} onChange={setBasicPct} step={5}
          hint="Typically 35-50% — check your offer letter for the exact figure"/>
        <MoneyIn label="Annual bonus / variable pay" value={bonus} onChange={setBonus} sym={C.sym} step={10000}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Estimated take-home pay
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Monthly in-hand (estimate)</p>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.monthlyInHand, 0)}</p>
          </div>
          <Stat label="Basic salary" value={`${C.sym}${fmtFull(r.basic,0)}/yr`} color={TC.gray}/>
          <Stat label="Est. HRA" value={`${C.sym}${fmtFull(r.hra,0)}/yr`} color={TC.gray}/>
          <Stat label="Monthly PF deduction" value={`${C.sym}${fmtFull(r.monthlyPF,0)}`} color={TC.orange}/>
          <Stat label="Est. monthly tax" value={`${C.sym}${fmtFull(r.estimatedMonthlyTax,0)}`} color={TC.orange}/>
        </div>
        <Box icon="⚠️ Rough estimate only" color="orange"
          text="This is a simplified breakup for quick comparison between offers — actual in-hand pay depends on your specific tax regime, deductions claimed, employer PF policy, gratuity, and other components in your offer letter. Use the Income Tax Calculator alongside this for a more accurate tax figure."/>
      </>}
    />
  );
}
