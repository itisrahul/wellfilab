'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcFIREAdvanced } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, Table, ViewToggle, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

type FireType = 'standard' | 'lean' | 'fat' | 'custom';
const MULTIPLIER: Record<Exclude<FireType, 'custom'>, number> = { standard: 25, lean: 17.5, fat: 37.5 };

export default function FIRECalc() {
  const [curr, setCurr] = useState('INR');
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAge, setTargetAge] = useState(45);
  const [annExp, setAnnExp] = useState(600000);
  const [port, setPort] = useState(500000);
  const [monthly, setMonthly] = useState(20000);
  const [stepup, setStepup] = useState(0);
  const [inflation, setInflation] = useState(6);
  const [fireType, setFireType] = useState<FireType>('standard');
  const [customMult, setCustomMult] = useState(25);
  const [view, setView] = useState('table');
  const C = useCurr(curr);

  const years = Math.max(1, targetAge - currentAge);
  const selectedMultiplier = fireType === 'custom' ? Math.max(1, customMult) : MULTIPLIER[fireType];
  const effectiveExp = annExp * (selectedMultiplier / 25);

  // `base` (unscaled) drives the Lean/Standard/Fat comparison table;
  // `r` is scaled so its fireNum matches whichever type is selected —
  // equityPct/blendedReturn only depend on years, so they're identical
  // between the two calls, and everything target-dependent (deficit,
  // neededMonthly, months, rows) comes out correctly for the selected type.
  const base = calcFIREAdvanced(currentAge, targetAge, annExp, port, monthly, stepup, inflation);
  const r = calcFIREAdvanced(currentAge, targetAge, effectiveExp, port, monthly, stepup, inflation);

  const yearsLate = Math.max(0, Math.ceil((r.months - years * 12) / 12));
  const gapMonthly = Math.max(0, r.neededMonthly - monthly);

  useEffect(() => {
    saveHistory({
      calcSlug: 'fire', calcName: 'FIRE Calculator',
      summary: `FIRE number ${C.sym}${fmtFull(r.inflAdjFireNum, 0)} by age ${targetAge} — ${r.onTrack ? 'on track' : `${yearsLate}y late`}`,
      inputs: { currentAge, targetAge, annExp, port, monthly, stepup, inflation, fireType },
    });
  }, [currentAge, targetAge, annExp, port, monthly, stepup, inflation, fireType, customMult]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div className="grid grid-cols-2 gap-3">
        <NumIn label="Current age" value={currentAge} onChange={setCurrentAge} min={16} max={70}/>
        <NumIn label="Target FIRE age" value={targetAge} onChange={setTargetAge} min={currentAge + 1} max={80}
          hint={`${years} years to FIRE`}/>
      </div>
      <MoneyIn label="Annual living expenses" value={annExp} onChange={setAnnExp} sym={C.sym} step={10000} hint={C.sym+fmtFull(Math.round(annExp/12),2)+'/month'}/>
      <MoneyIn label="Current portfolio" value={port} onChange={setPort} sym={C.sym} step={50000}/>
      <MoneyIn label="Monthly investment" value={monthly} onChange={setMonthly} sym={C.sym} step={1000}/>
      <div>
        <label className="calc-label">Annual step-up %</label>
        <div className="flex flex-wrap gap-1.5">
          {[0,5,10,15,20].map(v=>(
            <button key={v} onClick={()=>setStepup(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${stepup===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v===0?'None':`+${v}%/yr`}</button>
          ))}
        </div>
      </div>
      <PctIn label="Inflation %" value={inflation} onChange={setInflation} step={0.5}/>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="calc-label">FIRE type</label>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {[
            { k: 'standard' as const, l: '🔥 Standard (25×)' },
            { k: 'lean' as const,     l: '🌿 Lean (17.5×)' },
            { k: 'fat' as const,      l: '💰 Fat (37.5×)' },
            { k: 'custom' as const,   l: '🏖️ Custom' },
          ].map(o => (
            <button key={o.k} onClick={() => setFireType(o.k)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${fireType===o.k?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>
              {o.l}
            </button>
          ))}
        </div>
        {fireType === 'custom' && (
          <NumIn label="Custom multiplier (× annual expenses)" value={customMult} onChange={setCustomMult} min={5} max={50} step={0.5}/>
        )}
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">FIRE — Financial Independence</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 mb-0">FIRE Number</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.inflAdjFireNum, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.inflAdjFireNum,2)}</p>
          <p className="text-xs text-gray-400 mt-1">Today's value: {C.sym}{fmtFull(r.fireNum,2)} · Inflation-adjusted to age {targetAge}</p>
        </div>
        <Stat label="Years to FIRE" value={`${r.yearsToFire}y ${r.remMonths}m`} color={TC.teal}/>
        <Stat label="On track?" value={r.onTrack ? '✅ Yes' : `⚠️ ${yearsLate}y late`} color={r.onTrack ? TC.green : TC.red}/>
        <Stat label="Monthly passive at FIRE" value={C.sym+fmtFull(r.monthlyPassive,2)} color={TC.green}/>
        <Stat label="Deficit to close" value={C.sym+fmtFull(r.deficit,2)} color={TC.red}/>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Recommended allocation for {years}-year horizon</p>
        <div className="h-6 rounded-full overflow-hidden flex mb-2">
          <div className="bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${r.equityPct}%` }}>{r.equityPct}%</div>
          <div className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${r.debtPct}%` }}>{r.debtPct}%</div>
        </div>
        <p className="text-xs text-gray-500">Equity {r.equityPct}% · Debt {r.debtPct}% — blended expected return: {r.blendedReturn}%</p>
        <p className="text-[11px] text-gray-400 mt-1">Based on: 12% equity + 7% debt returns</p>
      </div>

      {!r.onTrack && (
        <Box icon="⚠️ Off track" color="orange"
          text={`You need ${C.sym}${fmtFull(r.neededMonthly,2)}/month to retire at age ${targetAge}. Currently investing ${C.sym}${fmtFull(monthly,2)}/month. Gap: ${C.sym}${fmtFull(gapMonthly,2)}/month.`}/>
      )}

      <Table headers={['Type','FIRE number','Monthly passive (4% rule)']}
        rows={[
          ['Lean (17.5×)', `${C.sym}${fmtFull(base.leanFire,2)}`, `${C.sym}${fmtFull(Math.round(base.leanFire*0.04/12),2)}`],
          ['Standard (25×)', `${C.sym}${fmtFull(base.fireNum,2)}`, `${C.sym}${fmtFull(Math.round(base.fireNum*0.04/12),2)}`],
          ['Fat (37.5×)', `${C.sym}${fmtFull(base.fatFire,2)}`, `${C.sym}${fmtFull(Math.round(base.fatFire*0.04/12),2)}`],
        ]}
        note="Lean = 70% of lifestyle · Fat = 150% of lifestyle"/>

      <ViewToggle v={view} onChange={setView}/>
      {view==='table'&&<Table headers={['Year','Invested','Portfolio','FIRE target']} rows={r.rows.map(row=>[row.year,`${C.sym}${fmtFull(row.invested,2)}`,`${C.sym}${fmtFull(row.value,2)}`,`${C.sym}${fmtFull(row.target,2)}`])} note="Illustrative — assumes a constant blended return every year."/>}
      {view==='chart'&&<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><ResponsiveContainer width="100%" height={260}><LineChart data={r.rows} margin={{top:5,right:5,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={v=>`${C.sym}${fmtFull(v/1000,0)}K`} tick={{fontSize:10}} width={80}/><Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,2)}`,undefined]} labelFormatter={l=>`Year ${l}`}/><Legend/><Line type="monotone" dataKey="value" name="Portfolio" stroke="#3b82f6" strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="target" name="FIRE target" stroke="#f97316" strokeWidth={2} strokeDasharray="5 4" dot={false}/></LineChart></ResponsiveContainer></div>}
      {view==='summary'&&<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">{[{l:'FIRE type',v:fireType==='custom'?`Custom ${customMult}×`:fireType[0].toUpperCase()+fireType.slice(1)},{l:'FIRE number (today)',v:`${C.sym}${fmtFull(r.fireNum,2)}`},{l:`FIRE number (age ${targetAge})`,v:`${C.sym}${fmtFull(r.inflAdjFireNum,2)}`},{l:'Current portfolio',v:C.sym+fmtFull(port,2)},{l:'Allocation',v:`${r.equityPct}% equity / ${r.debtPct}% debt`},{l:'Years to FIRE',v:`${r.yearsToFire}y ${r.remMonths}m`}].map(s=><div key={s.l} className="flex justify-between items-center px-4 py-3"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{s.l}:</span><span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{s.v}</span></div>)}</div>}
    </>}/>
  );
}
