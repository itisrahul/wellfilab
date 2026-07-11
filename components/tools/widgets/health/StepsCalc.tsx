'use client';
import { useState } from 'react';
import { calcSteps } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function StepsCalc() {
  const [imp,setImp]=useState(false),[steps,setSteps]=useState(8000);
  const [kg,setKg]=useState(70),[lbs,setLbs]=useState(154),[cm,setCm]=useState(170),[ft,setFt]=useState(5),[inch,setInch]=useState(7);
  const r=calcSteps(steps,imp?lbs*0.453592:kg,imp?(ft*12+inch)*2.54:cm);
  return (
    <Shell left={<>
      <div><Label>Units</Label><Toggle v={imp} a="Metric" b="Imperial" onA={()=>setImp(false)} onB={()=>setImp(true)}/></div>
      <NumIn label="Step count" value={steps} onChange={setSteps} step={100}/>
      <div className="flex flex-wrap gap-1.5">{[3000,5000,7500,10000,12000].map(s=><button key={s} onClick={()=>setSteps(s)} className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-all ${steps===s?'bg-teal-600 text-white border-teal-600':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'}`}>{(s/1000).toFixed(0)}K</button>)}</div>
      {!imp?<div className="grid grid-cols-2 gap-3"><NumIn label="Weight (kg)" value={kg} onChange={setKg} step={0.1}/><NumIn label="Height (cm)" value={cm} onChange={setCm}/></div>
      :<div className="grid grid-cols-3 gap-2"><NumIn label="lbs" value={lbs} onChange={setLbs} step={0.5}/><NumIn label="ft" value={ft} onChange={setFt} min={3} max={8}/><NumIn label="in" value={inch} onChange={setInch} min={0} max={11}/></div>}
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Steps Analysis — {steps.toLocaleString()} steps</h3>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Stat label="Calories burned" value={r.calories+' kcal'} color={TC.orange}/>
        <Stat label={imp?'Distance (miles)':'Distance (km)'} value={imp?r.distanceMi+'mi':r.distanceKm+'km'} color={TC.teal}/>
        <Stat label="Steps per km" value={r.stepsPerKm.toLocaleString()} color={TC.gray}/>
        <Stat label="10K goal" value={Math.min(100,Math.round(steps/100))+'%'} color={steps>=10000?TC.green:TC.orange}/>
      </div>
      {steps<10000?<Box icon="🎯 Keep going!" text={`${(10000-steps).toLocaleString()} more steps to hit 10,000. That is roughly ${imp?`${+(5*0.621-r.distanceMi).toFixed(1)} more miles`:`${+(5-r.distanceKm).toFixed(1)} more km`} of walking.`}/>
      :<div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-700 dark:text-green-400 font-bold text-sm">✅ Goal achieved! You hit your 10,000 steps today.</div>}
    </>}/>
  );
}
