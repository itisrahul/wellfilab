'use client';
import { useState, useEffect } from 'react';
import { calcMargin } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

type Mode = 'margin' | 'revenue' | 'cost';

export default function MarginCalc() {
  const [curr, setCurr] = useState('INR');
  const [mode, setMode] = useState<Mode>('margin');
  const [cost, setCost] = useState(600);
  const [revenue, setRevenue] = useState(1000);
  const [targetMargin, setTargetMargin] = useState(40);
  const C = useCurr(curr);

  // Derive an effective cost/revenue pair for every mode so calcMargin can
  // always run the same way — revenue/cost modes just solve for the
  // missing side first, using the standard margin identity.
  let effCost = cost, effRevenue = revenue;
  if (mode === 'revenue') effRevenue = targetMargin >= 100 ? cost * 1000 : cost / (1 - targetMargin / 100);
  if (mode === 'cost') effCost = revenue * (1 - targetMargin / 100);

  const r = calcMargin(effCost, effRevenue);

  useEffect(() => {
    saveHistory({
      calcSlug: 'margin', calcName: 'Margin Calculator',
      summary: `Margin ${r.grossMargin}% · Markup ${r.markup}% · Profit ${C.sym}${fmtFull(r.profit,0)}`,
      inputs: { mode, cost, revenue, targetMargin },
    });
  }, [mode, cost, revenue, targetMargin]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div>
        <label className="calc-label">Mode</label>
        <div className="grid grid-cols-1 gap-1.5">
          {([
            { k: 'margin' as const, l: 'Calculate Margin' },
            { k: 'revenue' as const, l: 'Calculate Revenue' },
            { k: 'cost' as const, l: 'Calculate Cost' },
          ]).map(o => (
            <button key={o.k} onClick={() => setMode(o.k)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all text-left ${mode===o.k?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{o.l}</button>
          ))}
        </div>
      </div>
      {mode === 'margin' && <>
        <MoneyIn label="Cost" value={cost} onChange={setCost} sym={C.sym} step={10}/>
        <MoneyIn label="Revenue / selling price" value={revenue} onChange={setRevenue} sym={C.sym} step={10}/>
      </>}
      {mode === 'revenue' && <>
        <MoneyIn label="Cost" value={cost} onChange={setCost} sym={C.sym} step={10}/>
        <PctIn label="Target margin %" value={targetMargin} onChange={setTargetMargin} step={1}/>
      </>}
      {mode === 'cost' && <>
        <MoneyIn label="Revenue" value={revenue} onChange={setRevenue} sym={C.sym} step={10}/>
        <PctIn label="Target margin %" value={targetMargin} onChange={setTargetMargin} step={1}/>
      </>}
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
        {mode === 'margin' ? 'Margin & Markup' : mode === 'revenue' ? 'Selling Price Needed' : 'Maximum Allowable Cost'}
      </h3>
      {mode === 'revenue' && (
        <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Selling price needed</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(effRevenue,2)}</p>
        </div>
      )}
      {mode === 'cost' && (
        <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Maximum allowable cost</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(effCost,2)}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Gross Profit Margin" value={`${fmtFull(r.grossMargin)}%`} color={TC.orange}/>
        <Stat label="Markup %" value={`${fmtFull(r.markup)}%`} color={TC.blue}/>
        <Stat label="Net profit" value={`${C.sym}${fmtFull(r.profit,2)}`} color={TC.green}/>
        <Stat label="Cost ratio" value={`${fmtFull(r.costRatio)}%`} color={TC.gray}/>
      </div>
      <Box icon="💡 Margin vs Markup" text="Margin = profit ÷ revenue × 100. Markup = profit ÷ cost × 100. They're not the same — a 50% markup gives only a 33% margin. Price using margin if you want a specific % of revenue as profit."/>
    </>}/>
  );
}
