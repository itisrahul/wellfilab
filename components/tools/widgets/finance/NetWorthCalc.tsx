'use client';
import { useState } from 'react';
import { calcNetWorth } from '@/lib/calc';
import { Shell, CurrPills, useCurr, fmtFull } from '@/components/tools/shared';
export default function NetWorthCalc() {
  const [curr,setCurr]=useState('INR');
  const [assets,setAssets]=useState([{label:'Cash & Savings',value:150000},{label:'Investments',value:300000},{label:'Property',value:2500000},{label:'Pension / Retirement',value:400000}]);
  const [liabs,setLiabs]=useState([{label:'Home Loan',value:1800000},{label:'Car Loan',value:120000},{label:'Credit Card',value:30000}]);
  const C=useCurr(curr); const r=calcNetWorth(assets,liabs);
  const ua=(i:number,f:string,v:string|number)=>{const a=[...assets];(a[i] as Record<string,string|number>)[f]=v;setAssets(a);};
  const ul=(i:number,f:string,v:string|number)=>{const l=[...liabs];(l[i] as Record<string,string|number>)[f]=v;setLiabs(l);};
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <p className="calc-label">Assets (what you own)</p>
      {assets.map((a,i)=><div key={i} className="flex gap-2"><input type="text" value={a.label} onChange={e=>ua(i,'label',e.target.value)} className="flex-1 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"/><input type="number" value={a.value} onChange={e=>ua(i,'value',+e.target.value)} className="w-24 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-orange-500" style={{fontFamily:"var(--font-mono,monospace)"}}/><button onClick={()=>setAssets(assets.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 text-xs">✕</button></div>)}
      <button onClick={()=>setAssets([...assets,{label:'New Asset',value:0}])} className="text-xs text-orange-500 font-semibold hover:underline">+ Add asset</button>
      <p className="calc-label pt-2 border-t border-gray-200 dark:border-gray-700">Liabilities (what you owe)</p>
      {liabs.map((l,i)=><div key={i} className="flex gap-2"><input type="text" value={l.label} onChange={e=>ul(i,'label',e.target.value)} className="flex-1 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"/><input type="number" value={l.value} onChange={e=>ul(i,'value',+e.target.value)} className="w-24 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-orange-500" style={{fontFamily:"var(--font-mono,monospace)"}}/><button onClick={()=>setLiabs(liabs.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 text-xs">✕</button></div>)}
      <button onClick={()=>setLiabs([...liabs,{label:'New Liability',value:0}])} className="text-xs text-orange-500 font-semibold hover:underline">+ Add liability</button>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Your Net Worth</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="result-card bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-center"><p className="text-xs text-teal-600 font-bold uppercase tracking-wide mb-1">Total Assets</p><p className="calc-num-md text-teal-700 dark:text-teal-400">{C.sym+fmtFull(r.totalAssets,2)}</p></div>
        <div className="result-card bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-center"><p className="text-xs text-red-600 font-bold uppercase tracking-wide mb-1">Total Debts</p><p className="calc-num-md text-red-500">{C.sym+fmtFull(r.totalLiab,2)}</p></div>
        <div className={`result-card text-center ${r.netWorth>=0?'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800':'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}`}><p className={`text-xs font-bold uppercase tracking-wide mb-1 ${r.netWorth>=0?'text-green-600':'text-orange-600'}`}>Net Worth</p><p className={`calc-num-md ${r.netWorth>=0?'text-green-600 dark:text-green-400':'text-orange-500'}`}>{C.sym+fmtFull(r.netWorth,2)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-2">{assets.map(a=><div key={a.label} className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-950/20 rounded-xl"><span className="text-xs text-gray-600 dark:text-gray-400 truncate">{a.label}</span><span className="calc-num-sm text-teal-700 dark:text-teal-400 ml-2 flex-shrink-0">{C.sym+fmtFull(a.value,2)}</span></div>)}{liabs.map(l=><div key={l.label} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-xl"><span className="text-xs text-gray-600 dark:text-gray-400 truncate">{l.label}</span><span className="calc-num-sm text-red-500 ml-2 flex-shrink-0">−{C.sym+fmtFull(l.value,2)}</span></div>)}</div>
    </>}/>
  );
}