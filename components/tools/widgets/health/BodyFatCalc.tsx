'use client';
import { useState } from 'react';
import { calcBodyFat } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
const COL: Record<string,string> = {Essential:'text-blue-600',Athletes:'text-teal-600',Fitness:'text-green-600',Average:'text-amber-600',Obese:'text-red-600'};
export default function BodyFatCalc() {
  const [female, setFemale] = useState(false), [imp, setImp] = useState(false);
  const [kg, setKg] = useState(80), [cm, setCm] = useState(178), [lbs, setLbs] = useState(176), [ft, setFt] = useState(5), [inch, setInch] = useState(10);
  const [waist, setWaist] = useState(88), [neck, setNeck] = useState(39), [hip, setHip] = useState(96);
  const [waistI, setWaistI] = useState(35), [neckI, setNeckI] = useState(15), [hipI, setHipI] = useState(38);
  const mL = imp ? 'in' : 'cm';
  const r = calcBodyFat(imp?lbs*0.453592:kg, imp?(ft*12+inch)*2.54:cm, imp?waistI*2.54:waist, imp?neckI*2.54:neck, female?'female':'male', imp?hipI*2.54:hip);
  return (
    <Shell left={<>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Sex</Label><Toggle v={female} a="Male" b="Female" onA={()=>setFemale(false)} onB={()=>setFemale(true)}/></div>
        <div><Label>Units</Label><Toggle v={imp} a="Metric" b="Imperial" onA={()=>setImp(false)} onB={()=>setImp(true)}/></div>
      </div>
      {!imp ? <div className="grid grid-cols-2 gap-3"><NumIn label="Weight (kg)" value={kg} onChange={setKg} min={20} max={300} step={0.1}/><NumIn label="Height (cm)" value={cm} onChange={setCm} min={50} max={250}/></div>
        : <div className="grid grid-cols-3 gap-2"><NumIn label="lbs" value={lbs} onChange={setLbs} min={40} max={660} step={0.5}/><NumIn label="ft" value={ft} onChange={setFt} min={3} max={8}/><NumIn label="in" value={inch} onChange={setInch} min={0} max={11}/></div>}
      <NumIn label={`Neck (${mL})`} value={imp?neckI:neck} onChange={imp?setNeckI:setNeck} min={imp?5:13} max={imp?30:75} step={0.5}/>
      <NumIn label={`Waist (${mL}) — at narrowest`} value={imp?waistI:waist} onChange={imp?setWaistI:setWaist} min={imp?15:38} max={imp?70:180} step={0.5}/>
      {female && <NumIn label={`Hip (${mL}) — at widest`} value={imp?hipI:hip} onChange={imp?setHipI:setHip} min={imp?20:50} max={imp?80:200} step={0.5}/>}
      <Box icon="US Navy method" text="Accurate within 3–4% of clinical DEXA scans when measurements are taken carefully."/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Body Fat Result</h3>
      <div className="text-center py-4">
        <p className="text-8xl font-extrabold font-mono text-teal-600 dark:text-teal-400 leading-none">{r.pct}%</p>
        <p className={`text-xl font-bold mt-2 ${COL[r.cat] ?? 'text-gray-600'}`}>{r.cat}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-100 dark:border-red-900/40"><p className="text-2xl font-bold text-red-500">{imp?`${+(r.fat*2.20462).toFixed(1)} lbs`:`${r.fat} kg`}</p><p className="text-xs text-gray-500 mt-1">Fat Mass</p></div>
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 text-center border border-teal-100 dark:border-teal-900/40"><p className="text-2xl font-bold text-teal-600">{imp?`${+(r.lean*2.20462).toFixed(1)} lbs`:`${r.lean} kg`}</p><p className="text-xs text-gray-500 mt-1">Lean Mass</p></div>
      </div>
      <Table headers={['Category','Men','Women']} rows={[['Essential Fat','2–5%','10–13%'],['Athletes','6–13%','14–20%'],['Fitness','14–17%','21–24%'],['Average','18–25%','25–31%'],['Obese','> 25%','> 32%']]}/>
    </>}/>
  );
}
