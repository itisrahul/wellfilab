'use client';
import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcLoan } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, TC } from '@/components/tools/shared';

export default function LoanCalc() {
  const [curr, setCurr] = useState('INR');
  const [p, setP]       = useState(2000000);
  const [rate, setRate] = useState(8.5);
  const [yrs, setYrs]   = useState(20);
  const [extra, setExtra] = useState(0);
  const [view, setView]   = useState('table');
  const C    = useCurr(curr);
  const r    = calcLoan(p, rate, yrs * 12, extra);
  const base = calcLoan(p, rate, yrs * 12, 0);
  const saved    = base.interest - r.interest;
  const moSaved  = base.totalMonths - r.totalMonths;
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Loan amount" value={p} onChange={setP} sym={C.sym} step={100000}/>
      <div className="grid grid-cols-2 gap-3">
        <PctIn label="Annual interest %" value={rate} onChange={setRate} step={0.05}/>
        <NumIn label="Loan term (years)" value={yrs} onChange={setYrs} min={1} max={30}/>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[5,10,15,20,25,30].map(y=><button key={y} onClick={()=>setYrs(y)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${yrs===y?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{y}Y</button>)}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <MoneyIn label="Extra monthly payment" value={extra} onChange={setExtra} sym={C.sym} step={1000}
          hint={extra>0&&saved>0?`Saves ${C.sym}${fmtFull(saved,2)} · ${Math.floor(moSaved/12)}y ${moSaved%12}m shorter`:'Enter extra to see impact'}/>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[0,2000,5000,10000].map(v=><button key={v} onClick={()=>setExtra(v)} className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${extra===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v===0?'None':`+${C.sym}${fmtFull(v,0)}`}</button>)}
        </div>
      </div>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">Loan of {C.sym}{fmtFull(p,2)} at {rate}%</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 dark:text-orange-400">Monthly EMI</p>
          <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.emi,2)}</p>
        </div>
        <div className="result-card col-span-2 md:col-span-1">
          <p className="result-label">Total interest payable</p>
          <p className="calc-num-lg text-red-500">{C.sym}{fmtFull(r.interest,2)}</p>
        </div>
        <Stat label="Total payable" value={`${C.sym}${fmtFull(r.interest+p,2)}`} color={TC.gray}/>
        <Stat label="Paid off in" value={extra>0?`${Math.floor(r.totalMonths/12)}y ${r.totalMonths%12}m`:`${yrs}y`} color={TC.teal}/>
      </div>
      {extra>0&&saved>0?<Box icon={`💡 Extra ${C.sym}${fmtFull(extra,2)}/mo saves ${C.sym}${fmtFull(saved,2)}`} text={`Paying extra each month cuts your loan by ${Math.floor(moSaved/12)} years ${moSaved%12} months and saves ${C.sym}${fmtFull(saved,2)} in total interest.`} color="orange"/>
      :<Box icon="💡 Try the extra payment box" text={`Even a small extra payment can save lakhs over a 20-year loan. Try entering an amount above.`}/>}
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Principal','Interest','Balance']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.principal,2)}`,`${C.sym}${fmtFull(row.interest,2)}`,`${C.sym}${fmtFull(row.balance,2)}`])} note="Yearly amortization schedule."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={[{name:'Principal',value:p},{name:'Interest',value:r.interest}]} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value"><Cell fill="#0d9488"/><Cell fill="#f97316"/></Pie><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]}/><Legend/></PieChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Loan Amount',v:`${C.sym}${fmtFull(p,2)}`},{l:'Monthly EMI',v:`${C.sym}${fmtFull(r.emi,2)}`},{l:'Total Interest',v:`${C.sym}${fmtFull(r.interest,2)}`},{l:'Total Cost',v:`${C.sym}${fmtFull(r.interest+p,2)}`},{l:'Interest Ratio',v:+(r.interest/(r.interest+p)*100).toFixed(2)+'%'},{l:'Tenure',v:extra>0?`${Math.floor(r.totalMonths/12)}y ${r.totalMonths%12}m`:`${yrs}y`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
