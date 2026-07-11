'use client';
import { useState } from 'react';
import { calcMonthlyNeeded } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function InvGoalCalc() {
  const [curr,setCurr]=useState('INR'),[goal,setGoal]=useState(10000000),[current,setCurrent]=useState(100000),[rate,setRate]=useState(12),[months,setMonths]=useState(240);
  const C=useCurr(curr); const needed=Math.round(calcMonthlyNeeded(goal,current,months,rate));
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Investment goal" value={goal} onChange={setGoal} sym={C.sym} step={100000}/>
      <div className="flex flex-wrap gap-1.5">{[1000000,5000000,10000000].map(v=><button key={v} onClick={()=>setGoal(v)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${goal===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{C.sym+fmtFull(v/100000,0)}L</button>)}</div>
      <MoneyIn label="Already invested" value={current} onChange={setCurrent} sym={C.sym} step={10000}/>
      <PctIn label="Expected annual return" value={rate} onChange={setRate} step={0.5}/>
      <div><label className="calc-label">Time to reach goal</label><div className="flex gap-2 items-center"><NumIn label="" value={Math.floor(months/12)} onChange={v=>setMonths(v*12+(months%12))} min={1} max={50} suffix="yrs"/><NumIn label="" value={months%12} onChange={v=>setMonths(Math.floor(months/12)*12+v)} min={0} max={11} suffix="mo"/></div></div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Reach {C.sym+fmtFull(goal,2)} in {Math.floor(months/12)} years</h3>
      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600">Monthly investment needed</p>
        <p className="calc-num-lg text-orange-500">{C.sym+fmtFull(needed,2)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Already invested" value={C.sym+fmtFull(current,2)} color={TC.gray}/>
        <Stat label="Gap remaining" value={C.sym+fmtFull(Math.max(0,goal-current),2)} color={TC.red}/>
      </div>
      <Box icon="💡 Start early" text={"Every rupee invested now at "+rate+"% grows to "+C.sym+fmtFull(Math.round(1*Math.pow(1+rate/100/12,months)),2)+" in "+Math.floor(months/12)+" years — compound growth does the heavy lifting."} color="orange"/>
    </>}/>
  );
}