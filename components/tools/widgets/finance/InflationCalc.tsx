'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcInflation } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function InflationCalc() {
  const [curr,setCurr]=useState('INR'),[amount,setAmount]=useState(10000),[rate,setRate]=useState(6),[years,setYears]=useState(10),[dir,setDir]=useState<'future'|'past'>('future');
  const C=useCurr(curr); const r=calcInflation(amount,rate,years,dir);
  const chart=Array.from({length:Math.min(years,30)},(_,i)=>({year:i+1,value:Math.round(calcInflation(amount,rate,i+1,dir).result)}));
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div className="flex overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
        <button onClick={()=>setDir('future')} className={`flex-1 py-2.5 text-xs font-bold transition-all ${dir==='future'?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Future cost</button>
        <button onClick={()=>setDir('past')}   className={`flex-1 py-2.5 text-xs font-bold transition-all ${dir==='past'?'bg-orange-500 text-white':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Past value</button>
      </div>
      <MoneyIn label={dir==='future'?'Amount today':'Amount in the past'} value={amount} onChange={setAmount} sym={C.sym} step={100}/>
      <PctIn label="Annual inflation rate" value={rate} onChange={setRate} step={0.5}/>
      <NumIn label="Number of years" value={years} onChange={setYears} min={1} max={50}/>
      <div className="flex flex-wrap gap-1.5">{[2,4,6,8,10].map(v=><button key={v} onClick={()=>setRate(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${rate===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v}%</button>)}</div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Inflation — {rate}% over {years} years</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">{dir==='future'?'Future value':'Past value'}</p>
          <p className="calc-num-lg text-orange-500">{C.sym+fmtFull(r.result,2)}</p>
        </div>
        <Stat label="Original amount" value={C.sym+fmtFull(amount,2)} color={TC.gray}/>
        <Stat label="Change" value={C.sym+fmtFull(Math.abs(r.result-amount),2)} color={dir==='future'?TC.red:TC.green}/>
        <Stat label="Inflation factor" value={"×"+r.factor} color={TC.teal}/>
      </div>
      <Box icon={dir==='future'?'💸 Inflation erodes value':'📈 Past purchasing power'} text={dir==='future'?("At "+rate+"% inflation, "+C.sym+fmtFull(amount,2)+" today needs "+C.sym+fmtFull(r.result,2)+" in "+years+" years."):(""+C.sym+fmtFull(amount,2)+" from "+years+" years ago had the purchasing power of "+C.sym+fmtFull(r.result,2)+" today.")} color={dir==='future'?'orange':'teal'}/>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={200}><LineChart data={chart} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>C.sym+fmtFull(v/1000,0)+'K'} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[C.sym+fmtFull(v,2),undefined]} labelFormatter={l=>`Year ${l}`}/><Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div>
    </>}/>
  );
}