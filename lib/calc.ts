/** All pure calculation functions. No imports, no side effects. */

// ── Finance ──────────────────────────────────────────────────────────────────

export function calcCompound(
  principal: number, ratePercent: number, years: number,
  compPerYear: number, monthlyContrib: number,
  annualTopUp: number, annualStepUpPct: number,
) {
  const r = ratePercent / 100 / compPerYear;
  let bal = principal, invested = principal, mc = monthlyContrib;
  const rows: { year: number; yearInterest: number; accrued: number; invested: number; balance: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const startBal = bal;
    for (let i = 0; i < compPerYear; i++) bal = bal * (1 + r) + mc * (12 / compPerYear);
    bal += annualTopUp;
    invested += mc * 12 + annualTopUp;
    rows.push({ year: y, yearInterest: Math.round(bal - startBal - mc * 12 - annualTopUp), accrued: Math.round(bal - principal), invested: Math.round(invested), balance: Math.round(bal) });
    mc *= 1 + annualStepUpPct / 100;
  }
  return { final: Math.round(bal), interest: Math.round(bal - invested), invested: Math.round(invested), rows };
}

export function calcSIP(monthly: number, ratePercent: number, years: number, stepUpPct: number, lumpSum: number) {
  const r = ratePercent / 100 / 12;
  let bal = lumpSum, invested = lumpSum, mc = monthly;
  const rows: { year: number; invested: number; value: number; gain: number }[] = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) bal = bal * (1 + r) + mc;
    invested += mc * 12;
    rows.push({ year: y, invested: Math.round(invested), value: Math.round(bal), gain: Math.round(bal - invested) });
    mc *= 1 + stepUpPct / 100;
  }
  return { maturity: Math.round(bal), invested: Math.round(invested), gain: Math.round(bal - invested), rows };
}

export function calcSavingsGoal(goal: number, current: number, monthly: number, ratePercent: number) {
  const r = ratePercent / 100 / 12;
  let bal = current, mo = 0;
  while (bal < goal && mo < 1200) { bal = bal * (1 + r) + monthly; mo++; }
  return { months: mo, years: Math.floor(mo / 12), remMonths: mo % 12, totalDeposited: Math.round(current + monthly * mo), interest: Math.round(bal - current - monthly * mo), neverReaches: mo >= 1200 && bal < goal };
}

export function calcMonthlyNeeded(goal: number, current: number, months: number, ratePercent: number) {
  const r = ratePercent / 100 / 12;
  if (r === 0) return Math.max(0, (goal - current) / months);
  return Math.max(0, (goal - current * Math.pow(1 + r, months)) * r / (Math.pow(1 + r, months) - 1));
}

export function calcLoan(principal: number, ratePercent: number, months: number, extraMonthly = 0) {
  const r = ratePercent / 100 / 12;
  const emi = r === 0 ? Math.round(principal / months) : Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
  let bal = principal, mo = 0, totalInt = 0;
  const rows: { year: number; principal: number; interest: number; balance: number }[] = [];
  while (bal > 0.5 && mo < months + 360) {
    const int = bal * r;
    const prin = Math.min(emi + extraMonthly - int, bal);
    bal = Math.max(0, bal - prin);
    totalInt += int;
    mo++;
    if (mo % 12 === 0 || bal < 1) {
      const y = Math.ceil(mo / 12);
      if (!rows[y - 1]) rows[y - 1] = { year: y, principal: 0, interest: 0, balance: 0 };
      rows[y - 1].principal += prin;
      rows[y - 1].interest  += int;
      rows[y - 1].balance    = Math.round(bal);
    }
  }
  return { emi, totalMonths: mo, interest: Math.round(totalInt), total: Math.round(principal + totalInt), neverPaysOff: mo >= months + 360, rows: rows.filter(Boolean) };
}

export function calcDebtPayoff(debts: { name: string; balance: number; rate: number; minPayment: number }[], extraMonthly: number) {
  const sim = (ds: typeof debts, method: 'avalanche' | 'snowball') => {
    const data = ds.map(d => ({ ...d }));
    let months = 0; let totalInt = 0;
    while (data.some(d => d.balance > 0) && months < 600) {
      months++;
      data.forEach(d => { if (d.balance <= 0) return; const int = d.balance * d.rate / 100 / 12; d.balance = Math.max(0, d.balance + int - d.minPayment); totalInt += int; });
      const active = data.filter(d => d.balance > 0);
      if (active.length) {
        const t = method === 'avalanche' ? active.reduce((a, b) => a.rate > b.rate ? a : b) : active.reduce((a, b) => a.balance < b.balance ? a : b);
        t.balance = Math.max(0, t.balance - extraMonthly);
      }
    }
    return { months, years: Math.floor(months / 12), remMonths: months % 12, totalInterest: Math.round(totalInt) };
  };
  return { avalanche: sim(debts.map(d => ({ ...d })), 'avalanche'), snowball: sim(debts.map(d => ({ ...d })), 'snowball') };
}

export function calcRetirement(age: number, retAge: number, monthlyExpense: number, inflation: number, roi: number, life: number) {
  const yrs = Math.max(1, retAge - age);
  const retYrs = Math.max(1, life - retAge);
  const futureExpense = Math.round(monthlyExpense * Math.pow(1 + inflation / 100, yrs));

  // realR can be exactly 0 if roi === inflation — a perfectly plausible
  // slider position. The PV-of-annuity formula divides by realR, so this
  // needs an explicit zero-rate fallback (same pattern as calcLoan's r===0
  // case) rather than letting it silently produce Infinity/NaN.
  const realR = (roi - inflation) / 100 / 12;
  const corpus = Math.abs(realR) < 1e-9
    ? Math.round(futureExpense * retYrs * 12)
    : Math.round(futureExpense * 12 * (1 - Math.pow(1 + realR, -retYrs * 12)) / realR);

  const r = roi / 100 / 12;
  const monthly = Math.abs(r) < 1e-9
    ? Math.round(corpus / (yrs * 12))
    : Math.round(corpus * r / (Math.pow(1 + r, yrs * 12) - 1));

  return { corpus, monthly, yrs, futureExpense, fireNum: Math.round(monthlyExpense * 12 * 25), safe4pct: Math.round(corpus * 0.04 / 12) };
}

/**
 * Given a target corpus and a horizon, finds the STARTING monthly contribution
 * that — growing by stepUpPct once per year — accumulates to exactly `corpus`
 * by year `yrs`. No closed form exists for a stepped (non-continuous) growing
 * annuity, so this bisects on the simulated future value (60 iterations is
 * far more precision than the rounded rupee output needs).
 */
export function calcRetirementStepUp(corpus: number, yrs: number, roi: number, stepUpPct: number) {
  const r = roi / 100 / 12;
  const fvFor = (startMonthly: number) => {
    let bal = 0, mc = startMonthly;
    for (let y = 1; y <= yrs; y++) {
      for (let m = 0; m < 12; m++) bal = bal * (1 + r) + mc;
      mc *= 1 + stepUpPct / 100;
    }
    return bal;
  };
  let lo = 0, hi = Math.max(1, corpus);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (fvFor(mid) < corpus) lo = mid; else hi = mid;
  }
  const startMonthly = Math.round(hi);

  let bal = 0, invested = 0, mc = startMonthly;
  const rows: { year: number; invested: number; value: number }[] = [];
  for (let y = 1; y <= yrs; y++) {
    for (let m = 0; m < 12; m++) bal = bal * (1 + r) + mc;
    invested += mc * 12;
    rows.push({ year: y, invested: Math.round(invested), value: Math.round(bal) });
    mc *= 1 + stepUpPct / 100;
  }
  return { startMonthly, finalMonthly: Math.round(mc / (1 + stepUpPct / 100)), rows };
}

export function calcFIRE(annualExp: number, portfolio: number, monthlyInvest: number, roi: number) {
  const fireNum = Math.round(annualExp * 25);
  const r = roi / 100 / 12;
  let bal = portfolio, months = 0;
  while (bal < fireNum && months < 600) { bal = bal * (1 + r) + monthlyInvest; months++; }
  return { fireNum, months, years: Math.floor(months / 12), remMonths: months % 12, deficit: Math.max(0, fireNum - portfolio), leanFire: Math.round(annualExp * 0.7 * 25), fatFire: Math.round(annualExp * 1.5 * 25), neverReaches: months >= 600 && bal < fireNum };
}

