'use client';
import { useState } from 'react';
import { calcWater } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function WaterCalc() {
  const [imp,setImp]=useState(false),[kg,setKg]=useState(70),[lbs,setLbs]=useState(154);
  const [act,setAct]=useState('moderate'),[cli,setCli]=useState('temperate');
  const r=calcWater(imp?lbs*0.453592:kg,act,cli);
  return (
    <Shell left={<>
      <div><Label>Units</Label><Toggle v={imp} a="Metric (kg)" b="Imperial (lbs)" onA={()=>setImp(false)} onB={()=>setImp(true)}/></div>
      <NumIn label={imp?'Weight (lbs)':'Weight (kg)'} value={imp?lbs:kg} onChange={imp?setLbs:setKg} step={imp?0.5:0.1}/>
      <SelectIn label="Activity level" value={act} onChange={setAct} options={[{value:'sedentary',label:'Sedentary'},{value:'light',label:'Light (1–3/wk)'},{value:'moderate',label:'Moderate (3–5/wk)'},{value:'active',label:'Active (6–7/wk)'},{value:'very_active',label:'Very Active'}]}/>
      <div><Label>Climate</Label><div className="flex gap-2">{[{v:'cold',l:'❄️ Cold'},{v:'temperate',l:'🌤 Moderate'},{v:'hot',l:'☀️ Hot'}].map(c=><button key={c.v} onClick={()=>setCli(c.v)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${cli===c.v?'bg-blue-500 text-white border-blue-500':'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 text-gray-500'}`}>{c.l}</button>)}</div></div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Daily Water Intake</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[{v:r.liters+'L',l:'Litres'},{v:r.floz+' fl oz',l:'Fluid oz'},{v:r.glasses,l:'Glasses (250ml)'}].map(i=><div key={i.l}><p className="text-4xl font-extrabold font-mono text-blue-600">{i.v}</p><p className="text-xs text-gray-500 mt-1">{i.l}</p></div>)}
      </div>
      <div className="flex flex-wrap gap-1 justify-center py-2">{Array.from({length:Math.min(r.glasses,16)},(_,i)=><span key={i} className="text-2xl">💧</span>)}</div>
      <Box icon="💡 Stay ahead of thirst" text="Drink a glass first thing in the morning. Pale yellow urine means you are well hydrated. Add 350 ml for every 30 minutes of exercise."/>
    </>}/>
  );
}
