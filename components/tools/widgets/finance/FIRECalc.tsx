'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcFIRE, calcFIREStepUp } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';
export default function FIRECalc() {
  const [curr,setCurr]=useState('INR'),[annExp,setAnnExp]=useState(600000),[port,setPort]=useState(500000),[monthly,setMonthly]=useState(20000),[roi,setRoi]=useState(12);
  const [stepup, setStepup] = useState(0);
  const [view, setView]     = useState('table');
  const C=useCurr(curr); const r=calcFIRE(annExp,port,monthly,roi);
  const su = calcFIREStepUp(r.fireNum, port, monthly, roi, stepup);
  const fireStr = C.sym+fmtFull(r.fireNum,2);
  const deficitStr = C.sym+fmtFull(r.deficit,2);
  const leanStr = C.sym+fmtFull(r.leanFire,2);
  const fatStr = C.sym+fmtFull(r.fatFire,2);
  const mthStr = C.sym+fmtFull(Math.round(annExp/12),2);
  const monthsSaved = r.months - su.months;

  useEffect(() => {
    saveHistory({
      calcSlug: 'fire', calcName: 'FIRE Calculator',
      summary: `FIRE number ${fireStr} — reached in ${su.years}y ${su.remMonths}m`,
      inputs: { annExp, port, monthly, roi, stepup },
    });
  }, [annExp, port, monthly, roi, stepup]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Annual living expenses" value={annExp} onChange={setAnnExp} sym={C.sym} step={10000} hint={C.sym+fmtFull(Math.round(annExp/12),2)+'/month'}/>
      <MoneyIn label="Current portfolio" value={port} onChange={setPort} sym={C.sym} step={50000}/>
      <MoneyIn label="Monthly investment" value={monthly} onChange={setMonthly} sym={C.sym} step={1000}/>
      <PctIn label="Expected annual return" value={roi} onChange={setRoi} step={0.5}/>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="calc-label">Annual step-up % <span className="font-normal text-gray-400">(optional)</span></label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[0,5,10,15,20].map(v=>(
            <button key={v} onClick={()=>setStepup(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${stepup===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v===0?'None':`+${v}%/yr`}</button>
          ))}
        </div>
        <PctIn label="" value={stepup} onChange={setStepup} step={1} hint="Increase your monthly investment each year in line with salary growth"/>
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">FIRE — Financial Independence</h3>
      <p className="text-sm text-gray-500">FIRE number = 25 × annual expenses. At 4% withdrawal, portfolio lasts indefinitely.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">Your FIRE number</p>
          <p className="calc-num-lg text-orange-500">{fireStr}</p>
        </div>
        <Stat label="Years to FIRE" value={`${su.years}y ${su.remMonths}m`} color={TC.teal}/>
        <Stat label="Gap to close" value={deficitStr} color={TC.red}/>
        <Stat label="Lean FIRE (70% lifestyle)" value={leanStr} color={TC.gray}/>
        <Stat label="Fat FIRE (150% lifestyle)" value={fatStr} color={TC.gray}/>
        <Stat label="Monthly at FIRE (4% rule)" value={mthStr} color={TC.green}/>
      </div>
      {stepup>0 && monthsSaved !== 0 && (
        <Box icon={monthsSaved>0?`💡 Step-up gets you to FIRE ${Math.floor(monthsSaved/12)}y ${monthsSaved%12}m sooner`:`💡 Step-up impact`}
          text={`With a flat ${C.sym}${fmtFull(monthly,2)}/month, FIRE arrives in ${r.years}y ${r.remMonths}m. With a ${stepup}%/yr step-up on that same starting amount, you get there in ${su.years}y ${su.remMonths}m instead.`}
          color="orange"/>
      )}
      <Box icon="🔥 What is FIRE?" text={"Financial Independence means investments generate enough returns to cover living costs forever — so work becomes optional. Your number is "+fireStr+"."}/>
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Invested','Portfolio']} rows={su.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.invested,2)}`,`${C.sym}${fmtFull(row.value,2)}`])} note="Illustrative — assumes a constant return rate every year."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><BarChart data={su.rows} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>`${C.sym}${fmtFull(v/1000,0)}K`} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]} labelFormatter={l=>`Year ${l}`}/><Legend/><Bar dataKey="invested" name="Invested" fill="#f97316" radius={[3,3,0,0]}/><Bar dataKey="value" name="Portfolio" fill="#3b82f6" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'FIRE number',v:fireStr},{l:'Current portfolio',v:C.sym+fmtFull(port,2)},{l:'Starting monthly',v:C.sym+fmtFull(monthly,2)},{l:'Step-up',v:stepup>0?`+${stepup}%/yr`:'None'},{l:'Years to FIRE',v:`${su.years}y ${su.remMonths}m`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
