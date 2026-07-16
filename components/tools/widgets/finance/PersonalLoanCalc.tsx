'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcPersonalLoan } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function PersonalLoanCalc() {
  const [curr, setCurr] = useState('INR');
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(13);
  const [years, setYears] = useState(3);
  const [extra, setExtra] = useState(0);
  const [view, setView] = useState('table');
  const C = useCurr(curr);
  const r = calcPersonalLoan(principal, rate, years, extra);
  const base = calcPersonalLoan(principal, rate, years, 0);
  const saved = base.interest - r.interest;
  const moSaved = base.totalMonths - r.totalMonths;

  useEffect(() => {
    saveHistory({
      calcSlug: 'personal-loan', calcName: 'Personal Loan Calculator',
      summary: `${C.sym}${fmtFull(principal,0)} @ ${rate}% — EMI ${C.sym}${fmtFull(r.emi,0)}/mo`,
      inputs: { principal, rate, years, extra },
    });
  }, [principal, rate, years, extra]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Loan amount" value={principal} onChange={setPrincipal} sym={C.sym} step={10000}/>
        <PctIn label="Interest rate % p.a." value={rate} onChange={setRate} step={0.5}
          hint="Personal loans are unsecured — typically 10-24% depending on credit profile"/>
        <NumIn label="Tenure (years)" value={years} onChange={setYears} min={1} max={7}/>
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
          Personal loan of {C.sym}{fmtFull(principal,0)}
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
        </div>
        {extra>0&&saved>0?<Box icon={`💡 Extra ${C.sym}${fmtFull(extra,2)}/mo saves ${C.sym}${fmtFull(saved,2)}`} text={`Paying extra each month cuts your loan by ${Math.floor(moSaved/12)}y ${moSaved%12}m and saves ${C.sym}${fmtFull(saved,2)} in interest.`} color="orange"/>
        :<Box icon="⚠️ Highest priority debt" color="orange"
          text="Unsecured personal loans almost always carry a higher rate than home or car loans. If you're carrying multiple debts, this is usually the one to attack first — see the Debt Payoff Calculator to compare strategies."/>}
        <ViewToggle v={view} onChange={setView}/>
        {view==='table'&&<Table headers={['Year','Principal','Interest','Balance']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.principal,2)}`,`${C.sym}${fmtFull(row.interest,2)}`,`${C.sym}${fmtFull(row.balance,2)}`])} note="Yearly amortization schedule."/>}
        {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={[{name:'Principal',value:principal},{name:'Interest',value:r.interest}]} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value"><Cell fill="#0d9488"/><Cell fill="#f97316"/></Pie><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]}/><Legend/></PieChart></ResponsiveContainer></div>}
        {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Loan Amount',v:`${C.sym}${fmtFull(principal,2)}`},{l:'Monthly EMI',v:`${C.sym}${fmtFull(r.emi,2)}`},{l:'Total Interest',v:`${C.sym}${fmtFull(r.interest,2)}`},{l:'Total Payable',v:`${C.sym}${fmtFull(r.total,2)}`},{l:'Tenure',v:extra>0?`${Math.floor(r.totalMonths/12)}y ${r.totalMonths%12}m`:`${years}y`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
      </>}
    />
  );
}