/** Same as calcFIRE, but the monthly contribution grows by stepUpPct once per year — plus a year-by-year portfolio trajectory for the chart/table. */
export function calcFIREStepUp(fireNum: number, portfolio: number, startMonthly: number, roi: number, stepUpPct: number) {
  const r = roi / 100 / 12;
  let bal = portfolio, invested = 0, mc = startMonthly, months = 0;
  const rows: { year: number; invested: number; value: number }[] = [];
  while (bal < fireNum && months < 600) {
    bal = bal * (1 + r) + mc;
    invested += mc;
    months++;
    if (months % 12 === 0) {
      rows.push({ year: months / 12, invested: Math.round(invested), value: Math.round(bal) });
      mc *= 1 + stepUpPct / 100;
    }
  }
  return { months, years: Math.floor(months / 12), remMonths: months % 12, rows, neverReaches: months >= 600 && bal < fireNum };
}

export function calcBudget(income: number) {
  return { needs: Math.round(income * 0.5), wants: Math.round(income * 0.3), savings: Math.round(income * 0.2), emergency3: Math.round(income * 3), emergency6: Math.round(income * 6) };
}

export function calcNetWorth(assets: { label: string; value: number }[], liabilities: { label: string; value: number }[]) {
  const ta = assets.reduce((s, a) => s + a.value, 0);
  const tl = liabilities.reduce((s, l) => s + l.value, 0);
  return { totalAssets: ta, totalLiab: tl, netWorth: ta - tl };
}

export function calcMoneyLast(savings: number, withdrawal: number, ratePercent: number, inflationPct = 0) {
  const r = ratePercent / 100 / 12, inf = inflationPct / 100 / 12;
  let bal = savings, months = 0, wd = withdrawal;
  const rows: { year: number; balance: number; withdrawal: number }[] = [];
  while (bal > 0 && months < 1200) {
    bal = bal * (1 + r) - wd; wd *= (1 + inf); months++;
    if (months % 12 === 0) rows.push({ year: months / 12, balance: Math.max(0, Math.round(bal)), withdrawal: Math.round(wd) });
    if (bal <= 0) break;
  }
  return { months, years: Math.floor(months / 12), remMonths: months % 12, forever: months >= 1200, rows };
}

export function calcInflation(amount: number, ratePercent: number, years: number, dir: 'future' | 'past') {
  const factor = Math.pow(1 + ratePercent / 100, years);
  return { result: Math.round((dir === 'future' ? amount * factor : amount / factor) * 100) / 100, factor: Math.round(factor * 1000) / 1000 };
}

export function calcGST(amount: number, rate: number, type: 'add' | 'remove') {
  const gst = type === 'add' ? amount * rate / 100 : amount - amount * 100 / (100 + rate);
  const original = type === 'add' ? amount : amount - gst;
  return { original: Math.round(original * 100) / 100, gst: Math.round(gst * 100) / 100, total: Math.round((original + gst) * 100) / 100 };
}

export function calcIncomeTax(gross: number, deductions: number) {
  const taxable = Math.max(0, gross - deductions);
  const brackets = [[0,11600,10],[11600,47150,12],[47150,100525,22],[100525,191950,24],[191950,243725,32],[243725,609350,35],[609350,Infinity,37]] as [number,number,number][];
  let tax = 0;
  const breakdown: { bracket: string; rate: number; tax: number }[] = [];
  for (const [lo, hi, rate] of brackets) {
    if (taxable <= lo) break;
    const chunk = Math.min(taxable - lo, hi - lo);
    const t = Math.round(chunk * rate / 100);
    tax += t;
    if (t > 0) breakdown.push({ bracket: `$${(lo/1000).toFixed(0)}K–${hi===Infinity?'above':`$${(hi/1000).toFixed(0)}K`}`, rate, tax: t });
  }
  return { taxable: Math.round(taxable), tax, effective: +((tax/gross)*100).toFixed(2), monthly: Math.round(tax/12), breakdown };
}

export function calcSalary(gross: number, taxPct: number, pensionPct: number, otherPct: number) {
  const tax = Math.round(gross * taxPct / 100);
  const pension = Math.round(gross * pensionPct / 100);
  const other = Math.round(gross * otherPct / 100);
  const net = gross - tax - pension - other;
  return { gross, tax, pension, other, net, monthly: Math.round(net / 12), weekly: Math.round(net / 52) };
}

export const CURRENCIES = [
  { code:'USD', sym:'$', flag:'🇺🇸', name:'US Dollar' },
  { code:'EUR', sym:'€', flag:'🇪🇺', name:'Euro' },
  { code:'GBP', sym:'£', flag:'🇬🇧', name:'British Pound' },
  { code:'INR', sym:'₹', flag:'🇮🇳', name:'Indian Rupee' },
  { code:'JPY', sym:'¥', flag:'🇯🇵', name:'Japanese Yen' },
  { code:'AED', sym:'د.إ', flag:'🇦🇪', name:'UAE Dirham' },
  { code:'AUD', sym:'A$', flag:'🇦🇺', name:'Australian Dollar' },
  { code:'CAD', sym:'C$', flag:'🇨🇦', name:'Canadian Dollar' },
  { code:'SGD', sym:'S$', flag:'🇸🇬', name:'Singapore Dollar' },
  { code:'CHF', sym:'Fr', flag:'🇨🇭', name:'Swiss Franc' },
  { code:'CNY', sym:'¥', flag:'🇨🇳', name:'Chinese Yuan' },
  { code:'BRL', sym:'R$', flag:'🇧🇷', name:'Brazilian Real' },
  { code:'MYR', sym:'RM', flag:'🇲🇾', name:'Malaysian Ringgit' },
  { code:'KRW', sym:'₩', flag:'🇰🇷', name:'South Korean Won' },
  { code:'ZAR', sym:'R', flag:'🇿🇦', name:'South African Rand' },
] as const;
const FX: Record<string, number> = { USD:1,EUR:0.92,GBP:0.79,INR:83.5,JPY:157,AED:3.67,AUD:1.54,CAD:1.36,SGD:1.34,CHF:0.9,CNY:7.24,BRL:5.14,MYR:4.72,KRW:1370,ZAR:18.6 };
export function calcCurrency(amount: number, from: string, to: string) {
  const r = (FX[to] ?? 1) / (FX[from] ?? 1);
  return { result: Math.round(amount * r * 100) / 100, rate: Math.round(r * 10000) / 10000 };
}

export function calcTip(bill: number, tipPct: number, people: number) {
  const tip = Math.round(bill * tipPct / 100 * 100) / 100;
  const total = Math.round((bill + tip) * 100) / 100;
  return { tip, total, perPerson: Math.round(total / people * 100) / 100, tipPerPerson: Math.round(tip / people * 100) / 100 };
}

// ── Health ────────────────────────────────────────────────────────────────────

export function calcBMI(weightKg: number, heightCm: number) {
  const h = Math.max(1, heightCm); // guard: prevents Infinity if height is 0 during input
  const w = Math.max(0, weightKg);
  const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : bmi < 35 ? 'Obese I' : 'Obese II+';
  const hMin = Math.round(18.5 * Math.pow(h / 100, 2) * 10) / 10;
  const hMax = Math.round(24.9 * Math.pow(h / 100, 2) * 10) / 10;
  return { bmi, cat, hMin, hMax, tolose: bmi > 25 ? Math.round((w - hMax) * 10) / 10 : undefined };
}

export function calcIdealWeight(heightCm: number, gender: 'male' | 'female') {
  const over = Math.max(0, (heightCm / 2.54) - 60);
  return {
    robinson: +(gender === 'male' ? 52 + 1.9 * over : 49 + 1.7 * over).toFixed(1),
    miller:   +(gender === 'male' ? 56.2 + 1.41 * over : 53.1 + 1.36 * over).toFixed(1),
    devine:   +(gender === 'male' ? 50 + 2.3 * over : 45.5 + 2.3 * over).toFixed(1),
    hamwi:    +(gender === 'male' ? 48 + 2.7 * over : 45.4 + 2.27 * over).toFixed(1),
    bmiMin:   Math.round(18.5 * Math.pow(heightCm / 100, 2) * 10) / 10,
    bmiMax:   Math.round(24.9 * Math.pow(heightCm / 100, 2) * 10) / 10,
  };
}

