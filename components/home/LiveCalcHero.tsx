'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { calcBMI, calcSIP, calcFIRE, calcBedtime } from '@/lib/calc';

type Tab = 'bmi' | 'sip' | 'fire' | 'sleep';
const TABS: { id: Tab; label: string }[] = [
  { id: 'bmi', label: 'BMI' }, { id: 'sip', label: 'SIP' },
  { id: 'fire', label: 'FIRE' }, { id: 'sleep', label: 'Sleep' },
];

function money(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} lakh`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/** Eases a displayed number toward a new target instead of snapping — the
 * same live-feel treatment used across every interactive widget on this
 * page, so a number update always reads as "this just recalculated," not
 * "this text changed." */
function useAnimatedNumber(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target); fromRef.current = target; return;
    }
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick); else fromRef.current = target;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Field({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
      {label}
      <input type="number" inputMode="decimal" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base font-bold text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition-colors" />
    </label>
  );
}

/**
 * The homepage's interactive centerpiece — 4 real calculators (same
 * formulas lib/calc.ts uses site-wide, correctness-audited) in one tabbed
 * card. A visitor experiences the product's actual math in 15 seconds
 * instead of reading a features list.
 */
export function LiveCalcHero() {
  const [tab, setTab] = useState<Tab>('bmi');

  const [h, setH] = useState(172);
  const [w, setW] = useState(78);

  const [sipMonthly, setSipMonthly] = useState(6500);
  const [sipYears, setSipYears] = useState(20);
  const [sipRate, setSipRate] = useState(12);

  const [fireExp, setFireExp] = useState(600000);
  const [firePortfolio, setFirePortfolio] = useState(500000);
  const [fireMonthly, setFireMonthly] = useState(25000);
  const [fireRoi, setFireRoi] = useState(10);

  const [wake, setWake] = useState('06:30');

  const bmi = useMemo(() => calcBMI(w, h), [w, h]);
  const sip = useMemo(() => calcSIP(sipMonthly, sipRate, sipYears, 0, 0), [sipMonthly, sipRate, sipYears]);
  const fire = useMemo(() => calcFIRE(fireExp, firePortfolio, fireMonthly, fireRoi), [fireExp, firePortfolio, fireMonthly, fireRoi]);
  const bedtimes = useMemo(() => calcBedtime(wake), [wake]);

  const animatedBmi = useAnimatedNumber(bmi.bmi, 350);
  const animatedSip = useAnimatedNumber(sip.maturity);
  const animatedFireNum = useAnimatedNumber(fire.fireNum);

  return (
    <div className="bg-teal-50 dark:bg-teal-950/20 rounded-3xl p-3.5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="px-4 sm:px-5 pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2.5">Try one right now. Change any number.</p>
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`relative px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                  tab === t.id ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}>
                {t.label}
                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        <div key={tab} className="p-4 sm:p-5 grid gap-4 animate-fadeSlideIn motion-reduce:animate-none">
          {tab === 'bmi' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height (cm)" value={h} onChange={setH} min={100} max={230} />
                <Field label="Weight (kg)" value={w} onChange={setW} min={25} max={300} step={0.5} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
                <p className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums leading-none">{animatedBmi.toFixed(1)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">{bmi.cat}</p>
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2.5">
                  <span className="text-gray-500 dark:text-gray-400">Healthy weight range</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bmi.hMin}–{bmi.hMax} kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
                <span className="text-xs text-gray-400">BMI is a screening tool, not a diagnosis.</span>
                <Link href="/tools/health/bmi" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">Open the BMI calculator →</Link>
              </div>
            </>
          )}

          {tab === 'sip' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Monthly (₹)" value={sipMonthly} onChange={setSipMonthly} min={100} max={1000000} step={500} />
                <Field label="Years" value={sipYears} onChange={setSipYears} min={1} max={40} />
                <Field label="Return (%/yr)" value={sipRate} onChange={setSipRate} min={1} max={25} step={0.5} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
                <p className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums leading-none">{money(animatedSip)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Estimated value after {sipYears} years</p>
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-2.5">
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">You invest</span><span className="font-bold text-gray-900 dark:text-white">{money(sip.invested)}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Estimated gain</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{money(sip.gain)}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
                <span className="text-xs text-gray-400">Returns vary. This assumes a steady rate.</span>
                <Link href="/tools/finance/sip" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">Add a yearly step-up →</Link>
              </div>
            </>
          )}

          {tab === 'fire' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Yearly expenses (₹)" value={fireExp} onChange={setFireExp} min={100000} max={10000000} step={10000} />
                <Field label="Invested today (₹)" value={firePortfolio} onChange={setFirePortfolio} min={0} max={100000000} step={10000} />
                <Field label="Invest/month (₹)" value={fireMonthly} onChange={setFireMonthly} min={0} max={1000000} step={1000} />
                <Field label="Return (%/yr)" value={fireRoi} onChange={setFireRoi} min={1} max={25} step={0.5} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-400 leading-none">
                  {fire.neverReaches ? 'More than 50 years' : `${fire.years}y ${fire.remMonths}mo`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">to reach your FIRE number</p>
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2.5">
                  <span className="text-gray-500 dark:text-gray-400">FIRE number (25× expenses)</span>
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">{money(animatedFireNum)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
                <span className="text-xs text-gray-400">In today's money.</span>
                <Link href="/tools/finance/fire" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">Open the FIRE calculator →</Link>
              </div>
            </>
          )}

          {tab === 'sleep' && (
            <>
              <label className="grid gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-[12rem]">
                Wake-up time
                <input type="time" value={wake} onChange={e => setWake(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base font-bold text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition-colors" />
              </label>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
                <p className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums leading-none">{bedtimes[0].time}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Bedtime for {bedtimes[0].hours}h of sleep ({bedtimes[0].cycles} cycles)</p>
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-2.5">
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">{bedtimes[1].cycles} cycles ({bedtimes[1].hours}h)</span><span className="font-bold text-gray-900 dark:text-white">{bedtimes[1].time}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">{bedtimes[2].cycles} cycles ({bedtimes[2].hours}h)</span><span className="font-bold text-gray-900 dark:text-white">{bedtimes[2].time}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
                <span className="text-xs text-gray-400">Assumes about 15 minutes to fall asleep.</span>
                <Link href="/tools/health/sleep" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">Open the sleep calculator →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
