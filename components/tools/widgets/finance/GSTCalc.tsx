'use client';
import { useState } from 'react';
import { calcGST } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function GSTCalc() {
  const [curr,setCurr]=useState('INR'),[amount,setAmount]=useState(10000),[rate,setRate]=useState(18),[type,setType]=useState<'add'|'remove'>('add');
  const C=useCurr(curr); const r=calcGST(amount,rate,type);
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Amount" value={amount} onChange={setAmount} sym={C.sym} step={100}/>
      <div>
        <label className="calc-label">Tax rate</label>
        <div className="flex flex-wrap gap-1.5 mb-2">{[5,12,18,20,22,28].map(v=><button key={v} onClick={()=>setRate(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${rate===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v}%</button>)}</div>
        <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500">
          <input type="number" value={rate} step={0.5} onChange={e=>setRate(+e.target.value)} className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none" style={{fontFamily:"var(--font-mono,monospace)"}}/>
          <span className="px-3 flex items-center text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 text-sm">%</span>
        </div>
      </div>
      <div className="flex overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
        <button onClick={()=>setType('add')} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${type==='add'?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>➕ Add tax</button>
        <button onClick={()=>setType('remove')} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${type==='remove'?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>➖ Remove tax</button>
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">{type==='add'?'Adding':'Removing'} {rate}% tax</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Amount excl. tax" value={C.sym+fmtFull(r.original,2)} color={TC.gray}/>
        <Stat label={'Tax ('+rate+'%)'} value={C.sym+fmtFull(r.gst,2)} color={TC.orange}/>
      </div>
      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600">Total incl. tax</p>
        <p className="calc-num-lg text-orange-500">{C.sym+fmtFull(r.total,2)}</p>
      </div>
      <Box icon="🌍 Common rates" text="UK VAT: 20% · EU VAT: 17–27% · Australia GST: 10% · Canada GST: 5% · India GST: 5/12/18/28% · USA: 0–15% by state"/>
    </>}/>
  );
}