export function calcBodyFat(weightKg: number, heightCm: number, waistCm: number, neckCm: number, gender: 'male' | 'female', hipCm = 90) {
  const w = Math.max(1, weightKg);
  const h = Math.max(1, heightCm);
  // Math.log10 of zero/negative is -Infinity/NaN — guard the log arguments to
  // stay positive even if waist <= neck (an easy real-world input mistake).
  const waistMinusNeck = Math.max(1, waistCm - neckCm);
  const waistHipMinusNeck = Math.max(1, waistCm + hipCm - neckCm);
  let pct = gender === 'male'
    ? 86.01 * Math.log10(waistMinusNeck) - 70.041 * Math.log10(h) + 36.76
    : 163.205 * Math.log10(waistHipMinusNeck) - 97.684 * Math.log10(h) - 78.387;
  pct = Math.max(2, Math.min(70, Math.round(pct * 10) / 10));
  const cats = gender === 'male'
    ? [{ m: 5, l: 'Essential' }, { m: 13, l: 'Athletes' }, { m: 17, l: 'Fitness' }, { m: 25, l: 'Average' }, { m: 100, l: 'Obese' }]
    : [{ m: 13, l: 'Essential' }, { m: 20, l: 'Athletes' }, { m: 24, l: 'Fitness' }, { m: 31, l: 'Average' }, { m: 100, l: 'Obese' }];
  return { pct, cat: cats.find(c => pct <= c.m)?.l ?? 'Obese', fat: +(w * pct / 100).toFixed(1), lean: +(w * (1 - pct / 100)).toFixed(1) };
}

export function calcWeightLoss(currentKg: number, goalKg: number, heightCm: number, age: number, gender: 'male' | 'female', activity: string) {
  const w = Math.max(1, currentKg);
  const h = Math.max(1, heightCm);
  const a = Math.max(1, age);
  const bmr = gender === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;
  const mult: Record<string,number> = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
  const tdee = Math.round(Math.max(0, bmr) * (mult[activity] ?? 1.55));
  const tolose = Math.max(0, w - goalKg);
  return {
    tdee, tolose,
    plan500:  { calories: tdee - 500,  weeks: Math.ceil(tolose / 0.5),  months: Math.ceil(Math.ceil(tolose / 0.5)  / 4.33) },
    plan750:  { calories: tdee - 750,  weeks: Math.ceil(tolose / 0.75), months: Math.ceil(Math.ceil(tolose / 0.75) / 4.33) },
    plan1000: { calories: Math.max(1200, tdee - 1000), weeks: Math.ceil(tolose / 1), months: Math.ceil(Math.ceil(tolose / 1) / 4.33) },
  };
}

export function calcCalories(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female', activity: string, goal: string) {
  const w = Math.max(1, weightKg);
  const h = Math.max(1, heightCm);
  const a = Math.max(1, age);
  const bmr = gender === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;
  const mult: Record<string,number> = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
  const tdee = Math.round(Math.max(0, bmr) * (mult[activity] ?? 1.55));
  const target = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
  return { bmr: Math.round(bmr), tdee, target, protein: Math.round(w * 2), carbs: Math.round(target * 0.45 / 4), fat: Math.round(target * 0.25 / 9) };
}

export function calcWater(weightKg: number, activity: string, climate: string) {
  const base = weightKg * 33;
  const act: Record<string,number> = { sedentary:0, light:300, moderate:500, active:700, very_active:1000 };
  const cli: Record<string,number> = { cold:-200, temperate:0, hot:500 };
  const ml = Math.round(base + (act[activity]??0) + (cli[climate]??0));
  return { ml, liters: +(ml/1000).toFixed(1), glasses: Math.round(ml/250), floz: Math.round(ml*0.033814) };
}

export function calcMacros(calories: number, goal: string) {
  const p = goal==='lose'?0.35:0.30, c = goal==='lose'?0.35:goal==='gain'?0.45:0.40;
  return { protein: Math.round(calories*p/4), carbs: Math.round(calories*c/4), fat: Math.round(calories*(1-p-c)/9), calories };
}

export function calcHeartRate(age: number, restingHR: number) {
  const maxHR = 220 - age, hrr = maxHR - restingHR;
  return { maxHR, hrr, restingHR,
    zones: [
      { name:'Zone 1 — Recovery',  pct:'50–60%', min:Math.round(restingHR+hrr*0.50), max:Math.round(restingHR+hrr*0.60), benefit:'Active recovery, warm-up' },
      { name:'Zone 2 — Fat Burn',  pct:'60–70%', min:Math.round(restingHR+hrr*0.60), max:Math.round(restingHR+hrr*0.70), benefit:'Fat burning, base fitness' },
      { name:'Zone 3 — Cardio',    pct:'70–80%', min:Math.round(restingHR+hrr*0.70), max:Math.round(restingHR+hrr*0.80), benefit:'Cardiovascular endurance' },
      { name:'Zone 4 — Threshold', pct:'80–90%', min:Math.round(restingHR+hrr*0.80), max:Math.round(restingHR+hrr*0.90), benefit:'Speed and lactate threshold' },
      { name:'Zone 5 — Maximum',   pct:'90–100%',min:Math.round(restingHR+hrr*0.90), max:maxHR,                          benefit:'Peak performance, sprints' },
    ],
  };
}

const METS: Record<string,number> = { walking:1.5, brisk_walk:3.5, running:8, cycling:7, swimming:7, yoga:3, weight_training:5, hiit:8, football:8, basketball:6, tennis:7, dancing:4.5, golf:3.5, rowing:7, boxing:9, desk_work:1.3, cooking:2, cleaning:3, gardening:3.5 };
export function calcCaloriesBurned(weightKg: number, activityKey: string, minutes: number) {
  const met = METS[activityKey] ?? 4;
  const cals = Math.round(met * weightKg * (minutes / 60));
  return { calories: cals, perHour: Math.round(cals / minutes * 60), met };
}

export function calcSteps(steps: number, weightKg: number, heightCm: number) {
  const stride = heightCm * 0.413 / 100;
  const km = (steps * stride) / 1000;
  return { calories: Math.round(steps * weightKg * 0.0005), distanceKm: Math.round(km * 100) / 100, distanceMi: Math.round(km * 0.621 * 100) / 100, stepsPerKm: Math.round(1000 / stride) };
}

export function calcSleep(bedtime: string) {
  const [h, m] = bedtime.split(':').map(Number);
  let mins = h * 60 + m + 15;
  return Array.from({ length: 6 }, (_, i) => {
    mins += 90;
    const t = mins % 1440, wh = Math.floor(t / 60) % 24, wm = t % 60;
    return { cycle: i + 1, time: `${String(wh).padStart(2,'0')}:${String(wm).padStart(2,'0')}`, hours: +((i + 1) * 1.5 + 0.25).toFixed(1) };
  });
}

export function calcAge(dob: Date) {
  const now = new Date();
  let y = now.getFullYear()-dob.getFullYear(), mo = now.getMonth()-dob.getMonth(), d = now.getDate()-dob.getDate();
  if (d < 0) { mo--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (mo < 0) { y--; mo += 12; }
  const totalDays = Math.floor((now.getTime()-dob.getTime())/86400000);
  const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next <= now) next.setFullYear(now.getFullYear()+1);
  return { y, mo, d, totalDays, totalHours: totalDays * 24, daysUntil: Math.ceil((next.getTime()-now.getTime())/86400000), dow: dob.toLocaleDateString('en-US',{weekday:'long'}) };
}

export function calcDueDate(lmp: Date) {
  const due = new Date(lmp); due.setDate(due.getDate() + 280);
  const gDays = Math.max(0, Math.floor((new Date().getTime()-lmp.getTime())/86400000));
  return { due, gWeeks: Math.floor(gDays/7), gDaysRem: gDays%7, trimester: gDays < 91 ? 1 : gDays < 189 ? 2 : 3, remaining: Math.max(0, Math.ceil((due.getTime()-new Date().getTime())/86400000)) };
}

// ── New calculators (36 → 60 expansion) ─────────────────────────────────────

/** Fixed Deposit maturity — standard Indian FD quarterly compounding. */
export function calcFD(principal: number, ratePercent: number, years: number) {
  const p = Math.max(0, principal);
  const n = 4; // quarterly compounding — Indian bank FD convention
  const r = ratePercent / 100 / n;
  const periods = Math.max(0.25, years) * n;
  const maturity = p * Math.pow(1 + r, periods);
  return {
    maturity: Math.round(maturity),
    interest: Math.round(maturity - p),
    invested: Math.round(p),
    rows: Array.from({ length: Math.max(1, Math.round(years)) }, (_, i) => {
      const y = i + 1;
      const val = p * Math.pow(1 + r, y * n);
      return { year: y, value: Math.round(val), interest: Math.round(val - p) };
    }),
  };
}

