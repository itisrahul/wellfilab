'use client';
import { useState, useEffect } from 'react';
import { calcAPY } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const FREQUENCIES = [
  { label: 'Daily', n: 365 },
  { label: 'Weekly', n: 52 },
  { label: 'Monthly', n: 12 },
  { label: 'Quarterly', n: 4 },
  { label: 'Semi-annual', n: 2 },
  { label: 'Annual', n: 1 },
];

export default function APYCalc() {
  const [curr, setCurr] = useState('INR');
  const [apr, setApr] = useState(8);
  const [freq, setFreq] = useState(365);
  const [principal, setPrincipal] = useState(100000);
  const [years, setYears] = useState(5);
  const C = useCurr(curr);

  const r = calcAPY(apr, freq);
  const finalAmount = Math.round(principal * Math.pow(1 + r.apy / 100, years));
  const interest = finalAmount - principal;

  useEffect(() => {
    saveHistory({
      calcSlug: 'apy', calcName: 'APY Calculator',
      summary: `${apr}% APR compounded ${FREQUENCIES.find(f => f.n === freq)?.label.toLowerCase()} = ${r.apy}% APY`,
      inputs: { apr, freq, principal, years },
    });
  }, [apr, freq, principal, years]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <PctIn label="APR %" value={apr} onChange={setApr} step={0.1}/>
      <div>
        <label className="calc-label">Compounding frequency</label>
        <div className="grid grid-cols-3 gap-1.5">
          {FREQUENCIES.map(f => (
            <button key={f.n} onClick={() => setFreq(f.n)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${freq===f.n?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <MoneyIn label="Principal amount" value={principal} onChange={setPrincipal} sym={C.sym} step={10000}/>
      <NumIn label="Duration (years)" value={years} onChange={setYears} min={1} max={40}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">APR to APY Conversion</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 mb-0">APY</p>
          </div>
          <p className="calc-num-lg text-orange-500">{fmtFull(r.apy)}%</p>
        </div>
        <Stat label="Final amount" value={`${C.sym}${fmtFull(finalAmount,2)}`} color={TC.blue}/>
        <Stat label="Interest earned" value={`${C.sym}${fmtFull(interest,2)}`} color={TC.green}/>
        <Stat label="Daily-equivalent APY" value={`${fmtFull(r.daily)}%`} color={TC.gray}/>
        <Stat label="Monthly-equivalent APY" value={`${fmtFull(r.monthly)}%`} color={TC.gray}/>
      </div>
      <Box icon="💡 APY vs APR" text="APY is always higher than APR because of compounding. An 8% APR compounded daily works out to about 8.33% APY. Always compare APY, not APR, when choosing between savings accounts."/>
    </>}/>
  );
}
