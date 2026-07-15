'use client';
import { useState, useEffect } from 'react';
import { calcOvertime } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, NumIn, Toggle, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const MULTIPLIERS = [1.25, 1.5, 2];

export default function OvertimeCalc() {
  const [curr, setCurr] = useState('INR');
  const [hourlyRate, setHourlyRate] = useState(500);
  const [regularHours, setRegularHours] = useState(40);
  const [overtimeHours, setOvertimeHours] = useState(10);
  const [multiplier, setMultiplier] = useState(1.5);
  const [customMult, setCustomMult] = useState(1.5);
  const [isCustom, setIsCustom] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const C = useCurr(curr);

  const effMult = isCustom ? customMult : multiplier;
  const r = calcOvertime(hourlyRate, regularHours, overtimeHours, effMult, period);
  const regularRateForOTHours = Math.round(hourlyRate * overtimeHours);
  const premium = r.overtimePay - regularRateForOTHours * (period === 'monthly' ? 4.33 : 1);

  useEffect(() => {
    saveHistory({
      calcSlug: 'overtime', calcName: 'Overtime Calculator',
      summary: `${overtimeHours}hrs OT @ ${effMult}× = ${C.sym}${fmtFull(r.totalPay,0)} total`,
      inputs: { hourlyRate, regularHours, overtimeHours, effMult, period },
    });
  }, [hourlyRate, regularHours, overtimeHours, effMult, period]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Regular hourly rate" value={hourlyRate} onChange={setHourlyRate} sym={C.sym} step={10}/>
      <div className="grid grid-cols-2 gap-3">
        <NumIn label="Regular hours" value={regularHours} onChange={setRegularHours} min={0} max={80}/>
        <NumIn label="Overtime hours" value={overtimeHours} onChange={setOvertimeHours} min={0} max={80}/>
      </div>
      <div>
        <label className="calc-label">Overtime multiplier</label>
        <div className="flex flex-wrap gap-1.5">
          {MULTIPLIERS.map(m => (
            <button key={m} onClick={() => { setMultiplier(m); setIsCustom(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${!isCustom && multiplier===m?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{m}×</button>
          ))}
          <button onClick={() => setIsCustom(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${isCustom?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>Custom</button>
        </div>
        {isCustom && <div className="mt-2"><NumIn label="Custom multiplier" value={customMult} onChange={setCustomMult} min={1} max={5} step={0.1}/></div>}
      </div>
      <div>
        <label className="calc-label">Period</label>
        <Toggle v={period === 'monthly'} a="Weekly" b="Monthly" onA={() => setPeriod('weekly')} onB={() => setPeriod('monthly')}/>
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Overtime Pay</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Regular pay" value={`${C.sym}${fmtFull(r.regularPay,2)}`} color={TC.gray}/>
        <Stat label="Overtime pay" value={`${C.sym}${fmtFull(r.overtimePay,2)}`} color={TC.orange}/>
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Total pay</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.totalPay,2)}</p>
        </div>
        <Stat label="Effective hourly rate" value={`${C.sym}${fmtFull(r.effectiveHourlyRate,2)}/hr`} color={TC.blue}/>
        <Stat label="Annual equivalent" value={`${C.sym}${fmtFull(r.annualEquivalent,2)}`} color={TC.green}/>
      </div>
      <Box icon="💡 What overtime is really worth" text={`${overtimeHours} overtime hours at your regular rate would be ${C.sym}${fmtFull(regularRateForOTHours,2)}. At ${effMult}× rate, it's ${C.sym}${fmtFull(r.overtimePay,2)} instead — an overtime premium of ${C.sym}${fmtFull(Math.max(0,premium),2)}.`}/>
    </>}/>
  );
}
