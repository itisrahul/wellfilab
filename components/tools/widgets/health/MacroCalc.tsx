'use client';
import { useState } from 'react';
import { calcMacros } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function MacroCalc() {
  const [cals,setCals]=useState(2000),[goal,setGoal]=useState('maintain');
  const r=calcMacros(cals,goal);
  return (
    <Shell left={<>
      <NumIn label="Daily calories (kcal)" value={cals} onChange={setCals} step={50} hint="Use the Calorie Calculator to find your TDEE first"/>
      <div><Label>Goal</Label><div className="flex overflow-hidden rounded-xl border-2 border-gray-400 dark:border-gray-500">{[['lose','⬇️ Lose Fat'],['maintain','⚖️ Maintain'],['gain','💪 Build Muscle']].map(([v,l])=><button key={v} onClick={()=>setGoal(v)} className={`flex-1 py-2.5 text-xs font-bold transition-all ${goal===v?'bg-teal-600 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{l}</button>)}</div></div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Daily Macros — {cals} kcal</h3>
      <div className="grid grid-cols-3 gap-4">
        {[{l:'Protein',v:r.protein+'g',sub:'30–35% · muscle & satiety',c:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'},{l:'Carbs',v:r.carbs+'g',sub:goal==='lose'?'35% · lower for fat loss':'40–45% · main energy',c:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'},{l:'Fat',v:r.fat+'g',sub:'25% · hormones & vitamins',c:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}].map(m=><div key={m.l} className={`text-center rounded-xl p-4 ${m.c}`}><p className="text-2xl font-bold">{m.v}</p><p className="text-xs font-bold mt-1">{m.l}</p><p className="text-xs opacity-70 mt-0.5 leading-tight">{m.sub}</p></div>)}
      </div>
      <Box icon="💡 Best practice" text="Hit protein first — it is the most important macro. Time carbohydrates around workouts. Never drop fat below 0.5g per kg of body weight."/>
    </>}/>
  );
}
