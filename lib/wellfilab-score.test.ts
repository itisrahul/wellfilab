import { describe, it, expect } from 'vitest';
import {
  calculateFullScore, calculateQuickScore, scoreColor, scoreLabel, netWorthVerdict,
  type QuickInputs, type BodyInputs, type FinanceInputs,
} from './wellfilab-score';

/**
 * Regression protection for the scoring algorithm — the core IP of the
 * product. Every expected number below was hand-computed from the actual
 * formula in wellfilab-score.ts (not captured by running the code and
 * copying its output), so these catch a real behavior change, not just
 * "the output changed" — see the worked arithmetic in each test's comment.
 * If a legitimate formula change makes one of these fail, recompute the
 * expected value by hand from the new formula before updating the
 * assertion; don't just paste in whatever the new code happens to output.
 */

const dummyQuick: QuickInputs = { healthFeeling: 3, financeFeeling: 3, stressFeeling: 3 };

describe('calculateFullScore', () => {
  it('scores a genuinely excellent profile at 98 across every dimension', () => {
    // BMI = 70 / 1.75² = 22.86 → between 18.5 and 25 → bmiDelta = 0
    // sleep 7.5h = optimal → sleepGap = 0 → no penalty
    // exercise 4 days = the threshold → no penalty
    // dietQuality 5/5 → no penalty
    // waterLiters 2.5 ≥ (70*0.033)*0.8 = 1.848 → no penalty
    // age 30 ≤ 40 → no penalty
    // => bodyScore = 100, clamped to 98
    const body: BodyInputs = { age: 30, weight: 70, height: 175, sleepHours: 7.5, exerciseDays: 4, stressLevel: 1, dietQuality: 5, waterLiters: 2.5 };
    // stressLevel 1 → no penalty; sleep 7.5h → no penalty; no debt → no penalty
    // => mindScore = 100, clamped to 98
    // savingsRate = (100000-60000)/100000 = 0.4 ≥ 0.3 → no penalty
    // emergencyFund + insurance both true → no penalty
    // investRate = 25000/100000 = 0.25 ≥ 0.2 → no penalty
    // no debt → no penalty
    // => wealthScore = 100, clamped to 98
    const finance: FinanceInputs = {
      monthlyIncome: 100000, monthlyExpenses: 60000, totalSavings: 500000, totalDebt: 0,
      monthlyInvestments: 25000, hasEmergencyFund: true, hasInsurance: true,
    };

    const result = calculateFullScore(dummyQuick, body, finance, []);

    expect(result.body).toBe(98);
    expect(result.mind).toBe(98);
    expect(result.wealth).toBe(98);
    // life = round(98*.3 + 98*.3 + 98*.3 + (100 - 0)*.1) = round(98.2) = 98
    expect(result.life).toBe(98);
    // overall = round(98*.28*3 + 98*.16) = round(98) = 98
    expect(result.overall).toBe(98);
    expect(result.level).toBe('full');
  });

  it('scores a genuinely poor profile correctly, including the debt/mind link', () => {
    // BMI = 100 / 1.70² = 34.6 → >30 → bmiDelta = -20
    // sleep 5h → sleepGap = 2.5 → sleepBodyDelta = -20
    // exercise 0 days → exerciseDelta = -20
    // dietQuality 1/5 → dietDelta = -16
    // waterLiters 1 < (100*0.033)*0.8 = 2.64 → waterDelta = -5
    // age 50 → ageDelta = -min((50-40)*0.3, 8) = -3
    // => bodyScore = 100 -20-20-20-16-5-3 = 16
    const body: BodyInputs = { age: 50, weight: 100, height: 170, sleepHours: 5, exerciseDays: 0, stressLevel: 10, dietQuality: 1, waterLiters: 1 };
    // stressDelta = -((10-1)*7) = -63
    // sleep 5h < 6 → sleepMindDelta = -20
    // debtToIncome = 900000 / (50000*12) = 1.5 → >1, not >3 → debtMindDelta = -7
    // => mindScore = 100 -63-20-7 = 10 (floor)
    // savingsRate = (50000-55000)/50000 = -0.1 → below every positive band → savingsDelta = -40
    // no emergency fund → -20; no insurance → -10
    // investRate = 0 → investDelta = -25
    // debtToIncome 1.5 → not >2 → debtWealthDelta = 0
    // => wealthScore = 100 -40-20-10-25 = 5 → clamped to 10 (floor)
    const finance: FinanceInputs = {
      monthlyIncome: 50000, monthlyExpenses: 55000, totalSavings: 0, totalDebt: 900000,
      monthlyInvestments: 0, hasEmergencyFund: false, hasInsurance: false,
    };

    const result = calculateFullScore(dummyQuick, body, finance, []);

    expect(result.body).toBe(16);
    expect(result.mind).toBe(10);
    expect(result.wealth).toBe(10);
    // life = round(16*.3 + 10*.3 + 10*.3 + (100 - max(|16-10|,|10-10|,|16-10|))*.1)
    //      = round(4.8+3+3 + (100-6)*.1) = round(10.8 + 9.4) = round(20.2) = 20
    expect(result.life).toBe(20);
    // overall = round(16*.28 + 10*.28 + 10*.28 + 20*.16) = round(4.48+2.8+2.8+3.2) = round(13.28) = 13
    expect(result.overall).toBe(13);
  });

  it('never lets any pillar fall below the 10-point floor even with extreme inputs', () => {
    const body: BodyInputs = { age: 90, weight: 200, height: 150, sleepHours: 3, exerciseDays: 0, stressLevel: 10, dietQuality: 1, waterLiters: 0.5 };
    const finance: FinanceInputs = {
      monthlyIncome: 10000, monthlyExpenses: 50000, totalSavings: 0, totalDebt: 5000000,
      monthlyInvestments: 0, hasEmergencyFund: false, hasInsurance: false,
    };
    const result = calculateFullScore(dummyQuick, body, finance, []);
    expect(result.body).toBeGreaterThanOrEqual(10);
    expect(result.mind).toBeGreaterThanOrEqual(10);
    expect(result.wealth).toBeGreaterThanOrEqual(10);
  });
});

