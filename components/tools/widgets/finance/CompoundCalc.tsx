'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { calcCompound } from '@/lib/calc';
import {
  Shell, CurrPills, MoneyIn, PctIn, NumIn, SelectIn,
  Stat, Box, Table, ViewToggle, useCurr, fmtFull, TC, CopyBtn,
} from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

// ── Monthly breakdown helper ──────────────────────────────────────────────────
function calcMonthlyRows(
  p: number, ratePercent: number, yrs: number, freq: number,
  monthly: number, topup: number, stepup: number
) {
  const r = ratePercent / 100 / 12;
  let bal = p, invested = p, mc = monthly;
  const rows: { month: number; interest: number; accrued: number; invested: number; balance: number }[] = [];
  for (let y = 1; y <= yrs; y++) {
    for (let m = 1; m <= 12; m++) {
      const int = bal * r;
      bal = bal + int + mc;
      invested += mc;
      rows.push({ month: (y - 1) * 12 + m, interest: Math.round(int * 100) / 100, accrued: Math.round((bal - p) * 100) / 100, invested: Math.round(invested), balance: Math.round(bal * 100) / 100 });
    }
    bal += topup;
    invested += topup;
    mc *= 1 + stepup / 100;
  }
  return rows;
}

// ── CSV export ────────────────────────────────────────────────────────────────
function downloadCSV(rows: (string | number)[][], headers: string[], filename: string) {
  const lines = [headers.join(','), ...rows.map(r => r.join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ── Share helper ──────────────────────────────────────────────────────────────
function shareCalc(title: string, text: string) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(url).then(() => alert('Link copied!')).catch(() => {});
  }
}

const DEFAULTS = { curr: 'INR', p: 500000, rate: 5, yrs: 5, freq: 12, monthly: 0, topup: 0, stepup: 0 };

export default function CompoundCalc() {
  const [curr,    setCurr]    = useState(DEFAULTS.curr);
  const [p,       setP]       = useState(DEFAULTS.p);
  const [rate,    setRate]    = useState(DEFAULTS.rate);
  const [yrs,     setYrs]     = useState(DEFAULTS.yrs);
  const [freq,    setFreq]    = useState(DEFAULTS.freq);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [topup,   setTopup]   = useState(DEFAULTS.topup);
  const [stepup,  setStepup]  = useState(DEFAULTS.stepup);
  const [view,    setView]    = useState('table');
  const [breakdown, setBreakdown] = useState<'monthly' | 'yearly'>('yearly');
  const [printed,   setPrinted]   = useState(false);

  useEffect(() => {
    if (r.final > 0) {
      saveHistory({
        calcSlug: 'compound', calcName: 'Compound Interest Calculator',
        summary: `${C.sym}${fmtFull(p,0)} @ ${rate}% for ${yrs}yr = ${C.sym}${fmtFull(r.final,0)}`,
        inputs: { p, rate, yrs, freq },
      });
    }
  }, [p, rate, yrs, freq, monthly]);
  const [inflation, setInflation] = useState(6);  // default 6% for India

  const C   = useCurr(curr);
  const r   = calcCompound(p, rate, yrs, freq, monthly, topup, stepup);
  const flat = calcCompound(p, rate, yrs, freq, monthly, 0, 0);
  const ear = +((Math.pow(1 + rate / 100 / freq, freq) - 1) * 100).toFixed(2);
  const ror = +(((r.final / Math.max(1, p)) - 1) * 100).toFixed(2);
  const dbl = (72 / Math.max(0.01, rate)).toFixed(1);

  const monthlyRows = breakdown === 'monthly' ? calcMonthlyRows(p, rate, yrs, freq, monthly, topup, stepup) : [];

  const handleReset = () => {
    setCurr(DEFAULTS.curr); setP(DEFAULTS.p); setRate(DEFAULTS.rate); setYrs(DEFAULTS.yrs);
    setFreq(DEFAULTS.freq); setMonthly(DEFAULTS.monthly); setTopup(DEFAULTS.topup); setStepup(DEFAULTS.stepup);
    setView('table'); setBreakdown('yearly');
  };

  const handlePrint = () => { window.print(); };

  const handleCSV = () => {
    if (breakdown === 'yearly') {
      downloadCSV(
        [[0, '0', '0', C.sym + fmtFull(p, 2)], ...r.rows.map(row => [row.year, C.sym + fmtFull(row.yearInterest, 2), C.sym + fmtFull(row.accrued, 2), C.sym + fmtFull(row.balance, 2)])],
        ['Year', 'Interest', 'Accrued Interest', 'Balance'],
        `compound-interest-${yrs}yr.csv`
      );
    } else {
      downloadCSV(
        monthlyRows.map(row => [row.month, C.sym + fmtFull(row.interest, 2), C.sym + fmtFull(row.accrued, 2), C.sym + fmtFull(row.balance, 2)]),
        ['Month', 'Interest', 'Accrued Interest', 'Balance'],
        `compound-interest-monthly-${yrs}yr.csv`
      );
    }
  };

  const tableRows = breakdown === 'yearly'
    ? [[0, '0', '0', C.sym + fmtFull(p, 2)], ...r.rows.map(row => [row.year, C.sym + fmtFull(row.yearInterest, 2), C.sym + fmtFull(row.accrued, 2), C.sym + fmtFull(row.balance, 2)])]
    : monthlyRows.slice(0, 60).map(row => [row.month, C.sym + fmtFull(row.interest, 2), C.sym + fmtFull(row.accrued, 2), C.sym + fmtFull(row.balance, 2)]);

  const tableHeaders = breakdown === 'yearly'
    ? ['Year', 'Interest', 'Accrued Interest', 'Balance']
    : ['Month', 'Interest', 'Accrued Interest', 'Balance'];

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr} />
        <MoneyIn label="Initial investment" value={p} onChange={setP} sym={C.sym} step={10000}
          hint={`${C.sym} ${fmtFull(p, 2)}`} />
        <div className="grid grid-cols-2 gap-3">
          <PctIn label="Interest rate" value={rate} onChange={setRate} step={0.1} />
          <SelectIn label="Per" value="annual" onChange={() => {}} options={[{ value: 'annual', label: 'Annual' }]} />
        </div>
        <SelectIn label="Compound frequency" value={freq} onChange={v => setFreq(+v)}
          options={[
            { value: 1, label: 'Annually (1/yr)' },
            { value: 4, label: 'Quarterly (4/yr)' },
            { value: 12, label: 'Monthly (12/yr)' },
            { value: 365, label: 'Daily (365/yr)' },
          ]} />
        <div className="grid grid-cols-2 gap-3">
          <NumIn label="Years" value={yrs} onChange={setYrs} min={1} max={50} />
          <NumIn label="Months" value={0} onChange={() => {}} min={0} max={11} />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Regular Contributions <span className="font-normal text-gray-400">(optional)</span>
          </p>
          <MoneyIn label="Monthly contribution" value={monthly} onChange={setMonthly} sym={C.sym} step={500} />
          <PctIn label="Annual step-up %" value={stepup} onChange={setStepup} step={1}
            hint={stepup > 0 ? `Year ${yrs} ≈ ${C.sym}${fmtFull(Math.round(monthly * Math.pow(1 + stepup / 100, yrs - 1)), 2)}/mo` : 'Increase contributions annually'} />
          <MoneyIn label="Annual lump-sum top-up" value={topup} onChange={setTopup} sym={C.sym} step={10000} hint="e.g. bonus / tax refund" />
        </div>
      </>}

      right={<>
        {/* ── Heading ── */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">
            Calculation for {yrs} {yrs === 1 ? 'year' : 'years'}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {C.sym}{fmtFull(p, 2)} · {rate}% · {freq === 1 ? 'Annual' : freq === 4 ? 'Quarterly' : freq === 12 ? 'Monthly' : 'Daily'} compounding
          </p>
        </div>

        {/* ── 6 key results ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600">Future investment value</p>
            <div className="flex items-center gap-2 min-w-0">
              <p className="calc-num-lg text-orange-500 flex-1 min-w-0">{C.sym}{fmtFull(r.final, 2)}</p>
              <CopyBtn value={r.final.toFixed(2)} />
            </div>
          </div>
          <div className="result-card col-span-2 md:col-span-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <p className="result-label text-blue-600">Total interest earned</p>
            <div className="flex items-center gap-2 min-w-0">
              <p className="calc-num-lg text-blue-500 flex-1 min-w-0">{C.sym}{fmtFull(r.interest, 2)}</p>
              <CopyBtn value={r.interest.toFixed(2)} />
            </div>
          </div>
          <div className="result-card">
            <p className="result-label">Initial balance</p>
            <div className="flex items-center gap-2 min-w-0">
              <p className="calc-num-md text-gray-700 dark:text-gray-200 flex-1 min-w-0">{C.sym}{fmtFull(p, 2)}</p>
              <CopyBtn value={p.toFixed(2)} />
            </div>
          </div>
          <div className="result-card">
            <p className="result-label">Yearly rate → Compounded rate</p>
            <p className="calc-num-md text-gray-500">
              {rate}% → <span className="text-orange-500">{ear}%</span>
            </p>
          </div>
          <div className="result-card">
            <p className="result-label">All-time return (RoR)</p>
            <p className="calc-num-md text-green-600 dark:text-green-400">↑ {ror}%</p>
          </div>
          <div className="result-card">
            <p className="result-label">Time to double (Rule of 72)</p>
            <p className="calc-num-md text-gray-700 dark:text-gray-200">{dbl} years</p>
          </div>
        </div>

        {/* ── Breakdown toggle + View toggle ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
          {/* Breakdown: Monthly / Yearly */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Breakdown:</span>
            {(['monthly', 'yearly'] as const).map(tab => (
              <button key={tab} onClick={() => setBreakdown(tab)}
                className={`px-3 py-1.5 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                  breakdown === tab
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'
                }`}>
                {tab}
              </button>
            ))}
          </div>
          <ViewToggle v={view} onChange={setView} />
        </div>

        {/* ── Table ── */}
        {view === 'table' && (
          <div>
            <p className="text-sm font-bold text-orange-500 dark:text-orange-400 mb-3">
              {breakdown === 'yearly' ? 'Yearly' : 'Monthly'} breakdown
            </p>
            <Table
              headers={tableHeaders}
              headerColors={['bg-gray-700', 'bg-gray-600', 'bg-orange-500', 'bg-teal-600']}
              rows={tableRows}
              note={breakdown === 'monthly' ? `Showing first 60 months of ${yrs * 12} total. Download CSV for full data.` : 'Values are illustrative.'}
            />
          </div>
        )}

        {/* ── Chart ── */}
        {view === 'chart' && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={r.rows} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${C.sym}${fmtFull(v / 1000, 0)}K`} tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v: number) => [`${C.sym}${fmtFull(v, 2)}`, undefined]} labelFormatter={l => `Year ${l}`} />
                <Legend />
                <Area type="monotone" dataKey="invested" name="Invested" stroke="#f97316" fill="url(#cg1)" strokeWidth={2} />
                <Area type="monotone" dataKey="balance" name="Total Value" stroke="#3b82f6" fill="url(#cg2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Summary ── */}
        {(view === 'summary' || view === 'table') && (
          <div>
            <p className="text-sm font-bold text-orange-500 dark:text-orange-400 mb-3">Summary</p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { label: 'Initial deposit',  value: `${C.sym}${fmtFull(p, 2)}` },
                { label: 'Interest rate',    value: `${rate}% yearly` },
                { label: 'Effective rate',   value: `${ear}%` },
                { label: 'Time',             value: `${yrs} ${yrs === 1 ? 'year' : 'years'}` },
                { label: 'Compounding',      value: freq === 1 ? 'Annually' : freq === 4 ? 'Quarterly' : freq === 12 ? 'Monthly' : 'Daily' },
                { label: 'Total invested',   value: `${C.sym}${fmtFull(r.invested, 2)}` },
                { label: 'Interest earned',  value: `${C.sym}${fmtFull(r.interest, 2)}` },
                { label: 'Future value',     value: `${C.sym}${fmtFull(r.final, 2)}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{row.label}:</span>
                  <span className="calc-num-sm text-gray-900 dark:text-gray-100 font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step-up insight ── */}
        {stepup > 0 && (
          <Box
            icon={`💡 Step-up adds ${C.sym}${fmtFull(r.final - flat.final, 2)} extra`}
            text={`Without the ${stepup}%/yr step-up, final value = ${C.sym}${fmtFull(flat.final, 2)}. The step-up adds ${C.sym}${fmtFull(r.final - flat.final, 2)}.`}
            color="orange"
          />
        )}

        {/* ── Action buttons: Share | CSV | Print | Start over ── */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          {/* Share */}
          <button
            onClick={() => shareCalc('Compound Interest Calculation', `${C.sym}${fmtFull(p, 2)} at ${rate}% for ${yrs} years = ${C.sym}${fmtFull(r.final, 2)}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            Share
          </button>
          {/* CSV download */}
          <button onClick={handleCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            CSV ↓
          </button>
          {/* Print */}
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print
          </button>
          {/* Start over */}
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400 text-gray-600 dark:text-gray-300 text-sm font-semibold transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Start over
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Note: This calculator is for illustrative purposes only and does not constitute financial advice.
        </p>
      </>}
    />
  );
}
