'use client';
import { useState, useEffect } from 'react';
import { calcEmergencyFund } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const STABILITY = [
  { label: 'Dual income, stable jobs', months: 3 },
  { label: 'Single income, stable job', months: 6 },
  { label: 'Variable/commission income', months: 9 },
  { label: 'Freelance or business owner', months: 12 },
];

export default function EmergencyFundCalc() {
  const [curr, setCurr] = useState('INR');
  const [expenses, setExpenses] = useState(40000);
  const [stability, setStability] = useState(6);
  const [current, setCurrent] = useState(50000);
  const C = useCurr(curr);
  const r = calcEmergencyFund(expenses, stability, current);

  useEffect(() => {
    saveHistory({
      calcSlug: 'emergency-fund', calcName: 'Emergency Fund Calculator',
      summary: `Target ${C.sym}${fmtFull(r.target,0)} (${r.months}mo) — gap ${C.sym}${fmtFull(r.gap,0)}`,
      inputs: { expenses, stability, current },
    });
  }, [expenses, stability, current]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Essential monthly expenses" value={expenses} onChange={setExpenses} sym={C.sym} step={2000}
          hint="Rent/EMI, utilities, groceries, insurance, minimum debt payments — not discretionary spending"/>
        <div>
          <label className="calc-label">Your situation</label>
          <div className="flex flex-col gap-1.5">
            {STABILITY.map(s => (
              <button key={s.months} onClick={() => setStability(s.months)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  stability === s.months
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'
                }`}>
                {s.label} <span className="opacity-70">({s.months} months)</span>
              </button>
            ))}
          </div>
        </div>
        <MoneyIn label="Current emergency savings" value={current} onChange={setCurrent} sym={C.sym} step={5000}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          {r.months}-month emergency fund target
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Target fund size</p>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.target, C.sym)}</span>
            </div>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.target, 0)}</p>
          </div>
          <Stat label="Still need to save" value={`${C.sym}${fmtFull(r.gap,0)}`} color={r.gap > 0 ? TC.orange : TC.green}/>
          <Stat label="Currently covers" value={`${r.monthsCovered} months`} color={TC.gray}/>
        </div>
        <Box icon="💡 Keep it boring" color="orange"
          text="An emergency fund's job is to be liquid and stable, not to maximize returns — a high-yield savings account or liquid mutual fund is ideal. Avoid locking it in instruments with early-withdrawal penalties or market risk."/>
      </>}
    />
  );
}
