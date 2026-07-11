'use client';
import { useState, useEffect } from 'react';
import { calcCarLoan } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CarLoanCalc() {
  const [curr, setCurr] = useState('INR');
  const [price, setPrice] = useState(1000000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(5);
  const C = useCurr(curr);
  const r = calcCarLoan(price, downPct, rate, years);

  useEffect(() => {
    saveHistory({
      calcSlug: 'car-loan', calcName: 'Car Loan Calculator',
      summary: `${C.sym}${fmtFull(price,0)} car, EMI ${C.sym}${fmtFull(r.emi,0)}/mo`,
      inputs: { price, downPct, rate, years },
    });
  }, [price, downPct, rate, years]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Car price (on-road)" value={price} onChange={setPrice} sym={C.sym} step={50000}/>
        <PctIn label="Down payment %" value={downPct} onChange={setDownPct} step={5}
          hint={`= ${C.sym}${fmtFull(r.downPayment,0)} upfront`}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.25}/>
        <NumIn label="Loan tenure (years)" value={years} onChange={setYears} min={1} max={8}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Car loan of {C.sym}{fmtFull(r.principal,0)}
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
        <Box icon="⚠️ Cars depreciate, loans don't" color="orange"
          text={`Your car is estimated to be worth roughly ${C.sym}${fmtFull(r.depreciatedValue,0)} after ${years} years (typical 15-20%/year depreciation), but your loan principal reduces on a fixed schedule. A car loan longer than 5 years often means owing more than the car is worth for much of the tenure.`}/>
      </>}
    />
  );
}
