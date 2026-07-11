'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shell, MoneyIn, PctIn, NumIn, BigResult, Stat, Box, Table, fmtFull, fmtSmart, TC } from '@/components/tools/shared';

function calcEPF(salary: number, ageNow: number, ageRetire: number, currentBalance: number, epfRate: number, salaryHike: number) {
  const years = ageRetire - ageNow;
  const empContrib = 0.12; // 12% employee
  const empContribBasic = 0.0367; // ~3.67% employer to EPF (rest goes to EPS)
  const rows: { year: number; salary: number; contribution: number; interest: number; balance: number }[] = [];
  let balance = currentBalance;
  let sal = salary;

  for (let y = 1; y <= years; y++) {
    const annual = sal * 12;
    const contrib = annual * (empContrib + empContribBasic);
    const interest = (balance + contrib / 2) * epfRate / 100;
    balance += contrib + interest;
    rows.push({
      year: ageNow + y,
      salary: Math.round(sal),
      contribution: Math.round(contrib),
      interest: Math.round(interest),
      balance: Math.round(balance),
    });
    sal *= (1 + salaryHike / 100);
  }

  const totalContrib = rows.reduce((s, r) => s + r.contribution, 0);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  return { balance, totalContrib, totalInterest, rows };
}

export default function EPFCalc() {
  const [salary,  setSalary]  = useState(50000);
  const [ageNow,  setAgeNow]  = useState(28);
  const [ageRet,  setAgeRet]  = useState(58);
  const [current, setCurrent] = useState(100000);
  const [rate,    setRate]    = useState(8.25);
  const [hike,    setHike]    = useState(8);

  const r = calcEPF(salary, ageNow, ageRet, current, rate, hike);
  const sym = '₹';

  return (
    <Shell left={<>
      <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 mb-1">
        EPF: 12% employee + ~3.67% employer contribution on basic salary. Current rate: {rate}% p.a.
      </p>
      <MoneyIn label="Basic monthly salary (₹)" value={salary} onChange={setSalary} sym={sym} step={5000}/>
      <MoneyIn label="Current EPF balance (₹)" value={current} onChange={setCurrent} sym={sym} step={10000}/>
      <div className="grid grid-cols-2 gap-3">
        <NumIn label="Current age" value={ageNow} onChange={setAgeNow} min={18} max={57}/>
        <NumIn label="Retirement age" value={ageRet} onChange={setAgeRet} min={ageNow+1} max={60}/>
        <PctIn label="EPF interest rate %" value={rate} onChange={setRate} step={0.05} hint="Govt declares annually"/>
        <PctIn label="Annual salary hike %" value={hike} onChange={setHike} step={1}/>
      </div>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">EPF at age {ageRet}</h3>
        <p className="text-sm text-gray-500">{ageRet - ageNow} years of contributions · {rate}% p.a.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-orange-600 dark:text-orange-400 mb-0">EPF corpus at retirement</p>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.balance, sym)}</span>
          </div>
          <p className="calc-num-lg text-orange-500 dark:text-orange-400">{sym}{fmtFull(r.balance, 2)}</p>
        </div>
        <Stat label="Total contributed (you + employer)" value={`${sym}${fmtFull(r.totalContrib,0)}`} color={TC.blue}/>
        <Stat label="Total interest earned" value={`${sym}${fmtFull(r.totalInterest,0)}`} color={TC.green}/>
        <Stat label="Monthly contribution (year 1)" value={`${sym}${fmtFull(salary * 0.1567, 0)}`} color={TC.gray}/>
        <Stat label={`Monthly contribution (age ${ageRet-1})`} value={`${sym}${fmtFull((r.rows[r.rows.length-1]?.salary ?? 0) * 0.1567, 0)}`} color={TC.gray}/>
      </div>

      <Box icon="💡 Tax-free at maturity" color="teal"
        text={`EPF withdrawals after 5+ years of continuous service are completely tax-free. At ${rate}% return, it is one of the best risk-free instruments available. Your corpus of ${sym}${fmtFull(r.balance,0)} generates ${sym}${fmtFull(r.balance * 0.04 / 12, 0)}/month at a 4% safe withdrawal rate.`}/>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">EPF balance growth</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={r.rows.filter((_, i) => i % Math.ceil(r.rows.length / 10) === 0)} margin={{ top:5, right:5, bottom:5, left:5 }}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="year" tick={{ fontSize:11 }}/>
            <YAxis tickFormatter={v => fmtSmart(v, sym)} tick={{ fontSize:10 }} width={75}/>
            <Tooltip formatter={(v: number) => [`${sym}${fmtFull(v,0)}`, undefined]}/>
            <Bar dataKey="balance" name="EPF balance" fill="#f97316" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Table
        headers={['Age', 'Monthly salary', 'Annual contrib', 'Interest', 'Balance']}
        rows={r.rows.filter((_, i) => i % 5 === 4 || i === 0).map(row => [
          row.year,
          `${sym}${fmtFull(row.salary, 0)}`,
          `${sym}${fmtFull(row.contribution, 0)}`,
          `${sym}${fmtFull(row.interest, 0)}`,
          `${sym}${fmtFull(row.balance, 0)}`,
        ])}
        note="Based on current EPF rate. Rate is declared annually and may change."
      />
    </>}/>
  );
}
