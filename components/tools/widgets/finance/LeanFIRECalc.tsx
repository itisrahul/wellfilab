'use client';
import { useState, useEffect } from 'react';
import { calcLeanFIRE } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function LeanFIRECalc() {
  const [curr, setCurr] = useState('INR');
  const [annualExp, setAnnualExp] = useState(600000);
  const [leanPct, setLeanPct] = useState(25);
  const [portfolio, setPortfolio] = useState(500000);
  const [monthly, setMonthly] = useState(30000);
  const [roi, setRoi] = useState(11);
  const C = useCurr(curr);
  const r = calcLeanFIRE(annualExp, leanPct, portfolio, monthly, roi);

  useEffect(() => {
    saveHistory({
      calcSlug: 'lean-fire', calcName: 'Lean FIRE Calculator',
      summary: `Lean FIRE number ${C.sym}${fmtFull(r.fireNumber,0)} — ${r.years}yr ${r.remMonths}mo away`,
      inputs: { annualExp, leanPct, portfolio, monthly, roi },
    });
  }, [annualExp, leanPct, portfolio, monthly, roi]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Current annual expenses" value={annualExp} onChange={setAnnualExp} sym={C.sym} step={50000}/>
        <PctIn label="Lean cut % (vs current spending)" value={leanPct} onChange={setLeanPct} step={5}
          hint={`Lean target: ${C.sym}${fmtFull(annualExp*(1-leanPct/100),0)}/year`}/>
        <MoneyIn label="Current portfolio" value={portfolio} onChange={setPortfolio} sym={C.sym} step={50000}/>
        <MoneyIn label="Monthly investment" value={monthly} onChange={setMonthly} sym={C.sym} step={2000}/>
        <PctIn label="Expected return %" value={roi} onChange={setRoi} step={0.5}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Your Lean FIRE number
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Lean FIRE number</p>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.fireNumber, C.sym)}</span>
            </div>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.fireNumber, 0)}</p>
          </div>
          <Stat label="Lean annual expenses" value={`${C.sym}${fmtFull(r.leanExp,0)}`} color={TC.gray}/>
          <Stat label="Time to reach it" value={`${r.years}y ${r.remMonths}m`} color={TC.green}/>
        </div>
        <Box icon="💡 What is Lean FIRE?" color="orange"
          text="Lean FIRE means reaching financial independence on a deliberately minimal, frugal budget — trading some lifestyle comfort for an earlier exit from full-time work. It uses the same 25x-expenses rule as standard FIRE, just applied to a smaller expense base."/>
      </>}
    />
  );
}
