'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcFutureValue } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Toggle, Stat, Table, ViewToggle, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function FutureValueCalc() {
  const [curr, setCurr] = useState('INR');
  const [pv, setPv] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);
  const [pmt, setPmt] = useState(0);
  const [timing, setTiming] = useState<'end' | 'begin'>('end');
  const [view, setView] = useState('table');
  const C = useCurr(curr);

  const r = calcFutureValue(pv, rate, years, pmt, timing);
  const totalInvested = pv + pmt * years;
  const totalInterest = r.fv - totalInvested;

  useEffect(() => {
    saveHistory({
      calcSlug: 'future-value', calcName: 'Future Value Calculator',
      summary: `${C.sym}${fmtFull(pv,0)} over ${years}yr @ ${rate}% = ${C.sym}${fmtFull(r.fv,0)}`,
      inputs: { pv, rate, years, pmt, timing },
    });
  }, [pv, rate, years, pmt, timing]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Present value" value={pv} onChange={setPv} sym={C.sym} step={10000}/>
      <PctIn label="Annual interest rate" value={rate} onChange={setRate} step={0.5}/>
      <NumIn label="Number of years" value={years} onChange={setYears} min={1} max={50}/>
      <MoneyIn label="Annual payment (optional)" value={pmt} onChange={setPmt} sym={C.sym} step={5000}/>
      {pmt > 0 && (
        <div>
          <label className="calc-label">Payment timing</label>
          <Toggle v={timing === 'begin'} a="End of year" b="Beginning of year" onA={() => setTiming('end')} onB={() => setTiming('begin')}/>
        </div>
      )}
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Future Value</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Future value</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.fv,2)}</p>
        </div>
        <Stat label="From lump sum" value={`${C.sym}${fmtFull(r.fvLump,2)}`} color={TC.blue}/>
        <Stat label="From payments" value={`${C.sym}${fmtFull(r.fvPmt,2)}`} color={TC.teal}/>
        <Stat label="Total invested" value={`${C.sym}${fmtFull(totalInvested,2)}`} color={TC.gray}/>
        <Stat label="Total interest" value={`${C.sym}${fmtFull(totalInterest,2)}`} color={TC.green}/>
      </div>
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Value']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.value,2)}`])} note="Illustrative — assumes a constant rate every year."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><LineChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>`${C.sym}${fmtFull(v/1000,0)}K`} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]} labelFormatter={l=>`Year ${l}`}/><Line type="monotone" dataKey="value" name="Value" stroke="#f97316" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Future value',v:`${C.sym}${fmtFull(r.fv,2)}`},{l:'From lump sum',v:`${C.sym}${fmtFull(r.fvLump,2)}`},{l:'From payments',v:`${C.sym}${fmtFull(r.fvPmt,2)}`},{l:'Total invested',v:`${C.sym}${fmtFull(totalInvested,2)}`},{l:'Total interest',v:`${C.sym}${fmtFull(totalInterest,2)}`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
