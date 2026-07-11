'use client';
import { useState } from 'react';
import { calcBudget } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function BudgetCalc() {
  const [curr,setCurr]=useState('INR'),[income,setIncome]=useState(50000),[custom,setCustom]=useState(false),[needs,setNeeds]=useState(50),[wants,setWants]=useState(30);
  const C=useCurr(curr); const savings=Math.max(0,100-needs-wants); const r=calcBudget(income);
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Monthly take-home income" value={income} onChange={setIncome} sym={C.sym} step={5000}/>
      <div className="flex overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
        <button onClick={()=>setCustom(false)} className={`flex-1 py-2.5 text-xs font-bold transition-all ${!custom?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>50/30/20 Standard</button>
        <button onClick={()=>setCustom(true)}  className={`flex-1 py-2.5 text-xs font-bold transition-all ${custom?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Custom Split</button>
      </div>
      {custom&&<><div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500"><input type="number" value={needs} min={10} max={80} onChange={e=>setNeeds(+e.target.value)} className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none" style={{fontFamily:"var(--font-mono,monospace)"}}/><span className="px-3 flex items-center text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 text-sm">% Needs</span></div><div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500"><input type="number" value={wants} min={10} max={60} onChange={e=>setWants(+e.target.value)} className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none" style={{fontFamily:"var(--font-mono,monospace)"}}/><span className="px-3 flex items-center text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 text-sm">% Wants</span></div><p className="text-sm text-gray-500">Savings: <strong>{savings}%</strong> = {C.sym+fmtFull(Math.round(income*savings/100),2)}/month</p></>}
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">{custom?`${needs}/${wants}/${savings}`:"50/30/20"} Budget on {C.sym+fmtFull(income,2)}/month</h3>
      {!custom?<>
        <div className="grid grid-cols-3 gap-3">{[{l:'Needs (50%)',s:'Rent, food, utilities',v:r.needs,bg:'bg-orange-500',tc:TC.orange},{l:'Wants (30%)',s:'Dining, hobbies, fun',v:r.wants,bg:'bg-blue-500',tc:TC.blue},{l:'Savings (20%)',s:'Invest, emergency',v:r.savings,bg:'bg-green-600',tc:TC.green}].map(b=><div key={b.l} className="result-card text-center"><div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center mx-auto mb-2`}><span className="text-white text-xs font-bold">{b.l.split('(')[1]?.replace(')','')}</span></div><p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{b.l.split(' (')[0]}</p><p className={`calc-num-md ${b.tc}`}>{C.sym+fmtFull(b.v,2)}</p><p className="text-xs text-gray-400 mt-1">{b.s}</p></div>)}</div>
        <div className="grid grid-cols-2 gap-3"><Stat label="3-month emergency fund" value={C.sym+fmtFull(r.emergency3,2)} color={TC.gray} sub="minimum"/><Stat label="6-month emergency fund" value={C.sym+fmtFull(r.emergency6,2)} color={TC.gray} sub="recommended"/></div>
        <Box icon="💡 Automate savings" text="Set up automatic savings transfer on payday. Needs = unavoidable. Wants = enjoyable but cuttable." color="orange"/>
      </>:<div className="grid grid-cols-3 gap-3">{[{l:`Needs ${needs}%`,v:Math.round(income*needs/100),c:TC.orange},{l:`Wants ${wants}%`,v:Math.round(income*wants/100),c:TC.blue},{l:`Savings ${savings}%`,v:Math.round(income*savings/100),c:TC.green}].map(b=><div key={b.l} className="result-card text-center"><p className="text-xs text-gray-400 mb-1">{b.l}</p><p className={`calc-num-md ${b.c}`}>{C.sym+fmtFull(b.v,2)}</p></div>)}</div>}
    </>}/>
  );
}