'use client';
import { useState } from 'react';
import { calcAge } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function AgeCalc() {
  const [dob,setDob]=useState('1995-06-15');
  const r=dob?calcAge(new Date(dob)):null;
  return (
    <Shell left={<>
      <div><Label>Date of birth</Label><input type="date" value={dob} max={new Date().toISOString().split('T')[0]} onChange={e=>setDob(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-teal-500"/></div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Your Exact Age</h3>
      {r&&<>
        <div className="flex items-baseline justify-center gap-2 flex-wrap py-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <span className="text-6xl font-extrabold font-mono text-teal-600 dark:text-teal-400">{r.y}</span><span className="text-gray-400 text-2xl">yrs</span>
          <span className="text-4xl font-bold font-mono text-teal-500">{r.mo}</span><span className="text-gray-400 text-xl">mo</span>
          <span className="text-4xl font-bold font-mono text-teal-400">{r.d}</span><span className="text-gray-400 text-xl">days</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{l:'Total days lived',v:r.totalDays.toLocaleString()},{l:'Total hours lived',v:r.totalHours.toLocaleString()},{l:'🎂 Days until birthday',v:r.daysUntil},{l:'You were born on a',v:r.dow}].map(i=>(
            <div key={i.l} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
              <p className="font-bold text-xl text-gray-800 dark:text-gray-200">{i.v}</p>
              <p className="text-xs text-gray-400 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      </>}
    </>}/>
  );
}
