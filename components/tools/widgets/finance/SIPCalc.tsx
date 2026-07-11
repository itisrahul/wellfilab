'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcSIP } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, BigResult, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function SIPCalc() {
  const [curr, setCurr]       = useState('INR');
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate]       = useState(12);
  const [yrs, setYrs]         = useState(15);
  const [stepup, setStepup]   = useState(10);
  const [lump, setLump]       = useState(0);
  const [view, setView]       = useState('table');
  const C    = useCurr(curr);
  const r    = calcSIP(monthly, rate, yrs, stepup, lump);
  const noStep = calcSIP(monthly, rate, yrs, 0, lump);
  const cagr = +(((r.maturity / Math.max(1, r.invested)) ** (1 / Math.max(1, yrs)) - 1) * 100).toFixed(2);

  useEffect(() => {
    saveHistory({
      calcSlug: 'sip', calcName: 'SIP Calculator',
      summary: `${C.sym}${monthly}/mo × ${yrs}yr @ ${rate}% = ${C.sym}${fmtFull(r.maturity, 0)}`,
      inputs: { monthly, rate, yrs, stepup },
    });
  }, [monthly, rate, yrs, stepup, lump]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Monthly contribution" value={monthly} onChange={setMonthly} sym={C.sym} step={500}/>
      <MoneyIn label="One-time lump sum (optional)" value={lump} onChange={setLump} sym={C.sym} step={10000}/>
      <div className="grid grid-cols-2 gap-3">
        <PctIn label="Annual return %" value={rate} onChange={setRate} step={0.5}/>
        <NumIn label="Duration (years)" value={yrs} onChange={setYrs} min={1} max={40}/>
      </div>
      <div>
        <label className="calc-label">Annual step-up %</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[0,5,10,15,20].map(v=>(
            <button key={v} onClick={()=>setStepup(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${stepup===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v===0?'None':`+${v}%/yr`}</button>
          ))}
        </div>
        <PctIn label="" value={stepup} onChange={setStepup} step={1} hint={stepup>0?`Year ${yrs} payment ≈ ${C.sym}${fmtFull(Math.round(monthly*Math.pow(1+stepup/100,yrs-1)),2)}`:undefined}/>
      </div>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">SIP for {yrs} years at {rate}% return</h3>
        <p className="text-sm text-gray-500 mt-0.5">{C.sym}{fmtFull(monthly,2)}/month{stepup>0?` stepping up ${stepup}%/year`:''}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Maturity value</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.maturity, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.maturity,2)}</p>
        </div>
        <div className="result-card col-span-2 md:col-span-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-blue-600 dark:text-blue-400 mb-0">Wealth gained</p>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.gain, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-blue-500 dark:text-blue-400">{C.sym}{fmtFull(r.gain,2)}</p>
        </div>
        <Stat label="Total invested" value={`${C.sym}${fmtFull(r.invested,2)}`} color={TC.gray}/>
        <Stat label="CAGR" value={`↑ ${cagr}%`} color={TC.green}/>
      </div>
      {stepup>0&&<Box icon={`💡 Step-up adds ${C.sym}${fmtFull(r.maturity-noStep.maturity,2)} extra`} text={`Without the ${stepup}%/yr step-up, maturity = ${C.sym}${fmtFull(noStep.maturity,2)}. The step-up adds ${C.sym}${fmtFull(r.maturity-noStep.maturity,2)} — a ${+(((r.maturity-noStep.maturity)/Math.max(1,noStep.maturity))*100).toFixed(1)}% boost.`} color="orange"/>}
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Invested','Gain','Portfolio']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.invested,2)}`,`${C.sym}${fmtFull(row.gain,2)}`,`${C.sym}${fmtFull(row.value,2)}`])} note="Actual returns vary. Illustrative only."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><BarChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>`${C.sym}${fmtFull(v/1000,0)}K`} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]} labelFormatter={l=>`Year ${l}`}/><Legend/><Bar dataKey="invested" name="Invested" fill="#f97316" radius={[3,3,0,0]}/><Bar dataKey="value" name="Portfolio" fill="#3b82f6" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Monthly (Yr 1)',v:`${C.sym}${fmtFull(monthly,2)}`},{l:`Monthly (Yr ${yrs})`,v:`${C.sym}${fmtFull(Math.round(monthly*Math.pow(1+stepup/100,yrs-1)),2)}`},{l:'Total Invested',v:`${C.sym}${fmtFull(r.invested,2)}`},{l:'Wealth Gained',v:`${C.sym}${fmtFull(r.gain,2)}`},{l:'Maturity',v:`${C.sym}${fmtFull(r.maturity,2)}`},{l:'CAGR',v:cagr+'%'}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
