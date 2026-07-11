'use client';
import { useState, useEffect } from 'react';
import { calcCoastFIRE } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CoastFIRECalc() {
  const [curr, setCurr] = useState('INR');
  const [portfolio, setPortfolio] = useState(2000000);
  const [target, setTarget] = useState(15000000);
  const [years, setYears] = useState(20);
  const [roi, setRoi] = useState(10);
  const C = useCurr(curr);
  const r = calcCoastFIRE(portfolio, target, years, roi);

  useEffect(() => {
    saveHistory({
      calcSlug: 'coast-fire', calcName: 'Coast FIRE Calculator',
      summary: r.isCoastFire ? `You've reached Coast FIRE — projected ${C.sym}${fmtFull(r.projectedAtRetirement,0)}` : `Need ${C.sym}${fmtFull(r.shortfall,0)} more to coast`,
      inputs: { portfolio, target, years, roi },
    });
  }, [portfolio, target, years, roi]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Current portfolio" value={portfolio} onChange={setPortfolio} sym={C.sym} step={100000}/>
        <MoneyIn label="Your target FIRE number" value={target} onChange={setTarget} sym={C.sym} step={500000}
          hint="Use the FIRE Calculator first if you don't know this number"/>
        <NumIn label="Years until retirement" value={years} onChange={setYears} min={1} max={45}/>
        <PctIn label="Expected return %" value={roi} onChange={setRoi} step={0.5}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          {r.isCoastFire ? '🎉 You\'ve reached Coast FIRE' : 'Coast FIRE progress'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={`result-card col-span-2 ${r.isCoastFire ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'}`}>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className={`result-label mb-0 ${r.isCoastFire ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>Projected value at retirement (no more contributions)</p>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${r.isCoastFire ? 'text-green-500 bg-green-100 dark:bg-green-900/40' : 'text-orange-400 bg-orange-100 dark:bg-orange-900/40'}`}>{fmtSmart(r.projectedAtRetirement, C.sym)}</span>
            </div>
            <p className={`calc-num-lg ${r.isCoastFire ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>{C.sym}{fmtFull(r.projectedAtRetirement, 0)}</p>
          </div>
          <Stat label={r.isCoastFire ? 'Surplus over target' : 'Shortfall vs target'} value={`${C.sym}${fmtFull(r.isCoastFire ? r.projectedAtRetirement - target : r.shortfall, 0)}`} color={r.isCoastFire ? TC.green : TC.orange}/>
          <Stat label="Coast number needed today" value={`${C.sym}${fmtFull(r.coastNumberToday,0)}`} color={TC.gray}/>
        </div>
        <Box icon="💡 What is Coast FIRE?" color="orange"
          text="Coast FIRE is the point where your existing investments, left untouched, will grow to your full retirement target by your planned retirement age — purely from compounding, with zero further contributions. Reaching it means you could stop saving (or take a lower-paying, lower-stress job) without derailing your retirement."/>
      </>}
    />
  );
}