/** Recurring Deposit maturity — monthly contributions, quarterly-compounded effective rate (Indian RD convention). */
export function calcRD(monthly: number, ratePercent: number, months: number) {
  const m = Math.max(0, monthly);
  const n = Math.max(1, Math.round(months));
  const r = ratePercent / 100 / 4; // quarterly rate
  // Each instalment compounds for the remaining quarters until maturity —
  // standard RD maturity formula via month-by-month simulation for accuracy.
  let bal = 0;
  const rows: { month: number; invested: number; value: number }[] = [];
  for (let i = 1; i <= n; i++) {
    bal = (bal + m) * Math.pow(1 + r, 1 / 3); // distribute quarterly compounding across 3 months
    if (i % 3 === 0 || i === n) rows.push({ month: i, invested: Math.round(m * i), value: Math.round(bal) });
  }
  return { maturity: Math.round(bal), invested: Math.round(m * n), interest: Math.round(bal - m * n), rows };
}

/** PPF (Public Provident Fund) — 15-year lock-in, annual compounding, tax-free maturity (India). */
export function calcPPF(yearlyDeposit: number, ratePercent: number, years = 15) {
  const d = Math.max(0, Math.min(150000, yearlyDeposit)); // PPF annual cap ₹1.5L
  const r = ratePercent / 100;
  let bal = 0;
  const rows: { year: number; deposit: number; interest: number; balance: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const int = Math.round((bal + d) * r);
    bal = bal + d + int;
    rows.push({ year: y, deposit: d, interest: int, balance: Math.round(bal) });
  }
  return { maturity: Math.round(bal), invested: d * years, interest: Math.round(bal - d * years), rows };
}

/** Car Loan EMI — same amortization as calcLoan, exposed separately for category clarity + depreciation note. */
export function calcCarLoan(price: number, downPaymentPct: number, ratePercent: number, years: number, extraMonthly = 0) {
  const principal = Math.max(0, price * (1 - downPaymentPct / 100));
  const months = Math.max(1, Math.round(years * 12));
  const loan = calcLoan(principal, ratePercent, months, extraMonthly);
  // Cars depreciate roughly 15-20%/year — useful context vs a home loan.
  const depreciatedValue = Math.round(price * Math.pow(0.82, years));
  return { ...loan, principal: Math.round(principal), downPayment: Math.round(price - principal), depreciatedValue };
}

/** Personal Loan EMI — unsecured, typically higher rate & shorter tenure than secured loans. */
export function calcPersonalLoan(principal: number, ratePercent: number, years: number, extraMonthly = 0) {
  const months = Math.max(1, Math.round(years * 12));
  return calcLoan(Math.max(0, principal), ratePercent, months, extraMonthly);
}

/** Lean FIRE — minimal sustainable expense base, same 25x rule applied to a leaner number. */
export function calcLeanFIRE(currentAnnualExp: number, leanPct: number, currentPortfolio: number, monthlyInvest: number, roi: number) {
  const leanExp = currentAnnualExp * (1 - leanPct / 100);
  const fireNumber = leanExp * 25;
  const r = roi / 100 / 12;
  let bal = currentPortfolio, months = 0;
  while (bal < fireNumber && months < 1200) { bal = bal * (1 + r) + monthlyInvest; months++; }
  return { leanExp: Math.round(leanExp), fireNumber: Math.round(fireNumber), months, years: Math.floor(months / 12), remMonths: months % 12, neverReaches: months >= 1200 && bal < fireNumber };
}

/** Coast FIRE — the point where existing investments alone, with zero further contributions, reach the target by a future date. */
export function calcCoastFIRE(currentPortfolio: number, targetFireNumber: number, yearsToRetirement: number, roi: number) {
  const r = roi / 100;
  const projectedAtRetirement = currentPortfolio * Math.pow(1 + r, Math.max(0, yearsToRetirement));
  const isCoastFire = projectedAtRetirement >= targetFireNumber;
  const shortfall = Math.max(0, targetFireNumber - projectedAtRetirement);
  // Coast FIRE number today: the amount needed right now to coast to the target with zero further contributions.
  const coastNumberToday = yearsToRetirement > 0 ? targetFireNumber / Math.pow(1 + r, yearsToRetirement) : targetFireNumber;
  return { projectedAtRetirement: Math.round(projectedAtRetirement), isCoastFire, shortfall: Math.round(shortfall), coastNumberToday: Math.round(coastNumberToday) };
}

/** Emergency fund target — months of expenses scaled by job-stability factor. */
export function calcEmergencyFund(monthlyExpenses: number, stabilityFactor: number, currentSavings: number) {
  const exp = Math.max(0, monthlyExpenses);
  const months = Math.max(1, stabilityFactor);
  const target = exp * months;
  const gap = Math.max(0, target - Math.max(0, currentSavings));
  return { target: Math.round(target), months, gap: Math.round(gap), monthsCovered: exp > 0 ? +(Math.max(0, currentSavings) / exp).toFixed(1) : 0 };
}

/** HRA exemption — Section 10(13A), least of three conditions (India). */
export function calcHRA(basicSalary: number, hraReceived: number, rentPaid: number, isMetro: boolean) {
  const basic = Math.max(0, basicSalary);
  const hra = Math.max(0, hraReceived);
  const rent = Math.max(0, rentPaid);
  const condition1 = hra;
  const condition2 = Math.max(0, rent - 0.1 * basic);
  const condition3 = basic * (isMetro ? 0.5 : 0.4);
  const exemption = Math.max(0, Math.min(condition1, condition2, condition3));
  const taxable = Math.max(0, hra - exemption);
  return { exemption: Math.round(exemption), taxable: Math.round(taxable), condition1: Math.round(condition1), condition2: Math.round(condition2), condition3: Math.round(condition3) };
}

/** Capital gains tax — equity (STCG 20%/LTCG 12.5% over 1.25L exemption) vs debt/property (slab-linked, simplified flat estimate). */
export function calcCapitalGains(purchasePrice: number, salePrice: number, holdingMonths: number, assetType: 'equity' | 'debt' | 'property') {
  const gain = Math.max(0, salePrice - purchasePrice);
  let isLongTerm: boolean, taxRate: number, exemption = 0;

  if (assetType === 'equity') {
    isLongTerm = holdingMonths > 12;
    taxRate = isLongTerm ? 12.5 : 20;
    exemption = isLongTerm ? 125000 : 0;
  } else if (assetType === 'debt') {
    isLongTerm = holdingMonths > 36;
    taxRate = 20; // simplified flat estimate — actual debt fund LTCG is slab-rate post-2023 rules
  } else {
    isLongTerm = holdingMonths > 24;
    taxRate = isLongTerm ? 20 : 30; // simplified — property STCG taxed at slab rate, 30% used as a high-bracket estimate
  }

  const taxableGain = Math.max(0, gain - exemption);
  const tax = Math.round(taxableGain * taxRate / 100);
  return { gain: Math.round(gain), isLongTerm, taxRate, exemption, taxableGain: Math.round(taxableGain), tax, netGain: Math.round(gain - tax) };
}

/** India new-tax-regime slabs (FY 2024-25, incl. Sec 87A rebate + 4% cess) on annual taxable income. */
function indiaNewRegimeTax(annualTaxable: number): number {
  const t = Math.max(0, annualTaxable);
  if (t <= 700000) return 0; // Sec 87A rebate — nil tax up to ₹7L taxable
  const brackets: [number, number, number][] = [[0,300000,0],[300000,700000,5],[700000,1000000,10],[1000000,1200000,15],[1200000,1500000,20],[1500000,Infinity,30]];
  let tax = 0;
  for (const [lo, hi, rate] of brackets) {
    if (t <= lo) break;
    tax += Math.min(t - lo, hi - lo) * rate / 100;
  }
  return Math.round(tax * 1.04);
}

