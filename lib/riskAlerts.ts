/**
 * lib/riskAlerts.ts — real exposure alerts derived from the user's own body/finance inputs.
 *
 * Every ₹ figure here is either computed directly from the user's own numbers
 * (emergency-fund gap, debt-to-income) or explicitly labeled as an industry
 * estimate (hospitalization cost) rather than presented as personalized — no
 * fudge multipliers, no numbers dressed up as more precise than they are.
 */

import type { BodyInputs, FinanceInputs } from './wellfilab-score';
import { fmtINR } from './roadmapActions';

export interface RiskAlert {
  icon: string;
  label: string;
  detail: string;
}

export function getRiskAlerts(body: BodyInputs | null, finance: FinanceInputs | null): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  if (finance) {
    if (!finance.hasEmergencyFund) {
      const need = Math.round(finance.monthlyExpenses * 3);
      alerts.push({
        icon: '🛡️', label: 'No emergency fund',
        detail: `A job loss or medical event would force borrowing — you'd need about ${fmtINR(need)} (3 months of your own expenses) to self-fund one instead.`,
      });
    }
    const debtToIncome = finance.totalDebt / ((finance.monthlyIncome * 12) || 1);
    if (debtToIncome > 2) {
      alerts.push({
        icon: '💳', label: 'High debt load',
        detail: `Your debt is ${debtToIncome.toFixed(1)}× your annual income (${fmtINR(finance.totalDebt)} total) — above 2× is where repayment typically starts crowding out savings.`,
      });
    }
    if (!finance.hasInsurance) {
      alerts.push({
        icon: '🏥', label: 'No health insurance',
        detail: 'An estimated ₹3–15L exposure per hospitalization in India without cover — an industry range, not calculated from your own numbers.',
      });
    }
    if (finance.hasLifeInsurance === false) {
      alerts.push({
        icon: '👪', label: 'No life insurance',
        detail: 'Anyone who depends on your income has no financial protection if something happens to you — a term plan is typically the cheapest way to close this gap.',
      });
    }
    if (finance.equityAllocationPct !== undefined && body) {
      const appropriateEquity = 100 - body.age;
      const diff = finance.equityAllocationPct - appropriateEquity;
      if (diff > 25) {
        alerts.push({
          icon: '📉', label: 'Equity allocation high for your age',
          detail: `${finance.equityAllocationPct}% in equity vs. a rule-of-thumb of ≈${appropriateEquity}% for your age — a market downturn closer to retirement leaves less time to recover.`,
        });
      }
    }
  }

  if (body) {
    if (body.stressLevel >= 8) {
      alerts.push({
        icon: '🧘', label: 'High stress level',
        detail: `You rated stress ${body.stressLevel}/10 — sustained levels this high are linked to elevated health risk and worse financial decision-making.`,
      });
    }
    if (body.sleepHours < 6) {
      alerts.push({
        icon: '😴', label: 'Chronic sleep deficit',
        detail: `${body.sleepHours}h/night is well below the 7–9h range — this compounds into health and cognitive risk over months, not just tiredness.`,
      });
    }
  }

  return alerts.slice(0, 4);
}
