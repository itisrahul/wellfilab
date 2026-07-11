'use client';
import { useState } from 'react';
import { calcDueDate } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function DueDateCalc() {
  const [lmp,setLmp]=useState('');
  const r=lmp?calcDueDate(new Date(lmp)):null;
  return (
    <Shell left={<>
      <Box icon="Naegele's Rule" text="EDD = first day of last period + 280 days (40 weeks)"/>
      <div><Label>First day of last menstrual period (LMP)</Label><input type="date" value={lmp} max={new Date().toISOString().split('T')[0]} onChange={e=>setLmp(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-teal-500"/></div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Estimated Due Date</h3>
      {r?<>
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🤰</div>
          <p className="text-2xl font-extrabold text-pink-600 dark:text-pink-400">{r.due.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{l:'Gestational Age',v:`${r.gWeeks}w ${r.gDaysRem}d`},{l:'Trimester',v:`Trimester ${r.trimester}`},{l:'Days Remaining',v:r.remaining}].map(i=>(
            <div key={i.l} className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 text-center border border-pink-100 dark:border-pink-900/30"><p className="text-xl font-bold text-pink-600">{i.v}</p><p className="text-xs text-gray-400 mt-0.5">{i.l}</p></div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">Only 5% of babies arrive exactly on the due date. Always follow your doctor&apos;s guidance.</p>
      </>:<div className="flex items-center justify-center h-48 text-gray-400 text-sm">Enter your last menstrual period date to see your EDD.</div>}
    </>}/>
  );
}