/** Take-home salary from CTC — simplified breakup (basic, HRA, PF, taxable, in-hand). Tax uses India's new-regime slabs. */
export function calcTakeHome(ctc: number, basicPct: number, bonusAnnual: number) {
  const annualCtc = Math.max(0, ctc);
  const basic = annualCtc * (basicPct / 100);
  const hra = basic * 0.4; // typical non-metro default — shown as an estimate
  const pf = Math.min(basic, 180000) * 0.12; // employee PF contribution, capped at typical wage ceiling basis
  const bonus = Math.max(0, bonusAnnual);
  const grossAnnual = annualCtc - pf; // employer PF is part of CTC but not paid to employee directly each month
  const monthlyGross = Math.round((grossAnnual - bonus) / 12);
  const monthlyPF = Math.round(pf / 12);
  const standardDeduction = 75000; // new-regime standard deduction for salaried employees
  const annualTax = indiaNewRegimeTax(grossAnnual - standardDeduction);
  const estimatedMonthlyTax = Math.round(annualTax / 12);
  const monthlyInHand = Math.max(0, monthlyGross - monthlyPF - estimatedMonthlyTax);
  return { monthlyGross, monthlyPF, estimatedMonthlyTax, monthlyInHand, annualTax, annualBonus: Math.round(bonus), basic: Math.round(basic), hra: Math.round(hra) };
}

/** Simple interest — companion/comparison to compound interest. */
export function calcSimpleInterest(principal: number, ratePercent: number, years: number) {
  const p = Math.max(0, principal);
  const interest = p * (ratePercent / 100) * Math.max(0, years);
  return { interest: Math.round(interest), total: Math.round(p + interest), principal: Math.round(p) };
}

/** Discount / sale price — supports a single discount or two stacked discounts. */
export function calcDiscount(price: number, discount1Pct: number, discount2Pct = 0) {
  const p = Math.max(0, price);
  const afterFirst = p * (1 - Math.max(0, Math.min(100, discount1Pct)) / 100);
  const afterSecond = afterFirst * (1 - Math.max(0, Math.min(100, discount2Pct)) / 100);
  const totalSaved = p - afterSecond;
  const effectivePct = p > 0 ? (totalSaved / p) * 100 : 0;
  return { finalPrice: Math.round(afterSecond * 100) / 100, totalSaved: Math.round(totalSaved * 100) / 100, effectivePct: +effectivePct.toFixed(1) };
}

/** Term life insurance cover — Human Life Value method (income replacement + liabilities − existing assets). */
export function calcTermInsurance(annualIncome: number, yearsToCover: number, outstandingLoans: number, existingSavings: number, dependents: number) {
  const income = Math.max(0, annualIncome);
  const incomeReplacement = income * Math.max(1, yearsToCover);
  const dependentBuffer = dependents * 500000; // simplified per-dependent buffer estimate
  const totalNeed = incomeReplacement + Math.max(0, outstandingLoans) + dependentBuffer;
  const recommendedCover = Math.max(0, totalNeed - Math.max(0, existingSavings));
  return { incomeReplacement: Math.round(incomeReplacement), totalNeed: Math.round(totalNeed), recommendedCover: Math.round(recommendedCover), dependentBuffer };
}

/** Health insurance cover sizing — family floater, scaled by city tier and age band (simplified heuristic, not a quote). */
export function calcHealthInsurance(familySize: number, cityTier: 'metro' | 'tier2' | 'tier3', oldestAge: number, hasExistingConditions: boolean) {
  const tierBase: Record<string, number> = { metro: 1000000, tier2: 700000, tier3: 500000 };
  let base = tierBase[cityTier] ?? 700000;
  if (oldestAge > 45) base *= 1.5;
  if (oldestAge > 60) base *= 2;
  if (hasExistingConditions) base *= 1.3;
  const perPersonAddOn = Math.max(0, familySize - 2) * 150000;
  const recommendedCover = Math.round(base + perPersonAddOn);
  const estimatedAnnualPremiumLow = Math.round(recommendedCover * 0.012);
  const estimatedAnnualPremiumHigh = Math.round(recommendedCover * 0.025);
  return { recommendedCover, estimatedAnnualPremiumLow, estimatedAnnualPremiumHigh };
}

/** Car insurance premium estimate — IDV-based simplified estimate (own-damage + third-party slab). */
export function calcCarInsurance(carValue: number, carAgeYears: number, cityTier: 'metro' | 'tier2' | 'tier3', ncbPct: number) {
  const depreciationRate = Math.min(0.6, carAgeYears * 0.1); // simplified IRDAI-style depreciation schedule
  const idv = Math.max(0, carValue * (1 - depreciationRate));
  const odRateByTier: Record<string, number> = { metro: 0.035, tier2: 0.03, tier3: 0.025 };
  const odPremium = idv * (odRateByTier[cityTier] ?? 0.03);
  const tpPremium = 2094; // simplified flat third-party slab, varies by engine cc in reality
  const grossPremium = odPremium + tpPremium;
  const ncbDiscount = grossPremium * (Math.max(0, Math.min(50, ncbPct)) / 100);
  const netPremium = Math.max(0, grossPremium - ncbDiscount);
  return { idv: Math.round(idv), odPremium: Math.round(odPremium), tpPremium, netPremium: Math.round(netPremium), ncbDiscount: Math.round(ncbDiscount) };
}

/** Waist-to-hip ratio — WHO cardiovascular risk bands. */
export function calcWaistHipRatio(waistCm: number, hipCm: number, gender: 'male' | 'female') {
  const hip = Math.max(1, hipCm);
  const ratio = +(Math.max(0, waistCm) / hip).toFixed(2);
  const thresholds = gender === 'male' ? { low: 0.9, mod: 1.0 } : { low: 0.8, mod: 0.85 };
  const risk = ratio < thresholds.low ? 'Low risk' : ratio < thresholds.mod ? 'Moderate risk' : 'High risk';
  return { ratio, risk };
}

/** Pregnancy weight gain — IOM (Institute of Medicine) guidelines by pre-pregnancy BMI category. */
export function calcPregnancyWeightGain(prePregnancyBMI: number, weeksGestation: number) {
  const w = Math.max(0, Math.min(42, weeksGestation));
  let totalLow: number, totalHigh: number;
  if (prePregnancyBMI < 18.5)      { totalLow = 12.5; totalHigh = 18; }
  else if (prePregnancyBMI < 25)   { totalLow = 11.5; totalHigh = 16; }
  else if (prePregnancyBMI < 30)   { totalLow = 7;    totalHigh = 11.5; }
  else                              { totalLow = 5;    totalHigh = 9; }
  // First trimester gain is roughly 0.5-2kg total; remaining gain spreads across weeks 13-40.
  const firstTriShare = 1.5;
  const remainingWeeks = Math.max(1, 40 - 13);
  const progressWeeks = Math.max(0, w - 13);
  const projectedLow  = w < 13 ? (w / 13) * firstTriShare : firstTriShare + (progressWeeks / remainingWeeks) * (totalLow - firstTriShare);
  const projectedHigh = w < 13 ? (w / 13) * firstTriShare : firstTriShare + (progressWeeks / remainingWeeks) * (totalHigh - firstTriShare);
  return { totalRangeLow: totalLow, totalRangeHigh: totalHigh, projectedLow: +projectedLow.toFixed(1), projectedHigh: +projectedHigh.toFixed(1), weeksGestation: w };
}

/** Protein intake target — g/kg bodyweight by activity level and goal (distinct from the % macro split calculator). */
export function calcProteinIntake(weightKg: number, activityLevel: 'sedentary' | 'moderate' | 'active' | 'athlete', goal: 'maintain' | 'lose' | 'build_muscle') {
  const w = Math.max(1, weightKg);
  const baseRange: Record<string, [number, number]> = {
    sedentary: [0.8, 1.0],
    moderate:  [1.2, 1.6],
    active:    [1.6, 2.0],
    athlete:   [1.8, 2.4],
  };
  let [lo, hi] = baseRange[activityLevel] ?? [1.2, 1.6];
  if (goal === 'lose') { lo += 0.2; hi += 0.2; } // higher protein during a deficit helps preserve lean mass
  if (goal === 'build_muscle') { hi += 0.2; }
  return { gramsLow: Math.round(w * lo), gramsHigh: Math.round(w * hi), perMealLow: Math.round((w * lo) / 4), perMealHigh: Math.round((w * hi) / 4) };
}

/** Fiber intake — age/sex RDA (US/India guidelines roughly align at 25-38g/day) with gap analysis. */
export function calcFiberIntake(age: number, gender: 'male' | 'female', currentIntake: number) {
  let rda: number;
  if (gender === 'male') rda = age > 50 ? 30 : 38;
  else rda = age > 50 ? 21 : 25;
  const current = Math.max(0, currentIntake);
  const gap = Math.max(0, rda - current);
  return { rda, gap: +gap.toFixed(1), pctOfTarget: rda > 0 ? Math.round((current / rda) * 100) : 0 };
}

