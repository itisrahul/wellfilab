'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shell, CurrPills, MoneyIn, PctIn, NumIn, Stat, Box, useCurr, fmtFull, fmtSmart, TC } from '@/components/tools/shared';

function calcRentVsBuy(params: {
  homePrice: number; downPct: number; loanRate: number;
  propAppreciation: number; rentMonthly: number; rentIncrease: number;
  investReturn: number; years: number; maintenancePct: number;
}) {
  const { homePrice, downPct, loanRate, propAppreciation, rentMonthly, rentIncrease, investReturn, years, maintenancePct } = params;
  const down = homePrice * downPct / 100;
  const loan = homePrice - down;
  const r = loanRate / 100 / 12;
  const n = years * 12;

  // Monthly EMI
  const emi = loan > 0 ? Math.round(loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)) : 0;
  const maintenance = Math.round(homePrice * maintenancePct / 100 / 12);

  // Buying scenario — build year by year
  const buyRows: { year: number; propertyValue: number; equityBuilt: number; totalCostBuy: number; totalCostRent: number; netBuy: number }[] = [];
  let balance = loan;
  let totalBuyCost = down;
  let totalRentCost = 0;
  let rent = rentMonthly;
  // Down payment invested counterfactual for renters
  let rentInvested = down;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principal = emi - interest;
      balance = Math.max(0, balance - principal);
      totalBuyCost += emi + maintenance;
      totalRentCost += rent;
      rentInvested *= (1 + investReturn / 100 / 12);
      rentInvested += rent * 0; // renters save what they don't spend on EMI
    }
    // Renter can invest EMI+maintenance-rent difference
    const extraPerMonth = Math.max(0, emi + maintenance - rentMonthly);
    rentInvested += extraPerMonth * 12 * Math.pow(1 + investReturn / 100, y > 1 ? 0 : 1);
    rent *= (1 + rentIncrease / 100);

    const propValue = homePrice * Math.pow(1 + propAppreciation / 100, y);
    const equity = propValue - balance;
    const netBuy = equity - totalBuyCost; // net gain from buying
    const netRent = rentInvested - totalRentCost; // renter's investment portfolio minus rent paid

    buyRows.push({
      year: y,
      propertyValue: Math.round(propValue),
      equityBuilt: Math.round(equity),
      totalCostBuy: Math.round(totalBuyCost),
      totalCostRent: Math.round(totalRentCost),
      netBuy: Math.round(netBuy),
    });
  }

  const last = buyRows[buyRows.length - 1];
  const breakEvenYear = buyRows.find(r => r.netBuy > 0)?.year ?? null;

  return { emi, maintenance, rows: buyRows, last, breakEvenYear };
}

