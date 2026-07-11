'use client';
import { useState } from 'react';
import { calcSleep } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function SleepCalc() {
  const [bed,setBed]=useState('23:00');
  const r=calcSleep(bed);
  return (
    <Shell left={<>
      <div><Label>Bedtime</Label><input type="time" value={bed} onChange={e=>setBed(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:border-teal-500"/></div>
      <Box icon="How it works" text="Each sleep cycle is ~90 minutes. Waking at cycle end feels far more refreshing than waking mid-cycle. Includes ~15 min to fall asleep."/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Best Wake-Up Times from {bed}</h3>
      <div className="grid grid-cols-3 gap-2">
        {r.map(c=>(
          <div key={c.cycle} className={`text-center rounded-xl p-3 border-2 ${c.cycle>=5?'bg-teal-600 text-white border-teal-600 shadow-md':'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
            <p className={`text-2xl font-bold font-mono ${c.cycle<5?'text-gray-800 dark:text-gray-100':''}`}>{c.time}</p>
            <p className={`text-xs mt-1 ${c.cycle>=5?'text-teal-100':'text-gray-400'}`}>{c.hours}h · {c.cycle} cycles {c.cycle>=5?'⭐':''}</p>
          </div>
        ))}
      </div>
      <Table headers={['Cycles','Wake Time','Duration','Quality']} rows={r.map(c=>[c.cycle,c.time,c.hours+'h',c.cycle<=3?'Insufficient':c.cycle===4?'Minimum':c.cycle===5?'Good ✓':'Optimal ⭐'])}/>
    </>}/>
  );
}