describe('calculateQuickScore', () => {
  it('maps the top self-rating on every axis to 95, not 100', () => {
    // healthBase = 4*22 = 88 → body = min(95, 88+10) = min(95,98) = 95 (capped)
    // financeBase = 88 → wealth = 95 (capped)
    // mindBase = 4*25 = 100 → mind = min(95, 100+5) = 95 (capped)
    // life = round((95+95+95)/3) = 95
    // overall = round(95*.3*3 + 95*.1) = round(85.5+9.5) = 95
    const inputs: QuickInputs = { healthFeeling: 4, financeFeeling: 4, stressFeeling: 4 };
    const result = calculateQuickScore(inputs, []);
    expect(result.body).toBe(95);
    expect(result.wealth).toBe(95);
    expect(result.mind).toBe(95);
    expect(result.life).toBe(95);
    expect(result.overall).toBe(95);
    expect(result.level).toBe('quick');
  });

  it('scales the bottom self-rating consistently (no fudge factor)', () => {
    // healthBase = 1*22 = 22 → body = min(95, 22+10) = 32
    // financeBase = 22 → wealth = 32
    // mindBase = 1*25 = 25 → mind = min(95, 25+5) = 30
    const inputs: QuickInputs = { healthFeeling: 1, financeFeeling: 1, stressFeeling: 1 };
    const result = calculateQuickScore(inputs, []);
    expect(result.body).toBe(32);
    expect(result.wealth).toBe(32);
    expect(result.mind).toBe(30);
  });
});

describe('scoreColor', () => {
  it('follows the documented 80/60/40 bands', () => {
    expect(scoreColor(80)).toBe('#10b981');
    expect(scoreColor(79)).toBe('#0d9488');
    expect(scoreColor(60)).toBe('#0d9488');
    expect(scoreColor(59)).toBe('#f59e0b');
    expect(scoreColor(40)).toBe('#f59e0b');
    expect(scoreColor(39)).toBe('#ef4444');
  });
});

describe('scoreLabel', () => {
  it('follows the documented 80/60/40/20 bands', () => {
    expect(scoreLabel(80)).toBe('Excellent');
    expect(scoreLabel(60)).toBe('Good');
    expect(scoreLabel(40)).toBe('Average');
    expect(scoreLabel(20)).toBe('Needs Work');
    expect(scoreLabel(19)).toBe('Critical');
  });
});

describe('netWorthVerdict', () => {
  it('rates net worth relative to the age-adjusted benchmark band, not an absolute number', () => {
    // A 30-year-old's benchmark band is ₹6,00,000 (see NET_WORTH_BENCHMARK_BANDS)
    expect(netWorthVerdict(30, 1_800_000).label).toBe('Excellent'); // 3x band
    expect(netWorthVerdict(30, 900_000).label).toBe('Good');        // 1.5x band
    expect(netWorthVerdict(30, 600_000).label).toBe('Average');     // 1x band
    expect(netWorthVerdict(30, 180_000).label).toBe('Below average'); // 0.3x band
    expect(netWorthVerdict(30, 60_000).label).toBe('Needs attention'); // 0.1x band
  });
});
