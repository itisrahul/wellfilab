'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calcMortgage } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const TERMS = [10, 15, 20, 25, 30];
const PIE_COLORS = ['#f97316', '#3b82f6', '#0d9488', '#a855f7'];

export default function MortgageCalc() {
  const [curr, setCurr] = useState('INR');
  const [price, setPrice] = useState(5000000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [taxRate, setTaxRate] = useState(1);
  const [insurance, setInsurance] = useState(15000);
  const [view, setView] = useState('table');
  const C = useCurr(curr);

  const r = calcMortgage(price, downPct, rate, years, taxRate, insurance);
  const totalCost = price + r.totalInterest;
  const recommendedIncome = Math.round(r.totalMonthly * 100 / 30);

  const pieData = [
    { name: 'Principal', value: r.principal },
    { name: 'Interest', value: r.totalInterest },
    { name: 'Property tax (life of loan)', value: r.propertyTaxMonthly * years * 12 },
    { name: 'Insurance (life of loan)', value: r.insuranceMonthly * years * 12 },
  ];

  useEffect(() => {
    saveHistory({
      calcSlug: 'mortgage', calcName: 'Mortgage Calculator',
      summary: `${C.sym}${fmtFull(price,0)} home — EMI ${C.sym}${fmtFull(r.emi,0)}, total monthly ${C.sym}${fmtFull(r.totalMonthly,0)}`,
      inputs: { price, downPct, rate, years, taxRate, insurance },
    });
  }, [price, downPct, rate, years, taxRate, insurance]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Property price" value={price} onChange={setPrice} sym={C.sym} step={100000}/>
      <PctIn label="Down payment %" value={downPct} onChange={setDownPct} step={1}
        hint={`Down payment: ${C.sym}${fmtFull(r.downPayment,0)} · Loan: ${C.sym}${fmtFull(r.principal,0)}`}/>
      <PctIn label="Interest rate" value={rate} onChange={setRate} step={0.1}/>
      <div>
        <label className="calc-label">Loan term (years)</label>
        <div className="flex flex-wrap gap-1.5">
          {TERMS.map(t => (
            <button key={t} onClick={() => setYears(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${years===t?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{t}yr</button>
          ))}
        </div>
      </div>
      <PctIn label="Property tax % annually" value={taxRate} onChange={setTaxRate} step={0.1}/>
      <MoneyIn label="Home insurance annually" value={insurance} onChange={setInsurance} sym={C.sym} step={1000}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Mortgage Calculator</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 mb-0">EMI</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.emi, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.emi,2)}</p>
        </div>
        <div className="result-card col-span-2 md:col-span-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <p className="result-label text-blue-600 mb-0">Total monthly payment</p>
          <p className="calc-num-lg text-blue-500">{C.sym}{fmtFull(r.totalMonthly,2)}</p>
          <p className="text-xs text-gray-400 mt-1">EMI + tax + insurance</p>
        </div>
        <Stat label="Property tax /mo" value={`${C.sym}${fmtFull(r.propertyTaxMonthly,2)}`} color={TC.gray}/>
        <Stat label="Insurance /mo" value={`${C.sym}${fmtFull(r.insuranceMonthly,2)}`} color={TC.gray}/>
        <Stat label="Total interest" value={`${C.sym}${fmtFull(r.totalInterest,2)}`} color={TC.red}/>
        <Stat label="Total cost of home" value={`${C.sym}${fmtFull(totalCost,2)}`} color={TC.orange}/>
      </div>
      <Box icon="💡 30% rule" text={`Rule of thumb: monthly payment should not exceed 30% of gross monthly income. For this EMI, recommended minimum income: ${C.sym}${fmtFull(recommendedIncome,0)}/month.`}/>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Where the money goes</p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e:any)=>`${((e.percent??0)*100).toFixed(0)}%`}>
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
            </Pie>
            <Tooltip formatter={(v:number)=>`${C.sym}${fmtFull(v,0)}`}/>
            <Legend wrapperStyle={{ fontSize: 11 }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Principal','Interest','Balance']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.principal,2)}`,`${C.sym}${fmtFull(row.interest,2)}`,`${C.sym}${fmtFull(row.balance,2)}`])} note="Standard amortization — early years pay mostly interest."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-400 py-16">See the pie chart above for the cost breakdown.</div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'Loan amount',v:`${C.sym}${fmtFull(r.principal,2)}`},{l:'EMI',v:`${C.sym}${fmtFull(r.emi,2)}`},{l:'Total monthly (all-in)',v:`${C.sym}${fmtFull(r.totalMonthly,2)}`},{l:'Total interest',v:`${C.sym}${fmtFull(r.totalInterest,2)}`},{l:'Total cost of home',v:`${C.sym}${fmtFull(totalCost,2)}`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
