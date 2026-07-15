'use client';
import { useState, useEffect } from 'react';
import { calcCreditCard } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, Table, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CreditCardCalc() {
  const [curr, setCurr] = useState('INR');
  const [balance, setBalance] = useState(50000);
  const [apr, setApr] = useState(36);
  const [minPct, setMinPct] = useState(5);
  const [fixedPayment, setFixedPayment] = useState(5000);
  const C = useCurr(curr);

  const r = calcCreditCard(balance, apr, minPct, fixedPayment);
  const costsMoreThanBalance = r.minResult.totalInterest > balance;

  const fmtTime = (months: number) => months >= 600 ? '50+ years' : `${Math.floor(months/12)}y ${months%12}m`;

  useEffect(() => {
    saveHistory({
      calcSlug: 'credit-card', calcName: 'Credit Card Payoff',
      summary: `${C.sym}${fmtFull(balance,0)} balance — minimum payment: ${fmtTime(r.minResult.months)}, fixed: ${fmtTime(r.fixedResult.months)}`,
      inputs: { balance, apr, minPct, fixedPayment },
    });
  }, [balance, apr, minPct, fixedPayment]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Current balance" value={balance} onChange={setBalance} sym={C.sym} step={5000}/>
      <PctIn label="Annual interest rate" value={apr} onChange={setApr} step={1} hint="Most Indian cards charge 36-42% APR"/>
      <PctIn label="Minimum payment %" value={minPct} onChange={setMinPct} step={0.5} hint="Typically floored at ₹200"/>
      <MoneyIn label="Fixed monthly payment" value={fixedPayment} onChange={setFixedPayment} sym={C.sym} step={500}
        hint={`Pay ${C.sym}${fmtFull(fixedPayment,0)} to clear in ${fmtTime(r.fixedResult.months)}`}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Credit Card Payoff</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="result-card bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <p className="result-label text-red-600 mb-1">Minimum payment</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Months to clear: <strong>{r.minResult.neverPaysOff ? 'Never' : fmtTime(r.minResult.months)}</strong></p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total interest: <strong>{C.sym}{fmtFull(r.minResult.totalInterest,2)}</strong></p>
        </div>
        <div className="result-card bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
          <p className="result-label text-teal-600 mb-1">Fixed payment</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Months to clear: <strong>{r.fixedResult.neverPaysOff ? 'Never' : fmtTime(r.fixedResult.months)}</strong></p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total interest: <strong>{C.sym}{fmtFull(r.fixedResult.totalInterest,2)}</strong></p>
        </div>
      </div>
      <Stat label="Interest saved with fixed payment" value={`${C.sym}${fmtFull(Math.max(0,r.interestSaved),2)}`} color={TC.green}/>
      {costsMoreThanBalance && (
        <Box icon="⚠️ Warning" color="red" text={`Minimum payments will cost you ${C.sym}${fmtFull(r.minResult.totalInterest - balance,2)} more than your original debt in interest alone.`}/>
      )}
      {r.minResult.neverPaysOff && (
        <Box icon="⚠️ This balance will never clear" color="red" text="At this minimum payment percentage, the interest charged each month is greater than or equal to the principal paid down — the balance won't reduce to zero."/>
      )}
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">First 24 months — minimum payment</p>
        <Table headers={['Month','Payment','Interest','Principal','Balance']} rows={r.rows.map(row=>[row.month,`${C.sym}${fmtFull(row.payment,0)}`,`${C.sym}${fmtFull(row.interest,0)}`,`${C.sym}${fmtFull(row.principal,0)}`,`${C.sym}${fmtFull(row.balance,0)}`])} note="Notice how slowly the balance drops — most of the payment goes to interest."/>
      </div>
    </>}/>
  );
}