export default function RentBuyCalc() {
  const [curr, setCurr]        = useState('INR');
  const [homePrice, setHome]   = useState(5000000);
  const [downPct, setDown]     = useState(20);
  const [loanRate, setLoan]    = useState(8.5);
  const [propApp, setPropApp]  = useState(6);
  const [rent, setRent]        = useState(20000);
  const [rentInc, setRentInc]  = useState(5);
  const [invest, setInvest]    = useState(12);
  const [years, setYears]      = useState(15);
  const [maint, setMaint]      = useState(1);

  const C = useCurr(curr);
  const r = calcRentVsBuy({ homePrice, downPct, loanRate, propAppreciation: propApp, rentMonthly: rent, rentIncrease: rentInc, investReturn: invest, years, maintenancePct: maint });

  const buyWins = r.last.propertyValue - r.last.totalCostBuy > 0;
  const propGain = r.last.propertyValue - homePrice;

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Home price" value={homePrice} onChange={setHome} sym={C.sym} step={100000}/>
      <div className="grid grid-cols-2 gap-3">
        <PctIn label="Down payment %" value={downPct} onChange={setDown} step={5} hint={`${C.sym}${fmtFull(homePrice*downPct/100,0)}`}/>
        <PctIn label="Home loan rate %" value={loanRate} onChange={setLoan} step={0.25}/>
        <PctIn label="Property appreciation %" value={propApp} onChange={setPropApp} step={0.5}/>
        <PctIn label="Maintenance % p.a." value={maint} onChange={setMaint} step={0.25}/>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">If Renting Instead</p>
        <MoneyIn label="Monthly rent" value={rent} onChange={setRent} sym={C.sym} step={1000}/>
        <div className="grid grid-cols-2 gap-3">
          <PctIn label="Annual rent increase %" value={rentInc} onChange={setRentInc} step={1}/>
          <PctIn label="Investment return %" value={invest} onChange={setInvest} step={0.5} hint="If you invest instead"/>
        </div>
      </div>
      <NumIn label="Analysis period (years)" value={years} onChange={setYears} min={1} max={30}/>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">
          Rent vs Buy — {years} year analysis
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {C.sym}{fmtFull(homePrice,0)} home · {C.sym}{fmtFull(rent,0)}/mo rent
        </p>
      </div>

      {/* Verdict */}
      <div className={`rounded-xl p-4 border ${buyWins ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
          {years}-year verdict
        </p>
        <p className={`font-bold text-lg ${buyWins ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
          {buyWins ? '🏠 Buying looks better' : '🏢 Renting + investing looks better'}
        </p>
        {r.breakEvenYear && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Buying breaks even in year {r.breakEvenYear}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 dark:text-orange-400">Monthly EMI</p>
          <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.emi,0)}</p>
          <p className="text-xs text-gray-400 mt-1">+{C.sym}{fmtFull(r.maintenance,0)}/mo maintenance</p>
        </div>
        <div className="result-card bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="result-label text-blue-600 dark:text-blue-400 mb-0">Property value in {years}y</p>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded flex-shrink-0">{fmtSmart(r.last.propertyValue, C.sym)}</span>
          </div>
          <p className="calc-num-lg text-blue-500 dark:text-blue-400">{C.sym}{fmtFull(r.last.propertyValue,0)}</p>
        </div>
        <Stat label={`Total buying cost (${years}y)`} value={`${C.sym}${fmtFull(r.last.totalCostBuy,0)}`} color={TC.orange}/>
        <Stat label={`Total rent paid (${years}y)`} value={`${C.sym}${fmtFull(r.last.totalCostRent,0)}`} color={TC.blue}/>
        <Stat label="Equity built" value={`${C.sym}${fmtFull(r.last.equityBuilt,0)}`} color={TC.green}/>
        <Stat label={`Property gain (${propApp}% p.a.)`} value={`+${C.sym}${fmtFull(propGain,0)}`} color={TC.green}/>
      </div>

      <Box icon="💡 Key insight" color="orange"
        text={`Your EMI is ${C.sym}${fmtFull(r.emi,0)}/month vs rent of ${C.sym}${fmtFull(rent,0)}/month — a ${r.emi > rent ? `${C.sym}${fmtFull(r.emi-rent,0)} monthly premium to build equity` : `${C.sym}${fmtFull(rent-r.emi,0)} saving per month over rent`}. After ${years} years, property value is estimated at ${C.sym}${fmtFull(r.last.propertyValue,0)} against a total buying cost of ${C.sym}${fmtFull(r.last.totalCostBuy,0)}.`}/>

      {/* Chart */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Property value vs Total cost over time</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={r.rows} margin={{ top:5, right:5, bottom:5, left:5 }}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="year" tick={{ fontSize:11 }} label={{ value:'Year', position:'insideBottomRight', offset:-5, fontSize:11 }}/>
            <YAxis tickFormatter={v => `${C.sym}${fmtSmart(v,'')}`} tick={{ fontSize:10 }} width={70}/>
            <Tooltip formatter={(v: number) => [`${C.sym}${fmtFull(v,0)}`, undefined]} labelFormatter={l => `Year ${l}`}/>
            <Legend/>
            <Line type="monotone" dataKey="propertyValue" name="Property value" stroke="#f97316" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="equityBuilt" name="Equity built" stroke="#10b981" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="totalCostBuy" name="Total buying cost" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>}/>
  );
}
