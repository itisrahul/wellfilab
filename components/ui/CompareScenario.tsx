'use client';
import { useState } from 'react';

// Compare two investment scenarios side by side
interface Scenario { label: string; amount: number; rate: number; years: number }

function calc(s: Scenario) {
  const final    = s.amount * Math.pow(1 + s.rate / 100, s.years);
  const interest = final - s.amount;
  const ror      = ((final / s.amount) - 1) * 100;
  return { final, interest, ror };
}

const fmt = (n: number) => {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
};

export function CompareScenario() {
  const [a, setA] = useState<Scenario>({ label: 'Conservative', amount: 100000, rate: 7, years: 10 });
  const [b, setB] = useState<Scenario>({ label: 'Growth',        amount: 100000, rate: 12, years: 10 });

  const ra = calc(a), rb = calc(b);
  const winner = ra.final > rb.final ? 'A' : 'B';
  const diff = Math.abs(ra.final - rb.final);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <span className="text-lg">⚖️</span>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Compare Two Scenarios</h3>
        <span className="text-xs text-gray-400 ml-auto">Compound interest</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
        {([a, b] as Scenario[]).map((s, idx) => {
          const r = idx === 0 ? ra : rb;
          const isWinner = (idx === 0 && winner === 'A') || (idx === 1 && winner === 'B');
          const color = idx === 0 ? 'teal' : 'orange';
          const setS = idx === 0 ? setA : setB;
          return (
            <div key={idx} className={`p-4 ${isWinner ? `bg-${color}-50 dark:bg-${color}-950/10` : ''}`}>
              <div className={`flex items-center gap-1.5 mb-3`}>
                <span className={`w-2 h-2 rounded-full ${idx===0?'bg-teal-500':'bg-orange-500'}`}/>
                <input value={s.label} onChange={e => setS(p => ({...p, label: e.target.value}))}
                  className="text-xs font-bold bg-transparent text-gray-700 dark:text-gray-300 w-full focus:outline-none" />
                {isWinner && <span className="text-[10px] bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">WINS</span>}
              </div>

              <div className="space-y-2 mb-3">
                {[
                  { label:'Amount (₹)', key:'amount', min:0, max:1e8, step:10000 },
                  { label:'Rate (%)', key:'rate', min:0, max:50, step:0.5 },
                  { label:'Years', key:'years', min:1, max:40, step:1 },
                ].map(({ label, key, min, max, step }) => (
                  <div key={key}>
                    <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                    <input type="number" value={s[key as keyof Scenario] as number}
                      min={min} max={max} step={step}
                      onChange={e => setS(p => ({...p, [key]: +e.target.value || 0}))}
                      className={`w-full px-2 py-1.5 text-xs border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none ${idx===0?'border-teal-200 dark:border-teal-800 focus:border-teal-400':'border-orange-200 dark:border-orange-800 focus:border-orange-400'}`}
                    />
                  </div>
                ))}
              </div>

              <div className={`p-3 rounded-xl ${idx===0?'bg-teal-50 dark:bg-teal-950/20':'bg-orange-50 dark:bg-orange-950/20'}`}>
                <p className="text-[10px] text-gray-400 mb-1">Final Value</p>
                <p className={`font-black text-lg font-mono ${idx===0?'text-teal-600 dark:text-teal-400':'text-orange-500 dark:text-orange-400'}`}>
                  {fmt(r.final)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  +{fmt(r.interest)} · {r.ror.toFixed(0)}% gain
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Difference bar */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Difference</span>
          <span className="font-bold text-green-600 dark:text-green-400">{fmt(diff)} more with {winner === 'A' ? a.label : b.label}</span>
        </div>
        <div className="mt-2 h-2 rounded-full overflow-hidden flex">
          <div className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${(ra.final / (ra.final + rb.final)) * 100}%` }} />
          <div className="h-full bg-orange-500 flex-1 transition-all duration-500" />
        </div>
      </div>
    </div>
  );
}