/**
 * VO2 Max estimate — Jackson et al. (1990) non-exercise regression model:
 * VO2max = 56.363 + 1.921×(activity 0-7) − 0.381×(age) − 0.754×(BMI) + 10.987×(1 if male, 0 if female)
 * Uses age, BMI, sex, and a self-reported activity scale (0=sedentary to 7=elite athlete),
 * avoiding the need for a treadmill or cycle ergometer test.
 */
export function calcVO2Max(age: number, weightKg: number, heightCm: number, gender: 'male' | 'female', activityIndex: number) {
  const a = Math.max(10, age);
  const h = Math.max(50, heightCm);
  const w = Math.max(20, weightKg);
  const bmi = w / Math.pow(h / 100, 2);
  const act = Math.max(0, Math.min(7, activityIndex));
  const sexConst = gender === 'male' ? 10.987 : 0;
  const vo2 = 56.363 + (1.921 * act) - (0.381 * a) - (0.754 * bmi) + sexConst;
  // Bounded fallback keeps the estimate in a physiologically plausible range even at input extremes.
  const bounded = Math.max(15, Math.min(85, vo2));
  const category = bounded > 55 ? 'Excellent' : bounded > 45 ? 'Good' : bounded > 35 ? 'Fair' : bounded > 25 ? 'Below average' : 'Poor';
  return { vo2max: +bounded.toFixed(1), bmi: +bmi.toFixed(1), category };
}

/** Running pace & race time — converts a goal finish time into required pace and km/mile splits. */
export function calcRunningPace(distanceKm: number, goalHours: number, goalMinutes: number, goalSeconds: number) {
  const totalSeconds = Math.max(1, goalHours * 3600 + goalMinutes * 60 + goalSeconds);
  const dist = Math.max(0.1, distanceKm);
  const paceSecPerKm = totalSeconds / dist;
  const paceMin = Math.floor(paceSecPerKm / 60);
  const paceSec = Math.round(paceSecPerKm % 60);
  const paceSecPerMile = paceSecPerKm * 1.60934;
  const splits = Array.from({ length: Math.floor(dist) }, (_, i) => {
    const km = i + 1;
    const splitSeconds = Math.round(paceSecPerKm * km);
    return { km, time: `${Math.floor(splitSeconds / 60)}:${String(splitSeconds % 60).padStart(2, '0')}` };
  });
  return {
    paceMinPerKm: `${paceMin}:${String(paceSec).padStart(2, '0')}`,
    paceMinPerMile: `${Math.floor(paceSecPerMile / 60)}:${String(Math.round(paceSecPerMile % 60)).padStart(2, '0')}`,
    totalSeconds, splits,
  };
}

/** Barbell plate-loading helper — companion to the existing 1RM calculator. Standard Olympic plate set assumed (kg). */
export function calcPlateLoad(targetWeightKg: number, barWeightKg = 20) {
  const perSide = Math.max(0, (targetWeightKg - barWeightKg) / 2);
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const result: { plate: number; count: number }[] = [];
  let remaining = perSide;
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) {
      result.push({ plate: p, count });
      remaining -= count * p;
    }
  }
  const achievedPerSide = result.reduce((s, r) => s + r.plate * r.count, 0);
  const achievedTotal = barWeightKg + achievedPerSide * 2;
  return { perSide: Math.round(perSide * 100) / 100, plates: result, achievedTotal: Math.round(achievedTotal * 100) / 100, remainder: Math.round(remaining * 100) / 100 };
}

/** Ovulation & fertile window — standard luteal-phase-based estimate from last period + cycle length. */
export function calcOvulation(lastPeriodDate: Date, cycleLength: number) {
  const cycle = Math.max(20, Math.min(45, cycleLength));
  const ovulationDay = cycle - 14; // luteal phase is consistently ~14 days regardless of cycle length
  const ovulationDate = new Date(lastPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
  const fertileStart = new Date(ovulationDate); fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulationDate); fertileEnd.setDate(fertileEnd.getDate() + 1);
  const nextPeriod = new Date(lastPeriodDate); nextPeriod.setDate(nextPeriod.getDate() + cycle);
  return { ovulationDate, fertileStart, fertileEnd, nextPeriod, cycle };
}

// ── APY Calculator ─────────────────────
export function calcAPY(apr: number, compoundsPerYear: number) {
  const apy = (Math.pow(1 + apr / 100 / compoundsPerYear, compoundsPerYear) - 1) * 100;
  const daily = (Math.pow(1 + apr / 100 / 365, 365) - 1) * 100;
  const monthly = (Math.pow(1 + apr / 100 / 12, 12) - 1) * 100;
  return { apy: +apy.toFixed(4), daily: +daily.toFixed(4), monthly: +monthly.toFixed(4) };
}

// ── CAGR Calculator ────────────────────
export function calcCAGR(startVal: number, endVal: number, years: number) {
  const cagr = (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
  const absoluteReturn = ((endVal - startVal) / startVal) * 100;
  const rows: { year: number; value: number }[] = [];
  for (let y = 1; y <= years; y++) {
    rows.push({ year: y, value: Math.round(startVal * Math.pow(1 + cagr / 100, y)) });
  }
  return { cagr: +cagr.toFixed(2), absoluteReturn: +absoluteReturn.toFixed(2), gain: Math.round(endVal - startVal), rows };
}

// ── Future Value ────────────────────────
export function calcFutureValue(pv: number, rate: number, years: number, pmt: number, pmtTiming: 'end' | 'begin') {
  const r = rate / 100;
  const n = years;
  const fvLump = pv * Math.pow(1 + r, n);
  // r===0 guard: the annuity formula divides by r, which a 0% rate (a
  // perfectly valid slider position) would turn into a division by zero.
  const annuityFactor = (nn: number) => Math.abs(r) < 1e-9 ? nn : (Math.pow(1 + r, nn) - 1) / r;
  const fvPmt = pmt === 0 ? 0 : pmt * annuityFactor(n) * (pmtTiming === 'begin' ? (1 + r) : 1);
  const fv = Math.round(fvLump + fvPmt);
  const rows: { year: number; value: number }[] = [];
  for (let y = 1; y <= n; y++) {
    const lump = pv * Math.pow(1 + r, y);
    const annuity = pmt === 0 ? 0 : pmt * annuityFactor(y) * (pmtTiming === 'begin' ? (1 + r) : 1);
    rows.push({ year: y, value: Math.round(lump + annuity) });
  }
  return { fv, fvLump: Math.round(fvLump), fvPmt: Math.round(fvPmt), rows };
}

// ── IRR Calculator ──────────────────────
export function calcIRR(cashflows: number[]): number {
  // Newton-Raphson method, with bounds clamping each step — some cashflow
  // patterns can otherwise send the iteration to a runaway or NaN rate.
  let rate = 0.1;
  for (let iter = 0; iter < 200; iter++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + rate, t);
      dnpv -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dnpv) < 1e-12) break;
    let newRate = rate - npv / dnpv;
    newRate = Math.max(-0.99, Math.min(10, newRate));
    if (Math.abs(newRate - rate) < 1e-8) return +(newRate * 100).toFixed(2);
    rate = newRate;
  }
  return Number.isFinite(rate) ? +(rate * 100).toFixed(2) : 0;
}

export function calcNPV(rate: number, cashflows: number[]): number {
  return Math.round(cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate / 100, t), 0));
}

// ── Credit Card Payoff ─────────────────
export function calcCreditCard(balance: number, apr: number, minPct: number, fixedPayment: number) {
  const r = apr / 100 / 12;
  const rows: { month: number; payment: number; interest: number; principal: number; balance: number }[] = [];

  // Minimum payment simulation — Indian card issuers typically floor the
  // minimum due at ₹200, not a token amount, so the floor here matches
  // that (and the UI copy that states it) rather than an arbitrary ₹25.
  let bal = balance, months = 0, totalInt = 0;
  while (bal > 0.5 && months < 600) {
    const int = bal * r;
    const minPay = Math.max(bal * minPct / 100, 200);
    const prin = Math.min(minPay - int, bal);
    bal = Math.max(0, bal - prin);
    totalInt += int;
    months++;
    if (months <= 24) rows.push({ month: months, payment: Math.round(minPay), interest: Math.round(int), principal: Math.round(prin), balance: Math.round(bal) });
  }
  const minResult = { months, totalInterest: Math.round(totalInt), neverPaysOff: months >= 600 };

  // Fixed payment simulation
  let bal2 = balance, months2 = 0, totalInt2 = 0;
  while (bal2 > 0.5 && months2 < 600) {
    const int = bal2 * r;
    const pay = Math.max(fixedPayment, int + 1);
    const prin = Math.min(pay - int, bal2);
    bal2 = Math.max(0, bal2 - prin);
    totalInt2 += int;
    months2++;
  }
  const fixedResult = { months: months2, totalInterest: Math.round(totalInt2), neverPaysOff: months2 >= 600 };

  return { minResult, fixedResult, rows, interestSaved: Math.round(totalInt - totalInt2), monthsSaved: months - months2 };
}

