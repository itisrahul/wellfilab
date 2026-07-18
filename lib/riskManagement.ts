/**
 * lib/riskManagement.ts — a personalized, age- and risk-tolerance-adjusted plan.
 *
 * This is the "what should actually change based on your age and risk"
 * layer the score's risk-allocation ScoreFactor only hints at with a single
 * point delta. Every number here is either the user's own input or a
 * clearly-labeled indicative band (insurance coverage targets) — never a
 * personalized-sounding figure we didn't actually compute from real data.
 */

export interface RiskManagementPlan {
  age: number;
  recommendedEquityPct: number;
  recommendedDebtCashPct: number;
  currentEquityPct?: number;
  equityVerdict: 'Appropriate' | 'High for your age' | 'Conservative for your horizon' | 'Not yet answered';
  netWorthVerdict?: { label: string; ratio: number };
  emergencyFundMonths: number;
  emergencyFundTarget?: number;
  lifeInsuranceTarget?: number;
  healthInsuranceTarget: number;
  actions: string[];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Classic (100 − age) heuristic, adjusted by self-reported risk tolerance —
 * a "would sell in a downturn" answer pulls the recommendation more
 * conservative than age alone would suggest, since a portfolio that gets
 * panic-sold in a crash locks in losses regardless of how much time is
 * technically left to recover. Floored/capped so the number is never
 * absurd at either end of the age range. */
function recommendedEquityPct(age: number, riskTolerance?: 'sell' | 'hold' | 'buy-more'): number {
  const base = clamp(100 - age, 20, 90);
  if (riskTolerance === 'sell') return clamp(base - 15, 20, 90);
  if (riskTolerance === 'buy-more') return clamp(base + 10, 20, 90);
  return base;
}

/** Indicative bands, not personalized underwriting — healthcare costs and
 * claim likelihood both rise with age, so the target coverage does too. */
function healthInsuranceTargetFor(age: number): number {
  if (age < 30) return 500000;
  if (age < 45) return 1000000;
  if (age < 60) return 1500000;
  return 2500000;
}

export function buildRiskManagementPlan(params: {
  age: number;
  netWorth?: number | null;
  netWorthVerdictLabel?: { label: string; ratio: number } | null;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  equityAllocationPct?: number;
  riskTolerance?: 'sell' | 'hold' | 'buy-more';
  hasEmergencyFund?: boolean;
  hasInsurance?: boolean;
  hasLifeInsurance?: boolean;
}): RiskManagementPlan {
  const { age, monthlyIncome, monthlyExpenses, equityAllocationPct, riskTolerance,
    hasEmergencyFund, hasInsurance, hasLifeInsurance } = params;

  const target = recommendedEquityPct(age, riskTolerance);

  let equityVerdict: RiskManagementPlan['equityVerdict'] = 'Not yet answered';
  if (equityAllocationPct !== undefined) {
    const diff = equityAllocationPct - target;
    equityVerdict = diff > 15 ? 'High for your age' : diff < -20 ? 'Conservative for your horizon' : 'Appropriate';
  }

  // Closer to retirement means less runway to recover from a shock, so the
  // buffer target grows — same logic already used for the equity heuristic,
  // applied to cash reserves instead of the market.
  const emergencyFundMonths = age >= 45 ? 6 : 3;
  const emergencyFundTarget = monthlyExpenses ? Math.round(monthlyExpenses * emergencyFundMonths) : undefined;
  const lifeInsuranceTarget = monthlyIncome ? Math.round(monthlyIncome * 12 * 10) : undefined;
  const healthInsuranceTarget = healthInsuranceTargetFor(age);

  const actions: string[] = [];
  if (equityVerdict === 'High for your age') {
    actions.push(`Shift roughly ${equityAllocationPct! - target} percentage points from equity to debt/fixed income — ${target}% equity is closer to appropriate for your age.`);
  } else if (equityVerdict === 'Conservative for your horizon') {
    actions.push(`You have time on your side — moving toward ${target}% equity (from ${equityAllocationPct}%) likely captures more long-term growth without adding much real risk.`);
  } else if (equityVerdict === 'Not yet answered') {
    actions.push(`Add your current asset allocation to your score for a specific verdict — the rule-of-thumb target for your age is ${target}% equity.`);
  }
  if (hasEmergencyFund === false) {
    actions.push(emergencyFundTarget
      ? `Build a ${fmtINRLocal(emergencyFundTarget)} emergency fund (${emergencyFundMonths} months of expenses) before increasing investment risk.`
      : `Build a ${emergencyFundMonths}-month emergency fund before increasing investment risk.`);
  }
  if (hasInsurance === false) {
    actions.push(`Get health insurance — ${fmtINRLocal(healthInsuranceTarget)} is a reasonable starting cover for your age band.`);
  }
  if (hasLifeInsurance === false) {
    actions.push(lifeInsuranceTarget
      ? `If anyone depends on your income, a term life policy around ${fmtINRLocal(lifeInsuranceTarget)} (≈10× annual income) is the standard target.`
      : `If anyone depends on your income, a term life policy sized at roughly 10× your annual income is the standard target.`);
  }

  return {
    age, recommendedEquityPct: target, recommendedDebtCashPct: 100 - target,
    currentEquityPct: equityAllocationPct, equityVerdict,
    netWorthVerdict: params.netWorthVerdictLabel ?? undefined,
    emergencyFundMonths, emergencyFundTarget, lifeInsuranceTarget, healthInsuranceTarget,
    actions,
  };
}

// Local formatter — see lib/wellfilab-score.ts's fmtLakhCr for why this file
// doesn't import fmtINR from lib/roadmapActions.ts (avoids a circular import
// back through the file that already imports types from wellfilab-score.ts).
function fmtINRLocal(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
