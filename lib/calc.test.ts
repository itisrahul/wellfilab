import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  calcBodyFat, calcOvertime, calcAge, calcIdealWeight, calcSIP, calcCompound,
  calcDebtPayoff, calcTaxRegimeCompare,
} from './calc';

/**
 * Regression protection for the calculator formulas — every expected value
 * below is hand-computed from the actual (fixed) formula, not captured by
 * running the code and copying its output. These guard against the exact
 * class of bug a correctness audit found here: unit-mismatched coefficients,
 * wrong compounding convention, an off-by-one day borrow, and a tax cliff.
 */

afterEach(() => { vi.useRealTimers(); });

describe('calcBodyFat', () => {
  it('converts cm inputs to inches before applying the (inch-calibrated) US Navy formula — male', () => {
    // height 177.8cm = 70in, waist 86.36cm = 34in, neck 38.1cm = 15in
    // waistMinusNeck = 19in, h = 70in
    // pct = 86.01*log10(19) - 70.041*log10(70) + 36.76
    //     = 86.01*1.278754 - 70.041*1.845098 + 36.76 ≈ 109.985 - 129.233 + 36.76 ≈ 17.51
    const r = calcBodyFat(75, 177.8, 86.36, 38.1, 'male');
    expect(r.pct).toBeCloseTo(17.5, 1);
  });

  it('converts cm inputs to inches before applying the (inch-calibrated) US Navy formula — female', () => {
    // height 165cm = 64.96in, waist 80cm, hip 95cm, neck 33cm (cm throughout, converted inside)
    // waistHipMinusNeck = (80+95-33)/2.54 = 55.906in, h = 64.961in
    // pct = 163.205*log10(55.906) - 97.684*log10(64.961) - 78.387
    //     ≈ 285.195 - 177.073 - 78.387 ≈ 29.7
    const r = calcBodyFat(60, 165, 80, 33, 'female', 95);
    expect(r.pct).toBeCloseTo(29.7, 1);
  });
});

describe('calcOvertime', () => {
  it('computes annualEquivalent from the real weekly pay regardless of the monthly display toggle', () => {
    // regularHours/overtimeHours are always weekly inputs; totalPay is
    // always a weekly figure before the period multiplier is applied.
    // regularPay = 500*40 = 20000, overtimePay = 500*1.5*10 = 7500, totalPay = 27500
    // annualEquivalent must be totalPay*52 regardless of period, never *12
    // (that was the bug — it undercounted a monthly view by ~4.33x).
    const r = calcOvertime(500, 40, 10, 1.5, 'monthly');
    expect(r.annualEquivalent).toBe(1430000);
    const weekly = calcOvertime(500, 40, 10, 1.5, 'weekly');
    expect(weekly.annualEquivalent).toBe(1430000);
  });
});

describe('calcAge', () => {
  it('never returns a negative day count when the borrowed month is too short — single borrow case', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 2, 1)); // Mar 1, 2000
    // dob Jan 31, 2000: naive d = 1-31 = -30; borrowing from Feb (leap,
    // 29 days) alone gives -30+29 = -1, still negative without the fix's
    // repeated-borrow loop.
    const r = calcAge(new Date(2000, 0, 31));
    expect(r.d).toBeGreaterThanOrEqual(0);
    expect(r.mo).toBeGreaterThanOrEqual(0);
  });

  it('never returns a negative day count in a non-leap year (needs two borrows)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2001, 2, 1)); // Mar 1, 2001 (non-leap)
    const r = calcAge(new Date(2001, 0, 31));
    expect(r.d).toBeGreaterThanOrEqual(0);
    expect(r.mo).toBeGreaterThanOrEqual(0);
  });
});

describe('calcIdealWeight', () => {
  it('does not flatten every height under 152.4cm to the same output', () => {
    // over(140cm) = 140/2.54 - 60 = -4.882 -> robinson = 52 + 1.9*(-4.882) = 42.7
    // over(152.4cm) = 0 -> robinson = 52.0
    const short = calcIdealWeight(140, 'male');
    const atThreshold = calcIdealWeight(152.4, 'male');
    expect(short.robinson).toBeCloseTo(42.7, 1);
    expect(atThreshold.robinson).toBeCloseTo(52.0, 1);
    expect(short.robinson).not.toBe(atThreshold.robinson);
  });

  it('still floors at a sane positive minimum for extreme inputs', () => {
    const r = calcIdealWeight(50, 'male');
    expect(r.robinson).toBeGreaterThanOrEqual(20);
  });
});

describe('calcSIP', () => {
  it('uses annuity-due compounding (contribution at the start of the month), matching the standard SIP convention', () => {
    // monthly=10000, r=12%/12=1%/mo, 12 months, no step-up/lump sum.
    // Annuity-due FV = 10000 * [(1.01^12 - 1)/0.01] * 1.01
    // 1.01^12 = 1.126825030... -> ordinary FV = 126825.03 -> due FV = 128093.28
    const r = calcSIP(10000, 12, 1, 0, 0);
    expect(r.maturity).toBe(128093);
    expect(r.invested).toBe(120000);
    expect(r.gain).toBe(8093);
  });
});

describe('calcCompound', () => {
  it('applies the same annuity-due convention as calcSIP for monthly compounding', () => {
    const r = calcCompound(0, 12, 1, 12, 10000, 0, 0);
    expect(r.final).toBe(128093);
    expect(r.invested).toBe(120000);
  });
});

describe('calcDebtPayoff', () => {
  it('redirects a paid-off debt\'s minimum payment into the next target debt', () => {
    // Two 0%-interest debts: A=1000 (minPayment 1000, paid off month 1),
    // B=5000 (minPayment 100). extraMonthly=0.
    // Month 1: A -> 0 (its own minPayment). B: 5000-100=4900, then redirect
    //   A's freed 1000 -> B: 4900-1000=3900.
    // Month 2: B: 3900-100=3800, -1000 (A still freed) = 2800.
    // Month 3: 2800-100=2700, -1000=1700.
    // Month 4: 1700-100=1600, -1000=600.
    // Month 5: 600-100=500, -1000 clamps to 0. Done.
    // Without the redirect, B would only fall by 100/month and take ~50 months.
    const r = calcDebtPayoff(
      [
        { name: 'A', balance: 1000, rate: 0, minPayment: 1000 },
        { name: 'B', balance: 5000, rate: 0, minPayment: 100 },
      ],
      0
    );
    expect(r.avalanche.months).toBe(5);
    expect(r.avalanche.totalInterest).toBe(0);
  });
});

describe('calcTaxRegimeCompare (new-regime Section 87A marginal relief)', () => {
  it('caps tax at (taxable - 700000) just above the rebate threshold instead of a full-bracket tax cliff', () => {
    // gross=775100, no other deductions -> newTaxable = 775100 - 75000(std deduction) = 700100
    // Full bracket tax would be ~20010 (5% slab); marginal relief caps it
    // at 700100-700000=100, so tax (with 4% cess) = round(100*1.04) = 104.
    const r = calcTaxRegimeCompare(775100, 0, 0, 0);
    expect(r.new.taxable).toBe(700100);
    expect(r.new.tax).toBe(104);
  });

  it('charges nil tax exactly at the ₹7L threshold', () => {
    const r = calcTaxRegimeCompare(775000, 0, 0, 0); // newTaxable = 700000
    expect(r.new.tax).toBe(0);
  });
});