// ── Mortgage Calculator ─────────────────
export function calcMortgage(price: number, downPctg: number, rate: number, years: number, propertyTaxRate: number, insuranceAnnual: number) {
  const downPayment = Math.round(price * downPctg / 100);
  const principal = price - downPayment;
  const r = rate / 100 / 12;
  const n = years * 12;
  const emi = r === 0 ? Math.round(principal / n) : Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  const totalInterest = Math.round(emi * n - principal);
  const propertyTaxMonthly = Math.round(price * propertyTaxRate / 100 / 12);
  const insuranceMonthly = Math.round(insuranceAnnual / 12);
  const totalMonthly = emi + propertyTaxMonthly + insuranceMonthly;

  const rows: { year: number; principal: number; interest: number; balance: number }[] = [];
  let bal = principal;
  for (let y = 1; y <= years; y++) {
    let yPrin = 0, yInt = 0;
    for (let m = 0; m < 12; m++) {
      const int = bal * r;
      const prin = Math.min(emi - int, bal);
      bal = Math.max(0, bal - prin);
      yPrin += prin; yInt += int;
    }
    rows.push({ year: y, principal: Math.round(yPrin), interest: Math.round(yInt), balance: Math.round(bal) });
  }
  return { emi, totalInterest, totalMonthly, downPayment, principal, propertyTaxMonthly, insuranceMonthly, rows };
}

// ── Mortgage Refinance ──────────────────
export function calcRefinance(currentBalance: number, currentRate: number, currentMonthsLeft: number, newRate: number, newYears: number, closingCosts: number) {
  const r1 = currentRate / 100 / 12;
  const currentEMI = r1 === 0 ? Math.round(currentBalance / currentMonthsLeft) : Math.round(currentBalance * r1 * Math.pow(1 + r1, currentMonthsLeft) / (Math.pow(1 + r1, currentMonthsLeft) - 1));
  const currentTotalLeft = currentEMI * currentMonthsLeft;

  const r2 = newRate / 100 / 12;
  const n2 = newYears * 12;
  const newEMI = r2 === 0 ? Math.round(currentBalance / n2) : Math.round(currentBalance * r2 * Math.pow(1 + r2, n2) / (Math.pow(1 + r2, n2) - 1));
  const newTotal = newEMI * n2 + closingCosts;

  const monthlySavings = currentEMI - newEMI;
  // A non-positive monthly saving means refinancing NEVER breaks even —
  // that's a distinct state from "breaks even in 0 months" (immediately),
  // so it's flagged explicitly rather than collapsed into the same 0.
  const neverBreaksEven = monthlySavings <= 0;
  const breakEvenMonths = neverBreaksEven ? 0 : Math.ceil(closingCosts / monthlySavings);
  const totalSavings = currentTotalLeft - newTotal;

  return { currentEMI, newEMI, monthlySavings, breakEvenMonths, neverBreaksEven, totalSavings, newTotal, currentTotalLeft };
}

// ── Pay Raise Calculator ────────────────
export function calcPayRaise(currentSalary: number, raiseType: 'percent' | 'amount', raiseValue: number, payPeriod: 'annual' | 'monthly' | 'hourly', hoursPerWeek: number) {
  const annualCurrent = payPeriod === 'annual' ? currentSalary : payPeriod === 'monthly' ? currentSalary * 12 : currentSalary * hoursPerWeek * 52;
  const raiseAmount = raiseType === 'percent' ? annualCurrent * raiseValue / 100 : raiseValue * (payPeriod === 'annual' ? 1 : payPeriod === 'monthly' ? 12 : hoursPerWeek * 52);
  const annualNew = annualCurrent + raiseAmount;
  return {
    currentAnnual: Math.round(annualCurrent),
    newAnnual: Math.round(annualNew),
    raiseAmount: Math.round(raiseAmount),
    raisePct: +((raiseAmount / annualCurrent) * 100).toFixed(2),
    currentMonthly: Math.round(annualCurrent / 12),
    newMonthly: Math.round(annualNew / 12),
    currentHourly: +(annualCurrent / (hoursPerWeek * 52)).toFixed(2),
    newHourly: +(annualNew / (hoursPerWeek * 52)).toFixed(2),
  };
}

// ── Salary to Hourly ────────────────────
export function calcSalaryHourly(salary: number, period: 'annual' | 'monthly' | 'weekly' | 'daily', hoursPerWeek: number, weeksPerYear: number) {
  const annual = period === 'annual' ? salary : period === 'monthly' ? salary * 12 : period === 'weekly' ? salary * weeksPerYear : salary * 5 * weeksPerYear;
  const hourly = annual / (hoursPerWeek * weeksPerYear);
  return {
    annual: Math.round(annual),
    monthly: Math.round(annual / 12),
    weekly: Math.round(annual / weeksPerYear),
    daily: Math.round(annual / (weeksPerYear * 5)),
    hourly: +hourly.toFixed(2),
    perMinute: +(hourly / 60).toFixed(4),
  };
}

// ── Stock Average Calculator ────────────
export function calcStockAverage(purchases: { shares: number; price: number }[]) {
  const totalShares = purchases.reduce((s, p) => s + p.shares, 0);
  const totalCost = purchases.reduce((s, p) => s + p.shares * p.price, 0);
  const avgPrice = totalShares === 0 ? 0 : totalCost / totalShares;
  return {
    totalShares,
    totalCost: Math.round(totalCost),
    avgPrice: +avgPrice.toFixed(2),
    breakEvenPrice: +avgPrice.toFixed(2),
  };
}

// ── Margin Calculator ───────────────────
export function calcMargin(cost: number, revenue: number) {
  const profit = revenue - cost;
  const grossMargin = revenue === 0 ? 0 : (profit / revenue) * 100;
  const markup = cost === 0 ? 0 : (profit / cost) * 100;
  return {
    profit: Math.round(profit),
    grossMargin: +grossMargin.toFixed(2),
    markup: +markup.toFixed(2),
    costRatio: revenue === 0 ? 0 : +((cost / revenue) * 100).toFixed(2),
  };
}

// ── Cash Back Calculator ────────────────
export function calcCashBack(monthlySpend: Record<string, number>, cashbackRates: Record<string, number>, annualFee: number) {
  const grossAnnual = Object.entries(monthlySpend).reduce((sum, [cat, spend]) => sum + spend * 12 * (cashbackRates[cat] || 0) / 100, 0);
  const netAnnual = grossAnnual - annualFee;
  return { grossAnnual: Math.round(grossAnnual), netAnnual: Math.round(netAnnual), monthlyEquivalent: Math.round(netAnnual / 12) };
}

// ── Overtime Calculator ─────────────────
export function calcOvertime(hourlyRate: number, regularHours: number, overtimeHours: number, overtimeMultiplier: number, period: 'weekly' | 'monthly') {
  const regularPay = hourlyRate * regularHours;
  const overtimePay = hourlyRate * overtimeMultiplier * overtimeHours;
  const totalPay = regularPay + overtimePay;
  const multiplier = period === 'monthly' ? 4.33 : 1;
  return {
    regularPay: Math.round(regularPay * multiplier),
    overtimePay: Math.round(overtimePay * multiplier),
    totalPay: Math.round(totalPay * multiplier),
    effectiveHourlyRate: (regularHours + overtimeHours) === 0 ? 0 : +((totalPay / (regularHours + overtimeHours))).toFixed(2),
    annualEquivalent: Math.round(totalPay * (period === 'weekly' ? 52 : 12)),
  };
}

