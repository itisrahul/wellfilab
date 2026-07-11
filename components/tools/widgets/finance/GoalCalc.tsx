'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function GoalCalc() {
  const [curr,    setCurr]    = useState('INR');
  const [target,  setTarget]  = useState(10000000);  // 1 Cr
  const [current, setCurrent] = useState(0);
  const [rate,    setRate]    = useState(12);
  const [years,   setYears]   = useState(15);
  const [inflation, setInflation] = useState(0); // optional inflation-adjust target

  const C = useCurr(curr);

  // Inflation-adjusted target
  const realTarget = inflation > 0
    ? target * Math.pow(1 + inflation / 100, years)
    : target;

  // Monthly SIP needed: PMT formula
  const r  = rate / 100 / 12;
  const n  = years * 12;
  const fv = realTarget - current * Math.pow(1 + rate / 100, years);
  const monthly = fv <= 0 ? 0 : r > 0
    ? Math.ceil(fv * r / (Math.pow(1 + r, n) - 1))
    : Math.ceil(fv / n);

  // Lump-sum needed (if investing once now)
  const lumpNeeded = realTarget / Math.pow(1 + rate / 100, years) - current;

  // Year-by-year growth chart
  const rows = Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const invested = monthly * 12 * y + current;
    const portfolio = monthly * 12 * ((Math.pow(1 + r, y * 12) - 1) / r) * (1 + r)
      + current * Math.pow(1 + rate / 100, y);
    return { year: y, portfolio: Math.round(portfolio), target: Math.round(realTarget) };
  });

  // Years to reach target with different rates
  const scenarios = [rate - 4, rate - 2, rate, rate + 2, rate + 4]
    .filter(x => x > 0)
    .map(altRate => {
      const ar = altRate / 100 / 12;
      const altPortfolio = monthly * 12 * ((Math.pow(1 + ar, n) - 1) / ar) * (1 + ar)
        + current * Math.pow(1 + altRate / 100, years);
      return { rate: altRate, value: Math.round(altPortfolio) };
    });

  useEffect(() => {
    if (monthly > 0) {
      saveHistory({
        calcSlug: 'investment-goal', calcName: 'Goal Calculator',
        summary: `Save ${C.sym}${fmtFull(monthly,0)}/mo to reach ${C.sym}${fmtFull(realTarget,0)} in ${years}yr`,
        inputs: { target, current, rate, years },
      });
    }
  }, [target, current, rate, years, inflation]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Your target amount" value={target} onChange={setTarget} sym={C.sym} step={500000}
        hint={`= ${C.sym}${fmtFull(target,0)}`}/>
      <MoneyIn label="Already saved (current corpus)" value={current} onChange={setCurrent} sym={C.sym} step={50000}/>
      <div className="grid grid-cols-2 gap-3">
        <PctIn label="Expected return %" value={rate} onChange={setRate} step={0.5}/>
        <NumIn label="Years to goal" value={years} onChange={setYears} min={1} max={40}/>
      </div>
      <PctIn label="Inflation adjustment % (optional)"
        value={inflation} onChange={setInflation} step={0.5}
        hint={inflation > 0 ? `Inflation-adjusted target: ${C.sym}${fmtFull(realTarget,0)}` : 'Set >0 to adjust target for inflation'}/>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 break-words">
          Reach {C.sym}{fmtFull(realTarget,0)} in {years} years
        </h3>
        {inflation > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 break-words">
            Target inflated from {C.sym}{fmtFull(target,0)} at {inflation}% p.a.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 dark:text-orange-400 mb-0">Monthly SIP needed</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(monthly, C.sym)}/mo</span>
          </div>
          <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(monthly, 0)}</p>
          <p className="text-xs text-gray-400 mt-1">per month</p>
        </div>
        <div className="result-card bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-blue-600 mb-0">Lump sum alternative</p>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(Math.max(0, lumpNeeded), C.sym)}</span>
          </div>
          <p className="calc-num-lg text-blue-500">{C.sym}{fmtFull(Math.max(0, lumpNeeded), 0)}</p>
          <p className="text-xs text-gray-400 mt-1">invest now once</p>
        </div>
        <div className="result-card bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-green-600 mb-0">Total you invest</p>
            <span className="text-[10px] font-mono text-green-500 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(monthly * 12 * years + current, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-green-600">{C.sym}{fmtFull(monthly * 12 * years + current, 0)}</p>
        </div>
        <Stat label="Returns generated" value={`${C.sym}${fmtFull(realTarget - (monthly * 12 * years + current), 0)}`} color={TC.green}/>
        <Stat label="Monthly as % of ₹1L salary" value={`${((monthly / 100000) * 100).toFixed(1)}%`} color={TC.gray}/>
      </div>

      <Box icon="💡 What if the rate changes?" color="orange"
        text={`At ${rate}% you need ${C.sym}${fmtFull(monthly,0)}/month. At ${rate-2}% you'd need ${C.sym}${fmtFull(scenarios.find(s=>s.rate===rate-2)?.value ?? 0 < realTarget ? monthly * 1.25 : monthly, 0)}/month — which is why rate of return is the biggest lever.`}/>

      {/* Rate sensitivity table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-orange-500 px-4 py-2">
          <p className="text-xs font-bold text-white">What your monthly SIP reaches at different rates</p>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 dark:bg-gray-800">
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Return</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Portfolio at {years}y</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">vs Target</th>
          </tr></thead>
          <tbody>
            {scenarios.map(s => {
              const diff = s.value - realTarget;
              return (
                <tr key={s.rate} className={`border-t border-gray-100 dark:border-gray-800 ${s.rate === rate ? 'bg-orange-50 dark:bg-orange-950/10 font-bold' : ''}`}>
                  <td className="px-3 py-2 font-mono">{s.rate}%</td>
                  <td className="px-3 py-2 font-mono break-all">{C.sym}{fmtFull(s.value,0)}</td>
                  <td className={`px-3 py-2 font-mono text-xs break-all ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {diff >= 0 ? '+' : ''}{C.sym}{fmtFull(diff,0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Growth chart */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Portfolio growth vs target</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rows} margin={{top:5,right:5,bottom:5,left:5}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="year" tick={{fontSize:11}} label={{value:'Year',position:'insideBottomRight',offset:-5,fontSize:11}}/>
            <YAxis tickFormatter={v => fmtSmart(v, C.sym)} tick={{fontSize:10}} width={70}/>
            <Tooltip formatter={(v:number) => [`${C.sym}${fmtFull(v,0)}`,undefined]} labelFormatter={l=>`Year ${l}`}/>
            <ReferenceLine y={realTarget} stroke="#f97316" strokeDasharray="6 2" label={{value:'Target',position:'right',fontSize:11,fill:'#f97316'}}/>
            <Line type="monotone" dataKey="portfolio" name="Your portfolio" stroke="#3b82f6" strokeWidth={2.5} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>}/>
  );
}
