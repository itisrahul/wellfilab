'use client';
import { useState } from 'react';
import { calcHeartRate } from '@/lib/calc';
import {
  Shell, CurrPills, MoneyIn, PctIn, NumIn, SelectIn, Toggle,
  BigResult, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtCurrency, TC, CopyBtn,
} from '@/components/tools/shared';
const ZC=['bg-blue-100 text-blue-700','bg-teal-100 text-teal-700','bg-amber-100 text-amber-700','bg-orange-100 text-orange-700','bg-red-100 text-red-700'];
export default function HeartRateCalc() {
  const [age,setAge]=useState(30),[rest,setRest]=useState(65);
  const r=calcHeartRate(age,rest);
  return (
    <Shell left={<>
      <NumIn label="Age (years)" value={age} onChange={setAge} min={10} max={90}/>
      <NumIn label="Resting heart rate (bpm)" value={rest} onChange={setRest} min={40} max={100} hint="Measure first thing in the morning. Normal: 60–100 bpm. Athletes: 40–60 bpm."/>
      <Box icon="Karvonen formula" text="Uses heart rate reserve — more accurate than the age-only method."/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Heart Rate Zones</h3>
      <p className="text-sm text-gray-500">Max HR: <strong>{r.maxHR} bpm</strong> · Resting: {r.restingHR} bpm · Reserve (HRR): {r.hrr} bpm</p>
      <div className="space-y-3">
        {r.zones.map((z,i)=>(
          <div key={z.name} className={`rounded-xl p-4 ${ZC[i]} flex items-center gap-4`}>
            <div className="flex-1"><p className="font-bold text-sm">{z.name}</p><p className="text-xs opacity-70 mt-0.5">{z.benefit}</p></div>
            <div className="text-right flex-shrink-0"><p className="text-2xl font-extrabold font-mono">{z.min}–{z.max}</p><p className="text-xs opacity-70">bpm ({z.pct})</p></div>
          </div>
        ))}
      </div>
    </>}/>
  );
}