// ── Interest Rate Calculator ────────────
export function calcInterestRate(pv: number, fv: number, years: number, pmt: number) {
  // Bisection to find rate
  let lo = 0, hi = 2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const r = mid / 12;
    const n = years * 12;
    const calcFV = pv * Math.pow(1 + r, n) + (pmt > 0 ? pmt * ((Math.pow(1 + r, n) - 1) / r) : 0);
    if (calcFV < fv) lo = mid; else hi = mid;
  }
  const annualRate = ((lo + hi) / 2) * 100;
  return { annualRate: +annualRate.toFixed(4), monthlyRate: +(annualRate / 12).toFixed(4) };
}

// ── FIRE with Age + Allocation ──────────
export function calcFIREAdvanced(
  currentAge: number, targetAge: number,
  annualExp: number, portfolio: number,
  monthlyInvest: number, stepUpPct: number,
  inflation: number
) {
  const years = Math.max(1, targetAge - currentAge);
  const fireNum = Math.round(annualExp * 25);
  const leanFire = Math.round(annualExp * 0.7 * 25);
  const fatFire = Math.round(annualExp * 1.5 * 25);

  // Asset allocation based on years to target
  let equityPct: number;
  if (years > 20) equityPct = 90;
  else if (years > 15) equityPct = 80;
  else if (years > 10) equityPct = 70;
  else if (years > 5) equityPct = 60;
  else equityPct = 50;

  const blendedReturn = (equityPct * 12 + (100 - equityPct) * 7) / 100;
  const r = blendedReturn / 100 / 12;

  // Inflation-adjusted FIRE number
  const inflAdjFireNum = Math.round(fireNum * Math.pow(1 + inflation / 100, years));

  let bal = portfolio, invested = 0, mc = monthlyInvest, months = 0;
  const rows: { year: number; invested: number; value: number; target: number }[] = [];

  while (bal < inflAdjFireNum && months < 600) {
    bal = bal * (1 + r) + mc;
    invested += mc;
    months++;
    if (months % 12 === 0) {
      const y = months / 12;
      const targetAtYear = Math.round(fireNum * Math.pow(1 + inflation / 100, y));
      rows.push({ year: y, invested: Math.round(invested), value: Math.round(bal), target: targetAtYear });
      mc *= 1 + stepUpPct / 100;
    }
  }

  const onTrack = months <= years * 12;
  const deficit = Math.max(0, inflAdjFireNum - portfolio);

  // Monthly needed to hit target in exactly `years`
  const targetMonths = years * 12;
  const neededMonthly = Math.abs(r) < 1e-9
    ? Math.round((inflAdjFireNum - portfolio) / targetMonths)
    : Math.round((inflAdjFireNum - portfolio * Math.pow(1 + r, targetMonths)) * r / (Math.pow(1 + r, targetMonths) - 1));

  return {
    fireNum, leanFire, fatFire, inflAdjFireNum,
    years, blendedReturn: +blendedReturn.toFixed(2),
    equityPct, debtPct: 100 - equityPct,
    months, yearsToFire: Math.floor(months / 12),
    remMonths: months % 12,
    onTrack, deficit, neededMonthly,
    monthlyPassive: Math.round(inflAdjFireNum * 0.04 / 12),
    rows,
  };
}

// ── Government Scheme Comparison (PPF vs EPF vs NPS vs FD) ────────────
/** Future value of a fixed monthly contribution, monthly compounding. */
function monthlyFV(contribution: number, annualRatePct: number, months: number): number {
  const mr = annualRatePct / 100 / 12;
  let bal = 0;
  for (let m = 0; m < months; m++) bal = (bal + contribution) * (1 + mr);
  return bal;
}

export function calcGovSchemeCompare(monthly: number, years: number, taxSlabPct: number) {
  const months = Math.max(1, Math.round(years * 12));
  const invested = Math.max(0, monthly) * months;

  // PPF: 7.1% p.a., fully tax-free (EEE), 15-year lock-in, capped at ₹1.5L/year (₹12,500/month)
  const ppfMonthly = Math.min(Math.max(0, monthly), 12500);
  const ppfMaturity = monthlyFV(ppfMonthly, 7.1, months);
  const ppfInvested = ppfMonthly * months;

  // EPF: 8.25% p.a., fully tax-free (EEE), locked till retirement — employer matches
  // your contribution rupee-for-rupee (12% + 12% of basic), so your money is doubled
  // going in. We model that structural benefit directly: 2x your monthly amount.
  const epfMonthly = Math.max(0, monthly) * 2;
  const epfMaturity = monthlyFV(epfMonthly, 8.25, months);
  const epfInvested = epfMonthly * months;

  // NPS: ~10% blended (equity+debt) average, market-linked so not guaranteed;
  // 40% of the corpus must buy an annuity at maturity, 60% can be withdrawn tax-free.
  const npsMaturity = monthlyFV(Math.max(0, monthly), 10, months);
  const npsLumpsum = npsMaturity * 0.6;
  const npsAnnuityCorpus = npsMaturity * 0.4;

  // FD (via monthly RD-style deposits): ~7% p.a., fully taxable at your slab rate every year
  const fdMaturity = monthlyFV(Math.max(0, monthly), 7, months);
  const fdInterest = fdMaturity - invested;
  const fdTax = Math.max(0, fdInterest) * (taxSlabPct / 100);
  const fdPostTax = fdMaturity - fdTax;

  return {
    ppf: { maturity: Math.round(ppfMaturity), invested: Math.round(ppfInvested), interest: Math.round(ppfMaturity - ppfInvested), monthlyUsed: ppfMonthly, capped: monthly > 12500, rate: 7.1 },
    epf: { maturity: Math.round(epfMaturity), invested: Math.round(epfInvested), interest: Math.round(epfMaturity - epfInvested), monthlyUsed: epfMonthly, rate: 8.25 },
    nps: { maturity: Math.round(npsMaturity), lumpsum: Math.round(npsLumpsum), annuityCorpus: Math.round(npsAnnuityCorpus), invested: Math.round(invested), interest: Math.round(npsMaturity - invested), rate: 10 },
    fd: { maturity: Math.round(fdMaturity), postTax: Math.round(fdPostTax), invested: Math.round(invested), interest: Math.round(fdInterest), tax: Math.round(fdTax), rate: 7 },
    invested: Math.round(invested),
  };
}

// ── Old vs New Tax Regime Comparison ───────────────────
/** India old-tax-regime slabs (FY 2024-25, incl. Sec 87A rebate at ₹5L + 4% cess) on annual taxable income. */
function indiaOldRegimeTax(annualTaxable: number): number {
  const t = Math.max(0, annualTaxable);
  if (t <= 500000) return 0; // Sec 87A rebate — nil tax up to ₹5L taxable (old regime threshold, lower than new regime's ₹7L)
  const brackets: [number, number, number][] = [[0,250000,0],[250000,500000,5],[500000,1000000,20],[1000000,Infinity,30]];
  let tax = 0;
  for (const [lo, hi, rate] of brackets) {
    if (t <= lo) break;
    tax += Math.min(t - lo, hi - lo) * rate / 100;
  }
  return Math.round(tax * 1.04);
}

export function calcTaxRegimeCompare(grossIncome: number, deductions80C: number, hraExemption: number, otherDeductions: number) {
  const gross = Math.max(0, grossIncome);
  const stdDeductionOld = 50000;
  const stdDeductionNew = 75000;
  const cap80C = Math.min(Math.max(0, deductions80C), 150000);

  // Old regime allows 80C (capped), HRA exemption and other itemised deductions on top of its
  // own standard deduction — the new regime allows none of these, only its (larger) standard deduction.
  const oldTaxable = Math.max(0, gross - stdDeductionOld - cap80C - Math.max(0, hraExemption) - Math.max(0, otherDeductions));
  const newTaxable = Math.max(0, gross - stdDeductionNew);

  const oldTax = indiaOldRegimeTax(oldTaxable);
  const newTax = indiaNewRegimeTax(newTaxable);
  const better: 'old' | 'new' = oldTax <= newTax ? 'old' : 'new';

  return {
    old: { taxable: Math.round(oldTaxable), tax: oldTax, inHand: Math.round(gross - oldTax), deductionsUsed: Math.round(stdDeductionOld + cap80C + Math.max(0, hraExemption) + Math.max(0, otherDeductions)) },
    new: { taxable: Math.round(newTaxable), tax: newTax, inHand: Math.round(gross - newTax), deductionsUsed: stdDeductionNew },
    better,
    savings: Math.abs(oldTax - newTax),
    breakEvenDeductions: Math.round(cap80C + Math.max(0, hraExemption) + Math.max(0, otherDeductions)),
  };
}
