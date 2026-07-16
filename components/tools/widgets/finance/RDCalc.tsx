'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcRD } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const TAX_SLABS = [0, 5, 10, 15, 20, 30];

export default function RDCalc() {
  const [curr, setCurr] = useState('INR');
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(6.7);
  const [months, setMonths] = useState(24);
  const [taxSlab, setTaxSlab] = useState(0);
  const C = useCurr(curr);
  const r = calcRD(monthly, rate, months);
  const taxOnInterest = Math.round(r.interest * taxSlab / 100);
  const postTaxInterest = r.interest - taxOnInterest;
  const postTaxMaturity = r.invested + postTaxInterest;

  useEffect(() => {
    saveHistory({
      calcSlug: 'rd', calcName: 'Recurring Deposit Calculator',
      summary: `${C.sym}${fmtFull(monthly,0)}/mo for ${months}mo = ${C.sym}${fmtFull(r.maturity,0)}`,
      inputs: { monthly, rate, months, taxSlab },
    });
  }, [monthly, rate, months, taxSlab]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Monthly deposit" value={monthly} onChange={setMonthly} sym={C.sym} step={500}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.05}/>
        <NumIn label="Tenure (months)" value={months} onChange={setMonths} min={6} max={120}/>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="calc-label">Your income tax slab</label>
          <div className="flex flex-wrap gap-1.5">
            {TAX_SLABS.map(v=><button key={v} onClick={()=>setTaxSlab(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${taxSlab===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v}%</button>)}
          </div>
        </div>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          RD maturity in {months} months
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Maturity value</p>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.maturity, C.sym)}</span>
            </div>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.maturity, 2)}</p>
          </div>
          <Stat label="Total deposited" value={`${C.sym}${fmtFull(r.invested,2)}`} color={TC.gray}/>
          <Stat label="Interest earned" value={`${C.sym}${fmtFull(r.interest,2)}`} color={TC.green}/>
        </div>
        {taxSlab > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Post-tax return at {taxSlab}% slab</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Tax on interest" value={`${C.sym}${fmtFull(taxOnInterest,2)}`} color={TC.red}/>
              <Stat label="Post-tax maturity" value={`${C.sym}${fmtFull(postTaxMaturity,2)}`} color={TC.green}/>
            </div>
          </div>
        )}
        <Box icon="💡 RD vs SIP" color="orange"
          text="RDs offer guaranteed, fixed returns with zero market risk — ideal for short-term goals. A SIP in equity mutual funds has historically returned more over 5+ years, but with volatility RDs don't have. RD interest is fully taxable at your slab rate — select it above to see your real post-tax return."/>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Growth over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month" tick={{fontSize:11}} label={{value:'Month',position:'insideBottomRight',offset:-5,fontSize:11}}/>
              <YAxis tickFormatter={v=>fmtSmart(v,C.sym)} tick={{fontSize:10}} width={70}/>
              <Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,0)}`,undefined]} labelFormatter={l=>`Month ${l}`}/>
              <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>}
    />
  );
}
