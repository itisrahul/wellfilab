'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcPPF } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function PPFCalc() {
  const [curr, setCurr] = useState('INR');
  const [yearly, setYearly] = useState(150000);
  const [rate, setRate] = useState(7.1);
  const C = useCurr(curr);
  const r = calcPPF(yearly, rate, 15);

  useEffect(() => {
    saveHistory({
      calcSlug: 'ppf', calcName: 'PPF Calculator',
      summary: `${C.sym}${fmtFull(yearly,0)}/yr for 15yr = ${C.sym}${fmtFull(r.maturity,0)}`,
      inputs: { yearly, rate },
    });
  }, [yearly, rate]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Yearly deposit" value={yearly} onChange={setYearly} sym={C.sym} step={5000}
          hint="PPF annual deposit limit is ₹1,50,000"/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.1}
          hint="Government-revised quarterly. Current rate: 7.1%"/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          PPF maturity after 15 years
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Maturity value (tax-free)</p>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.maturity, C.sym)}</span>
            </div>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.maturity, 2)}</p>
          </div>
          <Stat label="Total invested" value={`${C.sym}${fmtFull(r.invested,2)}`} color={TC.gray}/>
          <Stat label="Interest earned" value={`${C.sym}${fmtFull(r.interest,2)}`} color={TC.green}/>
        </div>
        <Box icon="💡 EEE tax status" color="orange"
          text="PPF has Exempt-Exempt-Exempt (EEE) tax status: contributions qualify for Section 80C deduction, interest earned is tax-free, and maturity proceeds are tax-free. It has a mandatory 15-year lock-in, extendable in 5-year blocks."/>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Balance growth over 15 years</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="year" tick={{fontSize:11}}/>
              <YAxis tickFormatter={v=>fmtSmart(v,C.sym)} tick={{fontSize:10}} width={70}/>
              <Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,0)}`,undefined]} labelFormatter={l=>`Year ${l}`}/>
              <Line type="monotone" dataKey="balance" stroke="#f97316" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>}
    />
  );
}
