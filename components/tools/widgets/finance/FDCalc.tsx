'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcFD } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';
import { useEffect } from 'react';

export default function FDCalc() {
  const [curr, setCurr] = useState('INR');
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(5);
  const C = useCurr(curr);
  const r = calcFD(principal, rate, years);

  useEffect(() => {
    saveHistory({
      calcSlug: 'fd', calcName: 'Fixed Deposit Calculator',
      summary: `${C.sym}${fmtFull(principal,0)} @ ${rate}% for ${years}yr = ${C.sym}${fmtFull(r.maturity,0)}`,
      inputs: { principal, rate, years },
    });
  }, [principal, rate, years]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Deposit amount" value={principal} onChange={setPrincipal} sym={C.sym} step={10000}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.05}
          hint="Quarterly compounding — standard for Indian bank FDs"/>
        <NumIn label="Tenure (years)" value={years} onChange={setYears} min={1} max={10}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          FD maturity in {years} years
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Maturity value</p>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.maturity, C.sym)}</span>
            </div>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.maturity, 2)}</p>
          </div>
          <Stat label="Interest earned" value={`${C.sym}${fmtFull(r.interest,2)}`} color={TC.green}/>
          <Stat label="Principal" value={`${C.sym}${fmtFull(r.invested,2)}`} color={TC.gray}/>
        </div>
        <Box icon="💡 FD interest is fully taxable" color="orange"
          text="Interest earned is added to your income and taxed at your slab rate. TDS of 10% applies if interest exceeds ₹40,000/year (₹50,000 for senior citizens) — submit Form 15G/15H if your total income is below the taxable limit to avoid TDS."/>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Growth over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="year" tick={{fontSize:11}}/>
              <YAxis tickFormatter={v=>fmtSmart(v,C.sym)} tick={{fontSize:10}} width={70}/>
              <Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,0)}`,undefined]} labelFormatter={l=>`Year ${l}`}/>
              <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>}
    />
  );
}
