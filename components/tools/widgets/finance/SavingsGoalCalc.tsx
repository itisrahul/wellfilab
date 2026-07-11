'use client';
import { useState } from 'react';
import { calcSavingsGoal, calcMonthlyNeeded } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function SavingsGoalCalc() {
  const [curr,setCurr]=useState('INR'),[goal,setGoal]=useState(1000000),[current,setCurrent]=useState(50000),[monthly,setMonthly]=useState(5000),[rate,setRate]=useState(6);
  const [mode,setMode]=useState<'howlong'|'howmuch'>('howlong'),[targetMonths,setTargetMonths]=useState(60);
  const C=useCurr(curr);
  const rL=calcSavingsGoal(goal,current,monthly,rate);
  const rM=Math.round(calcMonthlyNeeded(goal,current,targetMonths,rate));
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div className="flex overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
        <button onClick={()=>setMode('howlong')} className={`flex-1 py-2.5 text-xs font-bold transition-all ${mode==='howlong'?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>⏳ How long?</button>
        <button onClick={()=>setMode('howmuch')} className={`flex-1 py-2.5 text-xs font-bold transition-all ${mode==='howmuch'?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>💰 How much/mo?</button>
      </div>
      <MoneyIn label="Savings goal" value={goal} onChange={setGoal} sym={C.sym} step={10000}/>
      <MoneyIn label="Current savings" value={current} onChange={setCurrent} sym={C.sym} step={5000}/>
      {mode==='howlong'?<MoneyIn label="Monthly savings" value={monthly} onChange={setMonthly} sym={C.sym} step={500}/>:<div><label className="calc-label">Target timeframe</label><div className="flex gap-2 items-center"><NumIn label="" value={Math.floor(targetMonths/12)} onChange={v=>setTargetMonths(v*12+(targetMonths%12))} min={0} max={50} suffix="yrs"/><NumIn label="" value={targetMonths%12} onChange={v=>setTargetMonths(Math.floor(targetMonths/12)*12+v)} min={0} max={11} suffix="mo"/></div></div>}
      <PctIn label="Annual interest rate" value={rate} onChange={setRate} step={0.1}/>
    </>} right={mode==='howlong'?<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Time to reach {C.sym+fmtFull(goal,2)}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">Time to goal</p>
          <p className="calc-num-lg text-orange-500">{rL.years>0?`${rL.years}y ${rL.remMonths}m`:`${rL.months} months`}</p>
        </div>
        <Stat label="Total deposited" value={C.sym+fmtFull(rL.totalDeposited,2)} color={TC.gray}/>
        <Stat label="Interest earned" value={C.sym+fmtFull(rL.interest,2)} color={TC.green}/>
        <Stat label="Your goal" value={C.sym+fmtFull(goal,2)} color={TC.teal}/>
      </div>
      <Box icon="💡 Save faster" text={"Adding just "+C.sym+fmtFull(100,2)+" more per month could save roughly "+Math.round(100/(monthly/Math.max(1,rL.months)))+" months off your timeline."}/>
    </>:<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">You need {C.sym+fmtFull(rM,2)}/month</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">Monthly savings needed</p>
          <p className="calc-num-lg text-orange-500">{C.sym+fmtFull(rM,2)}</p>
        </div>
        <Stat label="Goal" value={C.sym+fmtFull(goal,2)} color={TC.teal}/>
        <Stat label="Already saved" value={C.sym+fmtFull(current,2)} color={TC.green}/>
      </div>
    </>}/>
  );
}