'use client';
import { useState, useEffect } from 'react';
import { calcRetirement } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';
export default function RetirementCalc() {
  const [curr,setCurr]=useState('INR'),[age,setAge]=useState(30),[retAge,setRetAge]=useState(60),[exp,setExp]=useState(50000),[inf,setInf]=useState(6),[roi,setRoi]=useState(12),[life,setLife]=useState(85);
  const C=useCurr(curr); const r=calcRetirement(age,retAge,exp,inf,roi,life);

  useEffect(() => {
    saveHistory({
      calcSlug: 'retirement', calcName: 'Retirement Calculator',
      summary: `Retire at ${retAge} — need ${C.sym}${fmtFull(r.corpus,0)}, save ${C.sym}${fmtFull(r.monthly,0)}/mo`,
      inputs: { age, retAge, exp, inf, roi, life },
    });
  }, [age, retAge, exp, inf, roi, life]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div className="grid grid-cols-2 gap-3">
        <NumIn label="Current age" value={age} onChange={setAge} min={18} max={60}/>
        <NumIn label="Retirement age" value={retAge} onChange={setRetAge} min={40} max={80}/>
        <NumIn label="Life expectancy" value={life} onChange={setLife} min={60} max={100}/>
        <PctIn label="Inflation %" value={inf} onChange={setInf} step={0.5}/>
        <PctIn label="Return %" value={roi} onChange={setRoi} step={0.5}/>
      </div>
      <MoneyIn label="Monthly expenses today" value={exp} onChange={setExp} sym={C.sym} step={5000}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Retire at {retAge} — you have {r.yrs} years</h3>
      <p className="text-sm text-gray-500">{C.sym+fmtFull(exp,2)}/mo today becomes {C.sym+fmtFull(r.futureExpense,2)}/mo at retirement after {inf}% inflation</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 mb-0">Corpus needed</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.corpus, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.corpus,2)}</p>
        </div>
        <div className="result-card col-span-2 md:col-span-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-blue-600 mb-0">Save monthly now</p>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.monthly, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-blue-500">{C.sym}{fmtFull(r.monthly,2)}</p>
        </div>
        <Stat label="Monthly need at retirement" value={C.sym+fmtFull(r.futureExpense,2)} color={TC.gray}/>
        <Stat label="Your FIRE number" value={C.sym+fmtFull(r.fireNum,2)} color={TC.teal} sub="25× annual expenses"/>
        <Stat label="4% safe withdrawal" value={C.sym+fmtFull(r.safe4pct,2)+'/mo'} color={TC.green}/>
        <Stat label="Years to retire" value={r.yrs+" years"} color={TC.orange}/>
      </div>
      <Box icon="💡 The 4% rule" text={"Save "+C.sym+fmtFull(r.corpus,2)+", withdraw "+C.sym+fmtFull(r.safe4pct,2)+"/month ("+C.sym+fmtFull(r.safe4pct*12,2)+"/year) — historically sustainable for 30+ years."} color="orange"/>
    </>}/>
  );
}