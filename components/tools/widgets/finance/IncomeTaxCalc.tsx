'use client';
import { useState } from 'react';
import { calcIncomeTax } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, Stat, Box, Table, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function IncomeTaxCalc() {
  const [curr,setCurr]=useState('USD'),[gross,setGross]=useState(75000),[ded,setDed]=useState(13850);
  const C=useCurr(curr); const r=calcIncomeTax(gross,ded);
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Annual gross income" value={gross} onChange={setGross} sym={C.sym} step={5000}/>
      <MoneyIn label="Total deductions" value={ded} onChange={setDed} sym={C.sym} step={500} hint="Standard, retirement, mortgage interest, etc."/>
      <div className="flex flex-wrap gap-1.5">{[{l:'US Standard (Single)',v:13850},{l:'US Standard (Married)',v:27700},{l:'None',v:0}].map(b=><button key={b.v} onClick={()=>setDed(b.v)} className="px-2.5 py-1.5 rounded-lg text-xs border-2 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-orange-400 transition-all">{b.l}</button>)}</div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Income Tax Estimate</h3>
      <p className="text-sm text-gray-500">Taxable income: {C.sym+fmtFull(gross,2)} − {C.sym+fmtFull(ded,2)} = <strong>{C.sym+fmtFull(r.taxable,2)}</strong></p>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">Estimated tax</p>
          <p className="calc-num-lg text-red-500">{C.sym+fmtFull(r.tax,2)}</p>
        </div>
        <Stat label="Effective rate" value={r.effective+'%'} color={TC.orange}/>
        <Stat label="Monthly tax" value={C.sym+fmtFull(r.monthly,2)} color={TC.gray}/>
        <Stat label="After-tax income" value={C.sym+fmtFull(gross-r.tax,2)} color={TC.green}/>
      </div>
      <Table headers={['Tax Bracket','Rate','Amount']} rows={r.breakdown.map(b=>[b.bracket,b.rate+'%',C.sym+fmtFull(b.tax,2)])} note="US federal brackets. Consult a tax professional for your situation."/>
      <Box icon="💡 Reduce your tax" text={"Maximise pre-tax pension or 401k contributions. At "+r.effective+"% effective rate, every "+C.sym+fmtFull(1000,2)+" in pre-tax contributions saves "+C.sym+fmtFull(Math.round(1000*r.effective/100),2)+"."} color="orange"/>
    </>}/>
  );
}