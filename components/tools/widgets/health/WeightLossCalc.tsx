'use client';
import { useState } from 'react';
import Link from 'next/link';
import { calcWeightLoss } from '@/lib/calc';
import { Shell, Label, Toggle, NumIn, SelectIn, Box } from '@/components/tools/shared';

export default function WeightLossCalc() {
  const [female,setFemale]=useState(false), [imp,setImp]=useState(false);
  const [kg,setKg]=useState(85), [gkg,setGkg]=useState(72), [cm,setCm]=useState(170), [age,setAge]=useState(30);
  const [lbs,setLbs]=useState(187), [glbs,setGlbs]=useState(159), [ft,setFt]=useState(5), [inch,setInch]=useState(7);
  const [act,setAct]=useState('moderate');
  const currentKg = imp ? lbs*0.453592 : kg;
  const goalKg = imp ? glbs*0.453592 : gkg;
  const r = calcWeightLoss(currentKg, goalKg, imp?(ft*12+inch)*2.54:cm, age, female?'female':'male', act);
  const d = (n:number) => imp ? `${+(n*2.20462).toFixed(0)} lbs` : `${n} kg`;
  return (
    <Shell left={<>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Sex</Label><Toggle v={female} a="Male" b="Female" onA={()=>setFemale(false)} onB={()=>setFemale(true)}/></div>
        <div><Label>Units</Label><Toggle v={imp} a="Metric" b="Imperial" onA={()=>setImp(false)} onB={()=>setImp(true)}/></div>
      </div>
      {!imp?<><div className="grid grid-cols-2 gap-3"><NumIn label="Current weight (kg)" value={kg} onChange={setKg} min={20} max={300} step={0.1}/><NumIn label="Goal weight (kg)" value={gkg} onChange={setGkg} min={20} max={300} step={0.1}/></div><div className="grid grid-cols-2 gap-3"><NumIn label="Height (cm)" value={cm} onChange={setCm} min={50} max={250}/><NumIn label="Age" value={age} onChange={setAge} min={15} max={80}/></div></>
      :<><div className="grid grid-cols-2 gap-3"><NumIn label="Current (lbs)" value={lbs} onChange={setLbs} min={40} max={660} step={0.5}/><NumIn label="Goal (lbs)" value={glbs} onChange={setGlbs} min={40} max={660} step={0.5}/></div><div className="grid grid-cols-3 gap-2"><NumIn label="ft" value={ft} onChange={setFt} min={3} max={8}/><NumIn label="in" value={inch} onChange={setInch} min={0} max={11}/><NumIn label="Age" value={age} onChange={setAge} min={15} max={80}/></div></>}
      <SelectIn label="Activity level" value={act} onChange={setAct} options={[{value:'sedentary',label:'Sedentary (desk job)'},{value:'light',label:'Light (1–3 days/wk)'},{value:'moderate',label:'Moderate (3–5 days/wk)'},{value:'active',label:'Active (6–7 days/wk)'},{value:'very_active',label:'Very Active / Athlete'}]}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Weight Loss Plan — lose {d(r.tolose)}</h3>
      <p className="text-sm text-gray-500 mb-4">Your maintenance calories (TDEE): <strong>{r.tdee} kcal/day</strong></p>
      <div className="grid grid-cols-3 gap-3">
        {[
          {title:'Gentle', sub:'−500 kcal/day', p:r.plan500, rate:d(0.5)+'/wk', c:'border-teal-400 bg-teal-50 dark:bg-teal-950/30'},
          {title:'Balanced', sub:'−750 kcal/day', p:r.plan750, rate:d(0.75)+'/wk', c:'border-orange-400 bg-orange-50 dark:bg-orange-950/30'},
          {title:'Aggressive', sub:'−1000 kcal/day', p:r.plan1000, rate:d(1)+'/wk', c:'border-red-400 bg-red-50 dark:bg-red-950/30'},
        ].map(pl=>(
          <div key={pl.title} className={`rounded-2xl border-2 p-4 text-center ${pl.c}`}>
            <p className="font-bold text-sm mb-1">{pl.title}</p>
            <p className="text-xs text-gray-400 mb-2">{pl.sub}</p>
            <p className="calc-num-md font-extrabold text-gray-800 dark:text-gray-100">{pl.p.calories}</p>
            <p className="text-xs text-gray-500 mb-2">kcal/day</p>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <p className="text-lg font-bold">{pl.p.weeks} weeks</p>
              <p className="text-xs text-gray-400">≈ {pl.p.months} months</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">{pl.rate}</p>
            </div>
          </div>
        ))}
      </div>
      <Box icon="⚠️ Safety note" text="Never eat below 1,200 kcal/day (women) or 1,500 kcal/day (men). Combine with strength training to preserve muscle." color="orange"/>
      <Link href={`/goals?prefill=weight&current=${currentKg.toFixed(1)}&target=${goalKg.toFixed(1)}`} className="block text-center text-xs font-bold text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 underline">
        Track this weight goal →
      </Link>
    </>}/>
  );
}
