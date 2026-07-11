'use client';
import { useState } from 'react';
import { calcBMI } from '@/lib/calc';
import { Shell, Label, Field, BigResult, Box, CopyBtn, CurrPills, MoneyIn, NumIn, PctIn, SelectIn, Stat, TC, Table, Toggle, ViewToggle, fmtCurrency, fmtFull, useCurr } from '@/components/tools/shared';

const ROWS = [
  {r:'< 18.5',cat:'Underweight',      risk:'High',     c:'text-blue-600 bg-blue-100 dark:bg-blue-900/40'},
  {r:'18.5–24.9',cat:'Normal Weight', risk:'Minimal',  c:'text-teal-600 bg-teal-100 dark:bg-teal-900/40'},
  {r:'25–29.9', cat:'Overweight',     risk:'Moderate', c:'text-amber-600 bg-amber-100 dark:bg-amber-900/40'},
  {r:'30–34.9', cat:'Obese Class I',  risk:'High',     c:'text-orange-600 bg-orange-100 dark:bg-orange-900/40'},
  {r:'≥ 35',    cat:'Obese Class II+',risk:'Very High',c:'text-red-600 bg-red-100 dark:bg-red-900/40'},
];

export default function BMICalc() {
  const [imp, setImp]   = useState(false);
  const [kg, setKg]     = useState(75);
  const [cm, setCm]     = useState(175);
  const [lbs, setLbs]   = useState(165);
  const [ft, setFt]     = useState(5);
  const [inch, setInch] = useState(9);
  const wKg = imp ? lbs * 0.453592 : kg;
  const hCm = imp ? (ft * 12 + inch) * 2.54 : cm;
  const r   = calcBMI(wKg, hCm);
  const pct = Math.min(97, Math.max(3, ((r.bmi - 10) / 35) * 100));
  const row = ROWS.find(x => x.cat === r.cat) ?? ROWS[1];
  return (
    <Shell
      left={<>
        <div><Label>Units</Label><Toggle v={imp} a="Metric (kg/cm)" b="Imperial (lbs/ft)" onA={() => setImp(false)} onB={() => setImp(true)} /></div>
        {!imp
          ? <div className="grid grid-cols-2 gap-3"><div><Label>Weight (kg)</Label><Field type="number" value={kg} step={0.1} onChange={e => setKg(+e.target.value)}/></div><div><Label>Height (cm)</Label><Field type="number" value={cm} onChange={e => setCm(+e.target.value)}/></div></div>
          : <><div className="grid grid-cols-2 gap-3"><div><Label>Weight (lbs)</Label><Field type="number" value={lbs} step={0.5} onChange={e => setLbs(+e.target.value)}/></div><div><Label>Height (ft)</Label><Field type="number" value={ft} min={3} max={8} onChange={e => setFt(+e.target.value)}/></div></div><div><Label>Inches</Label><Field type="number" value={inch} min={0} max={11} onChange={e => setInch(+e.target.value)}/></div></>
        }
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Your BMI Result</h3>
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-1">Your BMI</p>
            <p className="text-7xl font-extrabold font-mono text-teal-600 dark:text-teal-400 leading-none">{r.bmi}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold ${row.c}`}>{r.cat}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Healthy weight for your height</p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{r.hMin}–{r.hMax} {imp ? 'lbs' : 'kg'}</p>
            {r.tolose && <p className="text-sm text-amber-600 mt-1">Lose {imp ? +(r.tolose * 2.20462).toFixed(1) : r.tolose} {imp ? 'lbs' : 'kg'} to reach healthy range</p>}
          </div>
        </div>
        <div>
          <div className="flex h-5 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 mb-2">
            {[{w:22,c:'bg-blue-400'},{w:27,c:'bg-teal-500'},{w:21,c:'bg-amber-400'},{w:18,c:'bg-orange-500'},{w:12,c:'bg-red-600'}].map((z,i)=>
              <div key={i} className={`${z.c} h-full`} style={{flexBasis:`${z.w}%`}}/>)}
          </div>
          <div className="relative h-3 mb-1"><div className="absolute w-3.5 h-3.5 rounded-full bg-gray-800 dark:bg-white shadow -top-0.5 border-2 border-white dark:border-gray-800 transition-all" style={{left:`calc(${pct}% - 7px)`}}/></div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">{['10','18.5','25','30','35','45+'].map(v=><span key={v}>{v}</span>)}</div>
        </div>
        <Table headers={['BMI Range','Category','Health Risk']}
          rows={ROWS.map(row => [row.r, row.cat + (row.cat === r.cat ? ' ← You' : ''), row.risk])}/>
        <p className="text-xs text-gray-400">BMI is a screening tool, not a medical diagnosis. Use alongside other health indicators.</p>
      </>}
    />
  );
}
