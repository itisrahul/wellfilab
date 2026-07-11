'use client';
import { useState } from 'react';
import { calcIdealWeight } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function IdealWeightCalc() {
  const [female, setFemale] = useState(false), [imp, setImp] = useState(false);
  const [cm, setCm] = useState(170), [ft, setFt] = useState(5), [inch, setInch] = useState(7);
  const h = imp ? (ft * 12 + inch) * 2.54 : cm;
  const r = calcIdealWeight(h, female ? 'female' : 'male');
  const d = (kg: number) => imp ? `${+(kg * 2.20462).toFixed(1)} lbs` : `${kg} kg`;
  return (
    <Shell left={<>
      <div><Label>Sex</Label><Toggle v={female} a="Male" b="Female" onA={() => setFemale(false)} onB={() => setFemale(true)}/></div>
      <div><Label>Units</Label><Toggle v={imp} a="Metric" b="Imperial" onA={() => setImp(false)} onB={() => setImp(true)}/></div>
      {!imp ? <NumIn label="Height (cm)" value={cm} onChange={setCm}/>
        : <div className="grid grid-cols-2 gap-3"><NumIn label="Feet" value={ft} onChange={setFt} min={3} max={8}/><NumIn label="Inches" value={inch} onChange={setInch} min={0} max={11}/></div>}
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Ideal Weight — {imp ? `${ft}ft ${inch}in` : `${cm}cm`} · {female ? 'Female' : 'Male'}</h3>
      <div className="bg-teal-50 dark:bg-teal-950/30 border-2 border-teal-200 dark:border-teal-800 rounded-xl p-5">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">Healthy BMI range (most widely used)</p>
        <p className="text-3xl font-extrabold font-mono text-teal-700 dark:text-teal-400">{d(r.bmiMin)} – {d(r.bmiMax)}</p>
      </div>
      <div className="space-y-2">
        {[{l:'Robinson formula (1983)',v:r.robinson},{l:'Miller formula (1983)',v:r.miller},{l:'Devine formula (1974)',v:r.devine},{l:'Hamwi formula (1964)',v:r.hamwi}].map(row => (
          <div key={row.l} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <span className="text-sm text-gray-600 dark:text-gray-300">{row.l}</span>
            <span className="font-mono font-bold text-gray-800 dark:text-gray-100">{d(row.v)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">These are statistical guides, not strict targets. Athletes may be above due to muscle mass.</p>
    </>}/>
  );
}
