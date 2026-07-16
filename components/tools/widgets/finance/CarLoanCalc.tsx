'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcCarLoan } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CarLoanCalc() {
  const [curr, setCurr] = useState('INR');
  const [price, setPrice] = useState(1000000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(5);
  const [extra, setExtra] = useState(0);
  const [view, setView] = useState('table');
  const C = useCurr(curr);
  const r = calcCarLoan(price, downPct, rate, years, extra);
  const base = calcCarLoan(price, downPct, rate, years, 0);
  const saved = base.interest - r.interest;
  const moSaved = base.totalMonths - r.totalMonths;

  useEffect(() => {
    saveHistory({
      calcSlug: 'car-loan', calcName: 'Car Loan Calculator',
      summary: `${C.sym}${fmtFull(price,0)} car, EMI ${C.sym}${fmtFull(r.emi,0)}/mo`,
      inputs: { price, downPct, rate, years, extra },
    });
  }, [price, downPct, rate, years, extra]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Car price (on-road)" value={price} onChange={setPrice} sym={C.sym} step={50000}/>
        <PctIn label="Down payment %" value={downPct} onChange={setDownPct} step={5}
          hint={`= ${C.sym}${fmtFull(r.downPayment,0)} upfront`}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.25}/>
        <NumIn label="Loan tenure (years)" value={years} onChange={setYears} min={1} max={8}/>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <MoneyIn label="Extra monthly payment" value={extra} onChange={setExtra} sym={C.sym} step={1000}
            hint={extra>0&&saved>0?`Saves ${C.sym}${fmtFull(saved,2)} · ${Math.floor(moSaved/12)}y ${moSaved%12}m shorter`:'Enter extra to see impact'}/>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[0,1000,2500,5000].map(v=><button key={v} onClick={()=>setExtra(v)} className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${extra===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v===0?'None':`+${C.sym}${fmtFull(v,0)}`}</button>)}
          </div>
        </div>
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
          <Stat label="Paid off in" value={extra>0?`${Math.floor(r.totalMonths/12)}y ${r.totalMonths%12}m`:`${years}y`} color={TC.teal}/>
          <Stat label="Est. value at payoff" value={`${C.sym}${fmtFull(r.depreciatedValue,0)}`} color={TC.red}/>
        </div>
        {extra>0&&saved>0?<Box icon={`💡 Extra ${C.sym}${fmtFull(extra,2)}/mo saves ${C.sym}${fmtFull(saved,2)}`} text={`Paying extra each month cuts your loan by ${Math.floor(moSaved/12)}y ${moSaved%12}m and saves ${C.sym}${fmtFull(saved,2)} in interest.`} color="orange"/>
        :<Box icon="⚠️ Cars depreciate, loans don't" color="orange"
          text={`Your car is estimated to be worth roughly ${C.sym}${fmtFull(r.depreciatedValue,0)} after ${years} years (typical 15-20%/year depreciation), but your loan principal reduces on a fixed schedule. A car loan longer than 5 years often means owing more than the car is worth for much of the tenure.`}/>}
        <ViewToggle v={view} onChange={setView}/>
        {view==='table'&&<Table headers={['Year','Principal','Interest','Balance']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.principal,2)}`,`${C.sym}${fmtFull(row.interest,2)}`,`${C.sym}${fmtFull(row.balance,2)}`])} note="Yearly amortization schedule."/>}
        {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={[{name:'Principal',value:r.principal},{name:'Interest',value:r.interest}]} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value"><Cell fill="#0d9488"/><Cell fill="#f97316"/></Pie><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]}/><Legend/></PieChart></ResponsiveContainer></div>}
        {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Car Price',v:`${C.sym}${fmtFull(price,2)}`},{l:'Down Payment',v:`${C.sym}${fmtFull(r.downPayment,2)}`},{l:'Loan Amount',v:`${C.sym}${fmtFull(r.principal,2)}`},{l:'Monthly EMI',v:`${C.sym}${fmtFull(r.emi,2)}`},{l:'Total Interest',v:`${C.sym}${fmtFull(r.interest,2)}`},{l:'Total Payable',v:`${C.sym}${fmtFull(r.total,2)}`},{l:'Tenure',v:extra>0?`${Math.floor(r.totalMonths/12)}y ${r.totalMonths%12}m`:`${years}y`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
      </>}
    />
  );
}
