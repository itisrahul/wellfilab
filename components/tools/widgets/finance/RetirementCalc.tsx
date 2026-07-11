'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcRetirement, calcRetirementStepUp } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';
export default function RetirementCalc() {
  const [curr,setCurr]=useState('INR'),[age,setAge]=useState(30),[retAge,setRetAge]=useState(60),[exp,setExp]=useState(50000),[inf,setInf]=useState(6),[roi,setRoi]=useState(12),[life,setLife]=useState(85);
  const [stepup, setStepup] = useState(0);
  const [view, setView]     = useState('table');
  const C=useCurr(curr); const r=calcRetirement(age,retAge,exp,inf,roi,life);
  const su    = calcRetirementStepUp(r.corpus, r.yrs, roi, stepup);
  const flatSu = calcRetirementStepUp(r.corpus, r.yrs, roi, 0);

  useEffect(() => {
    saveHistory({
      calcSlug: 'retirement', calcName: 'Retirement Calculator',
      summary: `Retire at ${retAge} — need ${C.sym}${fmtFull(r.corpus,0)}, save ${C.sym}${fmtFull(su.startMonthly,0)}/mo`,
      inputs: { age, retAge, exp, inf, roi, life, stepup },
    });
  }, [age, retAge, exp, inf, roi, life, stepup]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div className="grid grid-cols-2 gap-3">
        <NumIn label="Current age" value={age} onChange={setAge} min={18} max={60}/>
        <NumIn label="Retirement age" value={retAge} onChange={setRetAge} min={40} max={80}/>
        <NumIn label="Life expectancy" value={life} onChange={setLife} min={60} max={100}/>
        <PctIn label="Inflation %" value={inf} onChange={setInf} step={0.5}/>
        <PctIn label="Return %" value={roi} onChange={setRoi} step={0.5}/>
      </div>
      <MoneyIn label="Monthly expenses today" value={exp} onChange={setExp} sym={C.sym} step={5000}/>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="calc-label">Annual step-up % <span className="font-normal text-gray-400">(optional)</span></label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[0,5,10,15,20].map(v=>(
            <button key={v} onClick={()=>setStepup(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${stepup===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v===0?'None':`+${v}%/yr`}</button>
          ))}
        </div>
        <PctIn label="" value={stepup} onChange={setStepup} step={1} hint="Increase your monthly savings each year in line with salary growth"/>
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Retire at {retAge} — you have {r.yrs} years</h3>
      <p className="text-sm text-gray-500">{C.sym+fmtFull(exp,2)}/mo today becomes {C.sym+fmtFull(r.futureExpense,2)}/mo at retirement after {inf}% inflation</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 mb-0">Corpus needed</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.corpus, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.corpus,2)}</p>
        </div>
        <div className="result-card col-span-2 md:col-span-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-blue-600 mb-0">{stepup>0?'Start saving monthly at':'Save monthly now'}</p>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(su.startMonthly, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-blue-500">{C.sym}{fmtFull(su.startMonthly,2)}</p>
        </div>
        <Stat label="Monthly need at retirement" value={C.sym+fmtFull(r.futureExpense,2)} color={TC.gray}/>
        <Stat label="Your FIRE number" value={C.sym+fmtFull(r.fireNum,2)} color={TC.teal} sub="25× annual expenses"/>
        <Stat label="4% safe withdrawal" value={C.sym+fmtFull(r.safe4pct,2)+'/mo'} color={TC.green}/>
        <Stat label="Years to retire" value={r.yrs+" years"} color={TC.orange}/>
      </div>
      {stepup>0 && (
        <Box icon={`💡 Step-up lets you start ${C.sym}${fmtFull(flatSu.startMonthly-su.startMonthly,2)} lower`}
          text={`Saving a flat amount with no step-up needs ${C.sym}${fmtFull(flatSu.startMonthly,2)}/month for all ${r.yrs} years. With a ${stepup}%/yr step-up, you can start at ${C.sym}${fmtFull(su.startMonthly,2)}/month, rising to ≈${C.sym}${fmtFull(su.finalMonthly,2)}/month by retirement — same ${C.sym}${fmtFull(r.corpus,2)} corpus either way.`}
          color="orange"/>
      )}
      <Box icon="💡 The 4% rule" text={"Save "+C.sym+fmtFull(r.corpus,2)+", withdraw "+C.sym+fmtFull(r.safe4pct,2)+"/month ("+C.sym+fmtFull(r.safe4pct*12,2)+"/year) — historically sustainable for 30+ years."} color="orange"/>
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Invested','Portfolio']} rows={su.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.invested,2)}`,`${C.sym}${fmtFull(row.value,2)}`])} note="Illustrative — assumes a constant return rate every year."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><BarChart data={su.rows} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>`${C.sym}${fmtFull(v/1000,0)}K`} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]} labelFormatter={l=>`Year ${l}`}/><Legend/><Bar dataKey="invested" name="Invested" fill="#f97316" radius={[3,3,0,0]}/><Bar dataKey="value" name="Portfolio" fill="#3b82f6" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Corpus needed',v:`${C.sym}${fmtFull(r.corpus,2)}`},{l:'Starting monthly',v:`${C.sym}${fmtFull(su.startMonthly,2)}`},{l:stepup>0?`Monthly (Yr ${r.yrs})`:'Step-up',v:stepup>0?`${C.sym}${fmtFull(su.finalMonthly,2)}`:'None'},{l:'Years to retire',v:`${r.yrs} years`},{l:'4% safe withdrawal',v:`${C.sym}${fmtFull(r.safe4pct,2)}/mo`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
