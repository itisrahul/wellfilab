'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { calcTermVsUlip } from '@/lib/calc';
import { Shell, MoneyIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function TermVsUlipCalc() {
  const [sumAssured, setSumAssured] = useState(10000000);
  const [age, setAge] = useState(30);
  const [years, setYears] = useState(25);
  const [ulipPremium, setUlipPremium] = useState(80000);
  const C = useCurr('INR');
  const r = calcTermVsUlip(sumAssured, age, years, ulipPremium);

  useEffect(() => {
    saveHistory({
      calcSlug: 'term-vs-ulip', calcName: 'Term Insurance vs ULIP',
      summary: `${C.sym}${fmtFull(sumAssured,0)} cover, ${years}yr — ${r.better === 'term' ? 'Buy term + invest' : 'ULIP'} wins by ${C.sym}${fmtFull(r.advantage,0)}`,
      inputs: { sumAssured, age, years, ulipPremium },
    });
  }, [sumAssured, age, years, ulipPremium]);

  const chartData = [
    { name: 'Term + Invest', value: r.termPlusInvestFV },
    { name: 'ULIP/Endowment', value: r.ulipFV },
  ];

  return (
    <Shell left={<>
      <MoneyIn label="Life cover needed (sum assured)" value={sumAssured} onChange={setSumAssured} sym={C.sym} step={1000000}/>
      <NumIn label="Current age" value={age} onChange={setAge} min={18} max={60}/>
      <NumIn label="Policy term (years)" value={years} onChange={setYears} min={5} max={40}/>
      <MoneyIn label="ULIP / endowment annual premium you're considering" value={ulipPremium} onChange={setUlipPremium} sym={C.sym} step={5000} hint={`Estimated term insurance for the same cover: ${C.sym}${fmtFull(r.termPremium,0)}/year`}/>
      <Box icon="💡 The core idea" text="A ULIP/endowment plan bundles insurance and investment into one product, but usually does both worse than buying them separately. Term insurance is much cheaper for the same cover — this compares investing the premium you save instead." color="orange"/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Buy Term + Invest vs ULIP/Endowment</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className={`result-card text-center ${r.better === 'term' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : ''}`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1">Term + Invest {r.better === 'term' && '🏆'}</p>
          <p className={`calc-num-md ${r.better === 'term' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{fmtSmart(r.termPlusInvestFV, C.sym)}</p>
          <p className="text-[10px] text-gray-400 mt-1">at maturity, plus full {fmtSmart(sumAssured, C.sym)} life cover throughout</p>
        </div>
        <div className={`result-card text-center ${r.better === 'ulip' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : ''}`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1">ULIP/Endowment {r.better === 'ulip' && '🏆'}</p>
          <p className={`calc-num-md ${r.better === 'ulip' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{fmtSmart(r.ulipFV, C.sym)}</p>
          <p className="text-[10px] text-gray-400 mt-1">at maturity, bundled cover only while active</p>
        </div>
      </div>

      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600 mb-0">{r.better === 'term' ? '"Buy term, invest the rest" wins by' : 'ULIP wins by'}</p>
        <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.advantage,2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Term premium (est.)" value={`${C.sym}${fmtFull(r.termPremium,0)}/yr`} color={TC.gray}/>
        <Stat label="Freed up to invest" value={`${C.sym}${fmtFull(r.difference,0)}/yr`} color={TC.green}/>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Maturity value comparison</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{top:5,right:5,bottom:5,left:5}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name" tick={{fontSize:11}}/>
            <YAxis tickFormatter={v=>fmtSmart(v,C.sym)} tick={{fontSize:10}} width={70}/>
            <Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,0)}`,'Maturity value']}/>
            <Bar dataKey="value" radius={[6,6,0,0]}>
              {chartData.map((_,i)=><Cell key={i} fill={i===0 ? '#10b981' : '#94a3b8'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Box icon="⚠️ Estimates, not quotes" text="Term insurance premiums here are a directional benchmark by age band, not a real quote — actual pricing depends on your health, smoker status and insurer. ULIP returns assume a 6% net-of-charges long-run average; term-and-invest assumes 12% equity-like returns on the difference. Get real quotes before deciding." color="red"/>
    </>}/>
  );
}
