'use client';
import { useState, useEffect } from 'react';
import { calcTaxRegimeCompare } from '@/lib/calc';
import { Shell, MoneyIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function TaxRegimeCompareCalc() {
  const [gross, setGross] = useState(1200000);
  const [deductions80C, setDeductions80C] = useState(150000);
  const [hra, setHra] = useState(100000);
  const [other, setOther] = useState(25000);
  const C = useCurr('INR');
  const r = calcTaxRegimeCompare(gross, deductions80C, hra, other);

  useEffect(() => {
    saveHistory({
      calcSlug: 'tax-regime-compare', calcName: 'Old vs New Tax Regime',
      summary: `₹${gross} gross — ${r.better === 'old' ? 'Old' : 'New'} regime saves ${C.sym}${fmtFull(r.savings,0)}`,
      inputs: { gross, deductions80C, hra, other },
    });
  }, [gross, deductions80C, hra, other]);

  return (
    <Shell left={<>
      <MoneyIn label="Annual gross income" value={gross} onChange={setGross} sym={C.sym} step={50000}/>
      <MoneyIn label="Section 80C investments (PPF, ELSS, EPF, life insurance)" value={deductions80C} onChange={setDeductions80C} sym={C.sym} step={10000} hint="Capped at ₹1.5L — only relevant under the old regime"/>
      <MoneyIn label="HRA exemption claimed" value={hra} onChange={setHra} sym={C.sym} step={10000} hint="Only relevant under the old regime"/>
      <MoneyIn label="Other deductions (80D health insurance, home loan interest, etc.)" value={other} onChange={setOther} sym={C.sym} step={5000} hint="Only relevant under the old regime"/>
      <Box icon="💡 Why this matters" text="The new regime has lower rates but allows almost no deductions. The old regime has higher rates but lets you offset tax with 80C, HRA and other claims. Which wins depends entirely on how much you can actually deduct." color="orange"/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Old vs New Tax Regime</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className={`result-card text-center ${r.better === 'old' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : ''}`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1">Old Regime {r.better === 'old' && '🏆'}</p>
          <p className={`calc-num-md ${r.better === 'old' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{C.sym}{fmtFull(r.old.tax,0)}</p>
          <p className="text-[10px] text-gray-400 mt-1">tax on {C.sym}{fmtFull(r.old.taxable,0)} taxable</p>
        </div>
        <div className={`result-card text-center ${r.better === 'new' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : ''}`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1">New Regime {r.better === 'new' && '🏆'}</p>
          <p className={`calc-num-md ${r.better === 'new' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{C.sym}{fmtFull(r.new.tax,0)}</p>
          <p className="text-[10px] text-gray-400 mt-1">tax on {C.sym}{fmtFull(r.new.taxable,0)} taxable</p>
        </div>
      </div>

      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600 mb-0">{r.better === 'old' ? 'Old regime saves you' : 'New regime saves you'}</p>
        <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.savings,2)}<span className="text-base font-semibold">/year</span></p>
      </div>

      <Stat label="Deductions claimed (old regime only)" value={`${C.sym}${fmtFull(r.old.deductionsUsed,0)}`} color={TC.gray}/>
      <Stat label="In-hand income" value={`Old: ${C.sym}${fmtFull(r.old.inHand,0)} · New: ${C.sym}${fmtFull(r.new.inHand,0)}`} color={TC.green}/>

      <Box icon="📌 Rule of thumb" text={`If your total deductions (80C + HRA + others) exceed roughly ₹${(r.breakEvenDeductions/100000).toFixed(1)}L, the old regime tends to win. Below that, the new regime's lower rates usually come out ahead — this calculator gives you the exact answer for your numbers, not a generic rule.`}/>
    </>}/>
  );
}
