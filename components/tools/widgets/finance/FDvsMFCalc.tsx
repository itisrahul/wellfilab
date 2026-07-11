'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';

export default function FDvsMFCalc() {
  const [curr,    setCurr]    = useState('INR');
  const [amount,  setAmount]  = useState(500000);
  const [fdRate,  setFdRate]  = useState(7.0);
  const [mfRate,  setMfRate]  = useState(12.0);
  const [years,   setYears]   = useState(10);
  const [taxSlab, setTaxSlab] = useState(30);
  const [monthly, setMonthly] = useState(0);

  const C = useCurr(curr);

  // FD: interest taxed every year at slab rate
  const calcFD = () => {
    let bal = amount;
    const rows = [];
    for (let y = 1; y <= years; y++) {
      const interest = bal * fdRate / 100;
      const taxOnInt = interest * taxSlab / 100;
      bal += interest - taxOnInt;
      if (monthly > 0) bal += monthly * 12;
      rows.push({ year: y, fd: Math.round(bal) });
    }
    return rows;
  };

  // MF equity: gains taxed at 12.5% LTCG only at redemption after 1 year
  // (rate updated post Union Budget 2024, effective 23 July 2024 — previously 10% with a ₹1L exemption)
  const calcMF = () => {
    let bal = amount;
    let invested = amount;
    const rows = [];
    for (let y = 1; y <= years; y++) {
      bal = bal * (1 + mfRate / 100);
      if (monthly > 0) { bal += monthly * 12; invested += monthly * 12; }
      rows.push({ year: y, mf: Math.round(bal) });
    }
    const gains   = bal - invested;
    const ltcgTax = Math.max(0, gains - 125000) * 0.125; // ₹1.25L exempt, 12.5% on rest
    const mfPostTax = Math.round(bal - ltcgTax);
    return { rows, bal, ltcgTax, mfPostTax, invested };
  };

  const fdRows = calcFD();
  const mfData = calcMF();
  const fdFinal = fdRows[fdRows.length - 1]?.fd ?? 0;

  const chartData = fdRows.map((r, i) => ({
    year: r.year,
    'FD (post-tax)':        r.fd,
    'Mutual Fund (pre-tax)': mfData.rows[i]?.mf ?? 0,
  }));

  const winner = mfData.mfPostTax > fdFinal ? 'MF' : 'FD';
  const diff   = Math.abs(mfData.mfPostTax - fdFinal);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Lump sum investment" value={amount} onChange={setAmount} sym={C.sym} step={50000}/>
      <MoneyIn label="Monthly top-up (optional)" value={monthly} onChange={setMonthly} sym={C.sym} step={1000}/>
      <div className="grid grid-cols-2 gap-3">
        <PctIn label="FD interest rate %" value={fdRate} onChange={setFdRate} step={0.1} hint="Taxable every year"/>
        <PctIn label="Mutual fund return %" value={mfRate} onChange={setMfRate} step={0.5} hint="Historical avg 10–13%"/>
        <NumIn label="Investment period (years)" value={years} onChange={setYears} min={1} max={30}/>
        <div>
          <label className="calc-label">Your tax slab</label>
          <select className="calc-input" value={taxSlab} onChange={e => setTaxSlab(+e.target.value)}>
            <option value={0}>Nil (0%)</option>
            <option value={5}>5% slab</option>
            <option value={20}>20% slab</option>
            <option value={30}>30% slab</option>
          </select>
        </div>
      </div>
      <Box icon="💡 Tax difference" color="orange"
        text={`FD interest is taxed at your slab rate (${taxSlab}%) every year. Equity MF gains above ₹1.25L are taxed at 12.5% LTCG only when you sell. The compounding benefit of deferred taxation is significant.`}/>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500">FD vs Mutual Fund — {years} years</h3>
        <p className="text-sm text-gray-500">{C.sym}{fmtFull(amount,0)} invested · {fdRate}% FD vs {mfRate}% MF</p>
      </div>

      <div className={`rounded-xl p-4 border mb-4 ${winner==='MF'?'bg-green-50 dark:bg-green-950/20 border-green-200':'bg-blue-50 dark:bg-blue-950/20 border-blue-200'}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Winner after {years} years</p>
        <p className={`text-lg font-black ${winner==='MF'?'text-green-700 dark:text-green-400':'text-blue-700 dark:text-blue-400'}`}>
          {winner === 'MF' ? '📈 Mutual Fund wins' : '🏦 FD wins'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
          by {C.sym}{fmtFull(diff,0)} after all taxes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="result-card bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-blue-600 mb-0">FD maturity (post-tax)</p>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(fdFinal, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-blue-500">{C.sym}{fmtFull(fdFinal,2)}</p>
        </div>
        <div className="result-card bg-green-50 dark:bg-green-950/20 border-green-200">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-green-600 mb-0">MF maturity (post-LTCG)</p>
            <span className="text-[10px] font-mono text-green-500 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(mfData.mfPostTax, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-green-600">{C.sym}{fmtFull(mfData.mfPostTax,2)}</p>
        </div>
        <Stat label="MF pre-tax value" value={`${C.sym}${fmtFull(mfData.bal,0)}`} color={TC.gray}/>
        <Stat label="LTCG tax on MF" value={`${C.sym}${fmtFull(mfData.ltcgTax,0)}`} color={TC.gray}/>
        <Stat label="FD return rate" value={`${(fdRate*(1-taxSlab/100)).toFixed(2)}% (post-tax)`} color={TC.orange}/>
        <Stat label="MF effective rate" value={`~${mfRate}% pre-tax`} color={TC.green}/>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mt-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Growth comparison over time</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{top:5,right:5,bottom:5,left:5}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="year" tick={{fontSize:11}}/>
            <YAxis tickFormatter={v => fmtSmart(v, C.sym)} tick={{fontSize:10}} width={75}/>
            <Tooltip formatter={(v: number) => [`${C.sym}${fmtFull(v,0)}`, undefined]}/>
            <Legend/>
            <Line type="monotone" dataKey="FD (post-tax)" stroke="#3b82f6" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="Mutual Fund (pre-tax)" stroke="#10b981" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-gray-400 mt-2 break-words">MF shown pre-LTCG tax for fair growth comparison. Actual post-tax MF is {C.sym}{fmtFull(mfData.mfPostTax,0)} at year {years}.</p>
      </div>
    </>}/>
  );
}
