'use client';
import { useState } from 'react';
import { calcCalories } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function CalorieCalc() {
  const [female,setFemale]=useState(false),[imp,setImp]=useState(false);
  const [kg,setKg]=useState(70),[cm,setCm]=useState(170),[lbs,setLbs]=useState(154),[ft,setFt]=useState(5),[inch,setInch]=useState(7);
  const [age,setAge]=useState(30),[act,setAct]=useState('moderate'),[goal,setGoal]=useState('maintain');
  const r=calcCalories(imp?lbs*0.453592:kg,imp?(ft*12+inch)*2.54:cm,age,female?'female':'male',act,goal);
  return (
    <Shell left={<>
      <div className="grid grid-cols-2 gap-3"><div><Label>Sex</Label><Toggle v={female} a="Male" b="Female" onA={()=>setFemale(false)} onB={()=>setFemale(true)}/></div><div><Label>Units</Label><Toggle v={imp} a="Metric" b="Imperial" onA={()=>setImp(false)} onB={()=>setImp(true)}/></div></div>
      {!imp?<div className="grid grid-cols-3 gap-2"><NumIn label="Age" value={age} onChange={setAge} min={5} max={100}/><NumIn label="kg" value={kg} onChange={setKg} min={20} max={300} step={0.1}/><NumIn label="cm" value={cm} onChange={setCm} min={50} max={250}/></div>
      :<div className="grid grid-cols-4 gap-2"><NumIn label="Age" value={age} onChange={setAge} min={5} max={100}/><NumIn label="lbs" value={lbs} onChange={setLbs} min={40} max={660} step={0.5}/><NumIn label="ft" value={ft} onChange={setFt} min={3} max={8}/><NumIn label="in" value={inch} onChange={setInch} min={0} max={11}/></div>}
      <SelectIn label="Activity level" value={act} onChange={setAct} options={[{value:'sedentary',label:'Sedentary (desk job)'},{value:'light',label:'Light (1–3 days/wk)'},{value:'moderate',label:'Moderate (3–5 days/wk)'},{value:'active',label:'Active (6–7 days/wk)'},{value:'very_active',label:'Very Active / Athlete'}]}/>
      <div><Label>Goal</Label><div className="flex overflow-hidden rounded-xl border-2 border-gray-400 dark:border-gray-500">{[['lose','⬇️ Lose'],['maintain','⚖️ Maintain'],['gain','⬆️ Gain']].map(([v,l])=><button key={v} onClick={()=>setGoal(v)} className={`flex-1 py-2.5 text-xs font-bold transition-all ${goal===v?'bg-teal-600 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{l}</button>)}</div></div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Daily Calorie Needs</h3>
      <p className="text-sm text-gray-500">Mifflin-St Jeor equation — most accurate BMR formula for most people</p>
      <div className="grid grid-cols-2 gap-3"><Stat label="BMR (at complete rest)" value={r.bmr+' kcal'} color={TC.gray}/><Stat label="TDEE (daily burn)" value={r.tdee+' kcal'} color={TC.orange}/></div>
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl p-5 border-2 border-teal-200 dark:border-teal-800 text-center">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">🎯 Your daily target</p>
        <p className="text-5xl font-extrabold font-mono text-teal-700 dark:text-teal-300">{r.target} <span className="text-2xl text-teal-500">kcal</span></p>
        <p className="text-sm text-gray-500 mt-2">{goal==='lose'?'500 kcal deficit — lose ~0.5 kg per week':goal==='gain'?'300 kcal surplus — gradual muscle gain':'Maintenance — stay at current weight'}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{l:'Protein',v:r.protein+'g',c:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'},{l:'Carbs',v:r.carbs+'g',c:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'},{l:'Fat',v:r.fat+'g',c:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}].map(m=><div key={m.l} className={`text-center rounded-xl p-4 ${m.c}`}><p className="text-2xl font-bold">{m.v}</p><p className="text-xs font-bold mt-1">{m.l}</p></div>)}
      </div>
    </>}/>
  );
}
