'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcCAGR } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, NumIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CAGRCalc() {
  const [curr, setCurr] = useState('INR');
  const [startVal, setStartVal] = useState(100000);
  const [endVal, setEndVal] = useState(250000);
  const [years, setYears] = useState(5);
  const [view, setView] = useState('table');
  const C = useCurr(curr);

  const r = calcCAGR(Math.max(1, startVal), endVal, Math.max(1, years));
  const oneL = (yrs: number) => Math.round(100000 * Math.pow(1 + r.cagr / 100, yrs));

  useEffect(() => {
    saveHistory({
      calcSlug: 'cagr', calcName: 'CAGR Calculator',
      summary: `${C.sym}${fmtFull(startVal,0)} → ${C.sym}${fmtFull(endVal,0)} over ${years}yr = ${r.cagr}% CAGR`,
      inputs: { startVal, endVal, years },
    });
  }, [startVal, endVal, years]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Initial value" value={startVal} onChange={setStartVal} sym={C.sym} step={10000}/>
      <MoneyIn label="Final value" value={endVal} onChange={setEndVal} sym={C.sym} step={10000}/>
      <NumIn label="Number of years" value={years} onChange={setYears} min={1} max={50}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Compound Annual Growth Rate</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 mb-0">CAGR</p>
          </div>
          <p className="calc-num-lg text-orange-500">{fmtFull(r.cagr)}%</p>
        </div>
        <Stat label="Total gain" value={`${C.sym}${fmtFull(r.gain,2)}`} color={TC.green}/>
        <Stat label="Absolute return" value={`${fmtFull(r.absoluteReturn)}%`} color={TC.blue}/>
        <Stat label="Final value" value={`${C.sym}${fmtFull(endVal,2)}`} color={TC.gray}/>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">What {C.sym}1L grows to at this CAGR</p>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="5 years" value={`${C.sym}${fmtFull(oneL(5),0)}`} color={TC.teal}/>
          <Stat label="10 years" value={`${C.sym}${fmtFull(oneL(10),0)}`} color={TC.teal}/>
          <Stat label="20 years" value={`${C.sym}${fmtFull(oneL(20),0)}`} color={TC.teal}/>
        </div>
      </div>
      <Box icon="💡 What is CAGR?" text="CAGR smooths out yearly volatility to show the steady rate of growth. Mutual fund returns are always shown as CAGR — it's the number that lets you fairly compare two investments with a bumpy year-to-year ride."/>
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Value']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.value,2)}`])} note="Assumes a smooth, constant growth rate every year."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><LineChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>`${C.sym}${fmtFull(v/1000,0)}K`} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]} labelFormatter={l=>`Year ${l}`}/><Line type="monotone" dataKey="value" name="Value" stroke="#f97316" strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'CAGR',v:`${fmtFull(r.cagr)}%`},{l:'Absolute return',v:`${fmtFull(r.absoluteReturn)}%`},{l:'Initial value',v:`${C.sym}${fmtFull(startVal,2)}`},{l:'Final value',v:`${C.sym}${fmtFull(endVal,2)}`},{l:'Total gain',v:`${C.sym}${fmtFull(r.gain,2)}`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
