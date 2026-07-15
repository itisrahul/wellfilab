'use client';
import { useState, useEffect } from 'react';
import { calcIRR, calcNPV } from '@/lib/calc';
import { Shell, MoneyIn, CurrPills, Stat, Box, Table, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const DEFAULT_FLOWS = [-500000, 80000, 100000, 120000, 150000, 200000];
const DISCOUNT_RATES = [8, 10, 12, 15];

export default function IRRCalc() {
  const [curr, setCurr] = useState('INR');
  const [flows, setFlows] = useState<number[]>(DEFAULT_FLOWS);
  const C = useCurr(curr);

  const irr = calcIRR(flows);
  const paybackMonth = (() => {
    let cum = flows[0];
    for (let i = 1; i < flows.length; i++) {
      cum += flows[i];
      if (cum >= 0) return i;
    }
    return null;
  })();

  const setFlow = (i: number, v: number) => setFlows(f => f.map((x, idx) => idx === i ? v : x));
  const addRow = () => flows.length < 11 && setFlows(f => [...f, 100000]);
  const removeRow = (i: number) => flows.length > 2 && setFlows(f => f.filter((_, idx) => idx !== i));

  useEffect(() => {
    saveHistory({
      calcSlug: 'irr', calcName: 'IRR Calculator',
      summary: `IRR = ${irr}% across ${flows.length} cashflows`,
      inputs: { flows: flows.join(',') },
    });
  }, [flows]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div>
        <label className="calc-label">Cashflows (Year 0 = initial investment, negative)</label>
        <div className="space-y-2">
          {flows.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 w-14 flex-shrink-0">Year {i}</span>
              <div className="flex-1"><MoneyIn label="" value={f} onChange={v => setFlow(i, i === 0 ? -Math.abs(v) : v)} sym={C.sym} step={10000}/></div>
              {flows.length > 2 && (
                <button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0 px-2" title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
        {flows.length < 11 && (
          <button onClick={addRow} className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600">+ Add year</button>
        )}
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Internal Rate of Return</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">IRR</p>
          <p className="calc-num-lg text-orange-500">{fmtFull(irr)}%</p>
        </div>
        <Stat label="Payback period" value={paybackMonth != null ? `Year ${paybackMonth}` : 'Not within horizon'} color={TC.teal}/>
        <Stat label="Total cash in" value={`${C.sym}${fmtFull(flows.slice(1).reduce((s,f)=>s+Math.max(0,f),0),2)}`} color={TC.gray}/>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">NPV at different discount rates</p>
        <Table headers={['Discount rate','NPV']} rows={DISCOUNT_RATES.map(rt => [`${rt}%`, `${C.sym}${fmtFull(calcNPV(rt, flows),2)}`])}
          note="Positive NPV at your cost of capital means the investment adds value."/>
      </div>
      <Box icon="💡 Reading your IRR" text={`IRR above your cost of capital = good investment. Compare ${fmtFull(irr)}% against an FD rate (~7%) or the stock market (~12%) to decide if this is worth it.`}/>
    </>}/>
  );
}
