'use client';
import { useState, useEffect } from 'react';
import { calcSimpleInterest, calcCompound } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function SimpleInterestCalc() {
  const [curr, setCurr] = useState('INR');
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const C = useCurr(curr);
  const r = calcSimpleInterest(principal, rate, years);
  const compound = calcCompound(principal, rate, years, 1, 0, 0, 0);

  useEffect(() => {
    saveHistory({
      calcSlug: 'simple-interest', calcName: 'Simple Interest Calculator',
      summary: `${C.sym}${fmtFull(principal,0)} @ ${rate}% for ${years}yr = ${C.sym}${fmtFull(r.total,0)}`,
      inputs: { principal, rate, years },
    });
  }, [principal, rate, years]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Principal amount" value={principal} onChange={setPrincipal} sym={C.sym} step={10000}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.5}/>
        <NumIn label="Time period (years)" value={years} onChange={setYears} min={1} max={30}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Simple interest over {years} years
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Interest earned" value={`${C.sym}${fmtFull(r.interest,2)}`} color={TC.green}/>
          <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Total amount</p>
            <p className="calc-num-md text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.total, 2)}</p>
          </div>
        </div>
        <Box icon="📊 vs Compound interest" color="orange"
          text={`The same ${C.sym}${fmtFull(principal,0)} at ${rate}% compounded annually for ${years} years would grow to ${C.sym}${fmtFull(compound.final,0)} — ${C.sym}${fmtFull(compound.final - r.total,0)} more than simple interest, purely from earning interest on interest.`}/>
      </>}
    />
  );
}
