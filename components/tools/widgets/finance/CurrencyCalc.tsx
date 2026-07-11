'use client';
import { useState } from 'react';
import { calcCurrency } from '@/lib/calc';
import { Shell, Label, BigResult, Box, CURRENCIES, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';
export default function CurrencyCalc() {
  const [amount,setAmount]=useState(1000),[from,setFrom]=useState('USD'),[to,setTo]=useState('EUR');
  const r=calcCurrency(amount,from,to);
  const fC=CURRENCIES.find(c=>c.code===from)!,tC=CURRENCIES.find(c=>c.code===to)!;
  return (
    <Shell left={<>
      <div><Label>Amount</Label><input type="number" value={amount} onChange={e=>setAmount(+e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:border-teal-500"/></div>
      <div><Label>From</Label><div className="flex flex-wrap gap-1">{CURRENCIES.map(c=><button key={c.code} onClick={()=>setFrom(c.code)} title={c.name} className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${from===c.code?'bg-teal-600 text-white border-teal-600':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 hover:border-teal-400'}`}>{c.flag} {c.code}</button>)}</div></div>
      <div><Label>To</Label><div className="flex flex-wrap gap-1">{CURRENCIES.map(c=><button key={c.code} onClick={()=>setTo(c.code)} title={c.name} className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${to===c.code?'bg-amber-500 text-white border-amber-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 hover:border-amber-400'}`}>{c.flag} {c.code}</button>)}</div></div>
      <button onClick={()=>{setFrom(to);setTo(from);}} className="w-full py-2.5 rounded-xl border-2 border-gray-400 dark:border-gray-500 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-teal-400 transition-all">⇄ Swap</button>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Currency Conversion</h3>
      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 min-w-0">
        <p className="text-sm text-gray-500 mb-2 break-all">{fC.flag} {amount.toLocaleString()} {from} =</p>
        <p className="calc-num-xl text-teal-700 dark:text-teal-400 mx-auto">{r.result.toLocaleString('en-US',{maximumFractionDigits:2})}</p>
        <p className="text-xl font-bold text-gray-600 dark:text-gray-400 mt-2">{tC.flag} {to}</p>
        <p className="text-sm text-gray-400 mt-2 break-words">1 {from} = {r.rate} {to} · 1 {to} = {Math.round(1/r.rate*10000)/10000} {from}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">{[10,100,1000,10000,100000,1000000].map(v=><div key={v} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700 min-w-0"><p className="text-xs text-gray-400">{from} {v.toLocaleString()}</p><p className="font-mono font-bold text-sm text-teal-700 dark:text-teal-400 break-all">{tC.sym} {calcCurrency(v,from,to).result.toLocaleString('en-US',{maximumFractionDigits:2})}</p></div>)}</div>
      <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">⚠️ Indicative rates for reference only. Use your bank or Wise for actual transactions.</p>
    </>}/>
  );
}
