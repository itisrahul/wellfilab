'use client';
import { useState, useEffect } from 'react';
import { calcPayRaise } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Box, Table, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

type Period = 'annual' | 'monthly' | 'hourly';

export default function PayRaiseCalc() {
  const [curr, setCurr] = useState('INR');
  const [salary, setSalary] = useState(800000);
  const [period, setPeriod] = useState<Period>('annual');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [raiseType, setRaiseType] = useState<'percent' | 'amount'>('percent');
  const [raisePct, setRaisePct] = useState(10);
  const [raiseAmt, setRaiseAmt] = useState(50000);
  const C = useCurr(curr);

  const raiseValue = raiseType === 'percent' ? raisePct : raiseAmt;
  const r = calcPayRaise(salary, raiseType, raiseValue, period, hoursPerWeek);

  useEffect(() => {
    saveHistory({
      calcSlug: 'pay-raise', calcName: 'Pay Raise Calculator',
      summary: `${C.sym}${fmtFull(r.currentAnnual,0)} → ${C.sym}${fmtFull(r.newAnnual,0)} (+${r.raisePct}%)`,
      inputs: { salary, period, hoursPerWeek, raiseType, raiseValue },
    });
  }, [salary, period, hoursPerWeek, raiseType, raiseValue]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Current salary" value={salary} onChange={setSalary} sym={C.sym} step={5000}/>
      <div>
        <label className="calc-label">Pay period</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['annual','monthly','hourly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border-2 capitalize transition-all ${period===p?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{p}</button>
          ))}
        </div>
      </div>
      {period === 'hourly' && <NumIn label="Hours per week" value={hoursPerWeek} onChange={setHoursPerWeek} min={1} max={80}/>}
      <div>
        <label className="calc-label">Raise type</label>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {(['percent','amount'] as const).map(t => (
            <button key={t} onClick={() => setRaiseType(t)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${raiseType===t?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{t==='percent'?'Percentage':'Fixed amount'}</button>
          ))}
        </div>
        {raiseType === 'percent'
          ? <PctIn label="Raise %" value={raisePct} onChange={setRaisePct} step={0.5}/>
          : <MoneyIn label="Raise amount" value={raiseAmt} onChange={setRaiseAmt} sym={C.sym} step={5000}/>}
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Pay Raise Impact</h3>
      <Table headers={['Period','Current','After raise','Increase']}
        rows={[
          ['Annual', `${C.sym}${fmtFull(r.currentAnnual,2)}`, `${C.sym}${fmtFull(r.newAnnual,2)}`, `+${C.sym}${fmtFull(r.newAnnual-r.currentAnnual,2)}`],
          ['Monthly', `${C.sym}${fmtFull(r.currentMonthly,2)}`, `${C.sym}${fmtFull(r.newMonthly,2)}`, `+${C.sym}${fmtFull(r.newMonthly-r.currentMonthly,2)}`],
          ['Hourly', `${C.sym}${fmtFull(r.currentHourly,2)}`, `${C.sym}${fmtFull(r.newHourly,2)}`, `+${C.sym}${fmtFull(r.newHourly-r.currentHourly,2)}`],
        ]}/>
      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <p className="result-label text-orange-600 mb-0">Total annual increase</p>
        <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.raiseAmount,2)} <span className="text-base font-semibold">(+{fmtFull(r.raisePct)}%)</span></p>
      </div>
      <Box icon="💡 Is your raise good?" text="Ask for more? Industry benchmarks for annual raises: Cost of living 6-8%, Performance 8-15%, Promotion 15-30%."/>
    </>}/>
  );
}
