'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcMoneyLast } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function MoneyLastCalc() {
  const [curr,setCurr]=useState('INR'),[savings,setSavings]=useState(5000000),[wd,setWd]=useState(25000),[rate,setRate]=useState(8),[inf,setInf]=useState(6),[view,setView]=useState('table');
  const C=useCurr(curr); const r=calcMoneyLast(savings,wd,rate,inf);
  const wdRate=+(wd*12/savings*100).toFixed(2);
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Total savings" value={savings} onChange={setSavings} sym={C.sym} step={100000}/>
      <MoneyIn label="Monthly withdrawal" value={wd} onChange={setWd} sym={C.sym} step={1000} hint={wdRate+"% annual withdrawal rate"}/>
      <PctIn label="Investment return rate" value={rate} onChange={setRate} step={0.5}/>
      <PctIn label="Annual inflation rate" value={inf} onChange={setInf} step={0.5}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">How long will {C.sym+fmtFull(savings,2)} last?</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className={`result-card col-span-2 md:col-span-1 ${r.forever?'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800':'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'}`}>
          <p className={`result-label ${r.forever?'text-green-600':'text-orange-600'}`}>Money lasts</p>
          <p className={`calc-num-lg ${r.forever?'text-green-600 dark:text-green-400':'text-orange-500'}`}>{r.forever?'Forever ♾️':`${r.years}y ${r.remMonths}m`}</p>
        </div>
        <Stat label="Annual withdrawal" value={C.sym+fmtFull(wd*12,2)} color={TC.gray}/>
        <Stat label="Withdrawal rate" value={wdRate+"% p.a."} color={+wdRate>5?TC.red:TC.green}/>
        <Stat label="4% rule sustainable limit" value={C.sym+fmtFull(Math.round(savings*0.04/12),2)+'/mo'} color={TC.teal}/>
      </div>
      {r.forever?<Box icon="✅ Sustainable!" text={"At "+rate+"% return and "+C.sym+fmtFull(wd,2)+"/month withdrawal, your portfolio grows faster than you spend — it lasts indefinitely."} color="green"/>:<Box icon="⚠️ Consider adjustments" text={"To make money last indefinitely: reduce withdrawal to "+C.sym+fmtFull(Math.round(savings*0.04/12),2)+"/month (4% rule), or grow portfolio to "+C.sym+fmtFull(Math.round(wd*12*25),2)+" (25× annual withdrawal)."} color="orange"/>}
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Balance','Monthly Withdrawal']} rows={r.rows.map(row=>[row.year,C.sym+fmtFull(row.balance,2),C.sym+fmtFull(row.withdrawal,2)])} note={r.forever?'100-year projection. Balance keeps growing.':'Until funds run out.'}/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={240}><AreaChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}><defs><linearGradient id="mlg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/><stop offset="95%" stopColor="#0d9488" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>C.sym+fmtFull(v/100000,0)+'L'} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[C.sym+fmtFull(v,2),undefined]} labelFormatter={l=>`Year ${l}`}/><Area type="monotone" dataKey="balance" name="Balance" stroke="#0d9488" fill="url(#mlg)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>}
    </>}/>
  );
}