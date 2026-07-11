'use client';
import { useState } from 'react';
import { calcCaloriesBurned } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
const ACTS=[{value:'walking',label:'🚶 Walking (slow)'},{value:'brisk_walk',label:'🚶 Brisk Walking'},{value:'running',label:'🏃 Running'},{value:'cycling',label:'🚴 Cycling'},{value:'swimming',label:'🏊 Swimming'},{value:'yoga',label:'🧘 Yoga'},{value:'weight_training',label:'🏋️ Weight Training'},{value:'hiit',label:'⚡ HIIT'},{value:'football',label:'⚽ Football'},{value:'basketball',label:'🏀 Basketball'},{value:'tennis',label:'🎾 Tennis'},{value:'dancing',label:'💃 Dancing'},{value:'rowing',label:'🚣 Rowing'},{value:'boxing',label:'🥊 Boxing'},{value:'desk_work',label:'💻 Desk Work'},{value:'cooking',label:'🍳 Cooking'},{value:'cleaning',label:'🧹 Cleaning'},{value:'gardening',label:'🌿 Gardening'}];
export default function CalBurnedCalc() {
  const [imp,setImp]=useState(false),[kg,setKg]=useState(75),[lbs,setLbs]=useState(165);
  const [act,setAct]=useState('brisk_walk'),[min,setMin]=useState(45);
  const r=calcCaloriesBurned(imp?lbs*0.453592:kg,act,min);
  return (
    <Shell left={<>
      <div><Label>Units</Label><Toggle v={imp} a="Metric (kg)" b="Imperial (lbs)" onA={()=>setImp(false)} onB={()=>setImp(true)}/></div>
      <NumIn label={imp?'Weight (lbs)':'Weight (kg)'} value={imp?lbs:kg} onChange={imp?setLbs:setKg} step={imp?0.5:0.1}/>
      <SelectIn label="Activity" value={act} onChange={setAct} options={ACTS}/>
      <NumIn label="Duration (minutes)" value={min} onChange={setMin} min={1} max={480}/>
      <div className="flex flex-wrap gap-1.5">{[15,30,45,60,90].map(m=><button key={m} onClick={()=>setMin(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${min===m?'bg-teal-600 text-white border-teal-600':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'}`}>{m} min</button>)}</div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Calories Burned</h3>
      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <p className="text-7xl font-extrabold font-mono text-teal-600 dark:text-teal-400 leading-none">{r.calories}</p>
        <p className="text-xl text-gray-500 mt-1">calories burned in {min} minutes</p>
      </div>
      <div className="grid grid-cols-2 gap-3"><Stat label="Per hour" value={r.perHour+' kcal'} color={TC.orange}/><Stat label="MET value" value={r.met+''} color={TC.teal} sub="metabolic equivalent"/></div>
      <Box icon="ℹ️ Accuracy" text="MET-based estimates are within 20–30% of actual calorie burn — useful for planning trends, not precise tracking."/>
    </>}/>
  );
}
