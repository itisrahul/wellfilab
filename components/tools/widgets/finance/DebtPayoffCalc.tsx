'use client';
import { useState } from 'react';
import { calcDebtPayoff } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, Box, useCurr, fmtFull } from '@/components/tools/shared';
export default function DebtPayoffCalc() {
  const [curr,setCurr]=useState('INR');
  const [debts,setDebts]=useState([{name:'Credit Card',balance:80000,rate:36,minPayment:1600},{name:'Car Loan',balance:500000,rate:10,minPayment:10000},{name:'Personal Loan',balance:200000,rate:18,minPayment:5000}]);
  const [extra,setExtra]=useState(5000);
  const C=useCurr(curr); const {avalanche,snowball}=calcDebtPayoff(debts,extra);
  const saved=snowball.totalInterest-avalanche.totalInterest;
  const upd=(i:number,f:string,v:string|number)=>{const d=[...debts];(d[i] as Record<string,string|number>)[f]=v;setDebts(d);};
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <p className="calc-label">Your Debts</p>
      {debts.map((d,i)=>(
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-3 space-y-2">
          <div className="flex gap-2 items-center"><input type="text" value={d.name} onChange={e=>upd(i,'name',e.target.value)} className="flex-1 text-xs font-semibold bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none text-gray-800 dark:text-gray-200 pb-0.5"/><button onClick={()=>setDebts(debts.filter((_,j)=>j!==i))} className="text-xs text-red-400 hover:text-red-600">✕</button></div>
          <div className="grid grid-cols-3 gap-1.5">{[{l:'Balance',f:'balance'},{l:'Rate %',f:'rate'},{l:'Min Pay',f:'minPayment'}].map(fd=><div key={fd.f}><p className="text-xs text-gray-400 mb-0.5">{fd.l}</p><input type="number" value={(d as Record<string,number|string>)[fd.f] as number} onChange={e=>upd(i,fd.f,+e.target.value)} className="w-full text-xs border-2 border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 focus:outline-none focus:border-orange-500" style={{fontFamily:"var(--font-mono,monospace)"}}/></div>)}</div>
        </div>
      ))}
      <button onClick={()=>setDebts([...debts,{name:'New Debt',balance:50000,rate:18,minPayment:1000}])} className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all">+ Add debt</button>
      <MoneyIn label="Extra monthly payment" value={extra} onChange={setExtra} sym={C.sym} step={500} hint="Applied to priority debt each month"/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Debt payoff — {C.sym+fmtFull(debts.reduce((s,d)=>s+d.balance,0),2)} total</h3>
      <p className="text-sm text-gray-500">Avalanche = highest rate first (saves most money) · Snowball = smallest balance first (builds momentum)</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"><p className="font-bold text-orange-700 dark:text-orange-300 mb-1">🏆 Avalanche</p><p className="text-xs text-gray-400 mb-2">Highest rate first</p><p className="calc-num-lg text-orange-500">{avalanche.years}y {avalanche.remMonths}m</p><p className="text-sm text-gray-500 mt-1">debt free</p><p className="calc-num-sm text-red-500 mt-2">{C.sym+fmtFull(avalanche.totalInterest,2)}</p><p className="text-xs text-gray-400">total interest</p></div>
        <div className="result-card bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"><p className="font-bold text-blue-700 dark:text-blue-300 mb-1">❄️ Snowball</p><p className="text-xs text-gray-400 mb-2">Smallest balance first</p><p className="calc-num-lg text-blue-500">{snowball.years}y {snowball.remMonths}m</p><p className="text-sm text-gray-500 mt-1">debt free</p><p className="calc-num-sm text-red-500 mt-2">{C.sym+fmtFull(snowball.totalInterest,2)}</p><p className="text-xs text-gray-400">total interest</p></div>
      </div>
      {saved>0&&<Box icon={"💡 Avalanche saves "+C.sym+fmtFull(saved,2)+" vs Snowball"} text="Avalanche is mathematically better. Snowball wins on motivation. Both beat paying minimums only." color="orange"/>}
    </>}/>
  );
}