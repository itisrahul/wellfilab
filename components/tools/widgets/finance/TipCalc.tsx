'use client';
import { useState } from 'react';
import { calcTip } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';

export default function TipCalc() {
  const [curr, setCurr] = useState('USD');
  const [bill, setBill] = useState(80);
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(2);
  const C = useCurr(curr);
  const r = calcTip(bill, tipPct, people);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Bill total" value={bill} onChange={setBill} sym={C.sym} step={5}/>
        <div>
          <label className="calc-label">Tip percentage</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[10, 15, 18, 20, 22, 25].map(t => (
              <button key={t} onClick={() => setTipPct(t)}
                className={`px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                  tipPct === t
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'
                }`}>
                {t}%
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500">
            <input type="number" value={tipPct} onChange={e => setTipPct(+e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
              style={{ fontFamily: 'var(--font-mono, monospace)' }}/>
            <span className="px-3 flex items-center text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 text-sm">%</span>
          </div>
        </div>
        <div>
          <label className="calc-label">Number of people</label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
              <button key={n} onClick={() => setPeople(n)}
                className={`px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                  people === n
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Tip &amp; Split — {C.sym}{fmtFull(bill, 2)} bill
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Tip amount</p>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.tip, 2)}</p>
          </div>
          <div className="result-card bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <p className="result-label text-blue-600 dark:text-blue-400">Total (bill + tip)</p>
            <p className="calc-num-lg text-blue-500 dark:text-blue-400">{C.sym}{fmtFull(r.total, 2)}</p>
          </div>
          {people > 1 && (
            <Stat label="Each person pays" value={C.sym + fmtFull(r.perPerson, 2)} color={TC.green}/>
          )}
          {people > 1 && (
            <Stat label="Each person's tip" value={C.sym + fmtFull(r.tipPerPerson, 2)} color={TC.gray}/>
          )}
        </div>
        <Box
          icon="🌍 Tipping by country"
          text="USA/Canada: 15–20% expected. UK/Australia: 10–15% appreciated. Most of Europe: round up or 5–10%. Japan/Korea/China: tipping is uncommon or considered rude."
        />
      </>}
    />
  );
}
