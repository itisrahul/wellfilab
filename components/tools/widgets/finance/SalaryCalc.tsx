'use client';
import { useState } from 'react';
import { calcSalary } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Table, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function SalaryCalc() {
  const [curr,setCurr]=useState('USD'),[gross,setGross]=useState(75000),[tax,setTax]=useState(22),[pension,setPension]=useState(5),[other,setOther]=useState(3);
  const C=useCurr(curr); const r=calcSalary(gross,tax,pension,other);
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Annual gross salary" value={gross} onChange={setGross} sym={C.sym} step={5000}/>
      <PctIn label="Effective tax rate" value={tax} onChange={setTax} step={1}/>
      <PctIn label="Pension / retirement %" value={pension} onChange={setPension} step={0.5}/>
      <PctIn label="Other deductions %" value={other} onChange={setOther} step={0.5} hint="Health insurance, social security, etc."/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Take-Home Pay — {C.sym+fmtFull(gross,2)}/year</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">Monthly take-home</p>
          <p className="calc-num-lg text-orange-500">{C.sym+fmtFull(r.monthly,2)}</p>
        </div>
        <Stat label="Weekly take-home" value={C.sym+fmtFull(r.weekly,2)} color={TC.teal}/>
        <Stat label="Annual take-home" value={C.sym+fmtFull(r.net,2)} color={TC.green}/>
        <Stat label="Income tax" value={C.sym+fmtFull(r.tax,2)} color={TC.red}/>
      </div>
      <Table headers={['Component','Annual','Monthly']} rows={[
        ['Gross Salary',C.sym+fmtFull(gross,2),C.sym+fmtFull(Math.round(gross/12),2)],
        ['Income Tax ('+tax+'%, −)',C.sym+fmtFull(r.tax,2),C.sym+fmtFull(Math.round(r.tax/12),2)],
        ['Pension ('+pension+'%, −)',C.sym+fmtFull(r.pension,2),C.sym+fmtFull(Math.round(r.pension/12),2)],
        ['Other ('+other+'%, −)',C.sym+fmtFull(r.other,2),C.sym+fmtFull(Math.round(r.other/12),2)],
        ['Net Take-Home',C.sym+fmtFull(r.net,2),C.sym+fmtFull(r.monthly,2)],
      ]} note="Approximate. Deductions vary by country and employer."/>
    </>}/>
  );
}