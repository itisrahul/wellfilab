'use client';
import { useState, useEffect } from 'react';
import { calcSalaryHourly } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, NumIn, Stat, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

type Period = 'annual' | 'monthly' | 'weekly' | 'daily';

export default function SalaryHourlyCalc() {
  const [curr, setCurr] = useState('INR');
  const [salary, setSalary] = useState(1200000);
  const [period, setPeriod] = useState<Period>('annual');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const C = useCurr(curr);

  const r = calcSalaryHourly(salary, period, hoursPerWeek, weeksPerYear);

  useEffect(() => {
    saveHistory({
      calcSlug: 'salary-hourly', calcName: 'Salary to Hourly',
      summary: `${C.sym}${fmtFull(salary,0)}/${period} = ${C.sym}${fmtFull(r.hourly,2)}/hour`,
      inputs: { salary, period, hoursPerWeek, weeksPerYear },
    });
  }, [salary, period, hoursPerWeek, weeksPerYear]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Salary amount" value={salary} onChange={setSalary} sym={C.sym} step={5000}/>
      <div>
        <label className="calc-label">Salary period</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['annual','monthly','weekly','daily'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-2 py-2 rounded-lg text-xs font-bold border-2 capitalize transition-all ${period===p?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumIn label="Hours per week" value={hoursPerWeek} onChange={setHoursPerWeek} min={1} max={80}/>
        <NumIn label="Weeks per year" value={weeksPerYear} onChange={setWeeksPerYear} min={1} max={52}/>
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Every Period, At A Glance</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Annual" value={`${C.sym}${fmtFull(r.annual,2)}`} color={TC.gray}/>
        <Stat label="Monthly" value={`${C.sym}${fmtFull(r.monthly,2)}`} color={TC.gray}/>
        <Stat label="Weekly" value={`${C.sym}${fmtFull(r.weekly,2)}`} color={TC.gray}/>
        <Stat label="Daily" value={`${C.sym}${fmtFull(r.daily,2)}`} color={TC.gray}/>
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Hourly rate</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.hourly,2)}</p>
        </div>
        <Stat label="Per minute" value={`${C.sym}${fmtFull(r.perMinute,4)}`} color={TC.blue}/>
        <Stat label="Per second" value={`${C.sym}${fmtFull(r.perMinute/60,6)}`} color={TC.blue}/>
      </div>
    </>}/>
  );
}
