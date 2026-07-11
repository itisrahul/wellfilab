/**
 * lib/lifeROI.ts — Life ROI algorithm.
 *
 * Framework-agnostic (no React, no Next.js APIs), same pattern as
 * app/score/scoring.ts and app/score/trendTracking.ts: rule-based scoring
 * from a handful of self-reported inputs, not a live ML/LLM call. "AI
 * recommendations" downstream means "personalised from your own numbers,"
 * consistent with how the rest of the site already frames the Score quiz.
 */

export interface LifeROIInputs {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  sleepHours: number;
  exerciseDaysPerWeek: number;
  /** 1 (very low) – 5 (very high) */
  stressLevel: number;
  smokes: boolean;
  drinksRegularly: boolean;
}

export interface LifeROIInsight {
  emoji: string;
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'connection';
  /** ₹/year, when the insight has a quantifiable financial angle */
  financialValue?: number;
}

export interface LifeROIAction {
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
  /** ₹/year potential saving or gain */
  financialImpact?: number;
  healthImpact?: string;
  timeToResult?: string;
  toolLink?: { label: string; url: string };
}

export interface LifeROIProjection {
  label: string;
  netWorthDelta: number;
  healthScoreDelta: number;
}

export interface LifeROIResult {
  healthScore: number;
  financeScore: number;
  lifeROIScore: number;
  insights: LifeROIInsight[];
  topActions: LifeROIAction[];
  projections: LifeROIProjection[];
  lifeImpact: string;
  /** ₹/year — estimated cost of current health habits in lost productivity + likely extra medical spend */
  healthCostOfMoney: number;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

function computeHealthScore(i: LifeROIInputs): number {
  const sleepScore    = i.sleepHours >= 7 && i.sleepHours <= 9 ? 100 : Math.max(0, 100 - Math.abs(8 - i.sleepHours) * 18);
  const exerciseScore = Math.min(100, i.exerciseDaysPerWeek * 20);
  const stressScore   = (5 - i.stressLevel) * 25;
  const habitsPenalty = (i.smokes ? 25 : 0) + (i.drinksRegularly ? 12 : 0);
  return clamp(sleepScore * 0.35 + exerciseScore * 0.35 + stressScore * 0.3 - habitsPenalty);
}

function computeFinanceScore(i: LifeROIInputs): number {
  const income = Math.max(1, i.monthlyIncome);
  const savingsRate = i.monthlySavings / income;
  const expenseRatio = i.monthlyExpenses / income;
  const savingsScore = clamp(savingsRate * 333); // 30%+ savings rate → 100
  const expenseScore = clamp(100 - Math.max(0, expenseRatio - 0.5) * 200); // spending over 50% of income starts costing points
  return clamp(savingsScore * 0.65 + expenseScore * 0.35);
}

export function calculateLifeROI(inputs: LifeROIInputs): LifeROIResult {
  const healthScore  = computeHealthScore(inputs);
  const financeScore = computeFinanceScore(inputs);
  const gap          = Math.abs(healthScore - financeScore);
  const lifeROIScore = clamp((healthScore + financeScore) / 2 - gap * 0.15);

  const monthlySurplus = inputs.monthlyIncome - inputs.monthlyExpenses;
  const savingsRate    = monthlySurplus / Math.max(1, inputs.monthlyIncome);

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights: LifeROIInsight[] = [];

  if (inputs.sleepHours < 6.5) {
    insights.push({
      emoji: '😴', type: 'warning',
      title: 'Sleep debt is costing you more than energy',
      description: `Averaging ${inputs.sleepHours}h of sleep measurably cuts decision quality and focus — the kind of thing that shows up as missed deadlines and worse financial decisions, not just tiredness.`,
      financialValue: 120000,
    });
  } else if (inputs.sleepHours >= 7 && inputs.sleepHours <= 9) {
    insights.push({
      emoji: '🌙', type: 'achievement',
      title: 'Your sleep is in the optimal range',
      description: `${inputs.sleepHours}h nightly puts you in the range linked to the best long-term health and cognitive outcomes. This is a real asset — protect it.`,
    });
  }

  if (savingsRate < 0.1) {
    insights.push({
      emoji: '💸', type: 'warning',
      title: 'Your savings rate leaves little room for shocks',
      description: `You're saving roughly ${Math.round(savingsRate * 100)}% of income. A single unplanned medical or job-loss event at this rate can undo years of progress fast.`,
      financialValue: Math.max(0, inputs.monthlyIncome * 0.2 - monthlySurplus) * 12,
    });
  } else if (savingsRate >= 0.25) {
    insights.push({
      emoji: '📈', type: 'achievement',
      title: 'A strong savings rate compounds fast',
      description: `At a ${Math.round(savingsRate * 100)}% savings rate, consistent SIP investing over a decade can meaningfully outpace most salary growth alone.`,
    });
  }

  if (inputs.smokes || inputs.drinksRegularly) {
    insights.push({
      emoji: '🚭', type: 'connection',
      title: 'Habits here have a direct line to your finances',
      description: 'Smoking and regular drinking carry a compounding cost — the direct spend, plus the long-run effect on insurance premiums and medical bills.',
      financialValue: (inputs.smokes ? 60000 : 0) + (inputs.drinksRegularly ? 36000 : 0),
    });
  }

  if (inputs.exerciseDaysPerWeek >= 4) {
    insights.push({
      emoji: '💪', type: 'achievement',
      title: 'Consistent exercise is doing real financial work',
      description: `${inputs.exerciseDaysPerWeek} active days a week is linked to materially lower long-run healthcare costs and higher sustained energy for work.`,
    });
  }

  if (gap > 25) {
    insights.push({
      emoji: '⚖️', type: 'opportunity',
      title: healthScore > financeScore ? 'Your health is ahead of your finances' : 'Your finances are ahead of your health',
      description: healthScore > financeScore
        ? 'Good health habits are in place — now direct that same discipline toward a savings or investing routine.'
        : 'Strong financial habits are in place — without health to enjoy it, that progress buys less than it should.',
    });
  }

  if (insights.length < 3) {
    insights.push({
      emoji: '🎯', type: 'opportunity',
      title: 'Small, consistent changes compound the most',
      description: 'The biggest gains rarely come from one big change — they come from small habits repeated for months. Pick one action below and stay with it.',
    });
  }

  // ── Top actions ───────────────────────────────────────────────────────────
  const candidates: LifeROIAction[] = [];

  if (inputs.sleepHours < 7) {
    candidates.push({
      title: 'Fix your sleep schedule first',
      description: 'Sleep debt undermines both willpower and decision-making, which quietly wrecks diet, exercise, and spending discipline all at once.',
      priority: inputs.sleepHours < 6 ? 'Critical' : 'High',
      healthImpact: 'Better focus, mood, and appetite regulation within days',
      timeToResult: '1-2 weeks',
      toolLink: { label: 'Sleep Calculator', url: '/tools/health/sleep' },
    });
  }

  if (savingsRate < 0.15) {
    candidates.push({
      title: 'Automate a savings rate increase',
      description: 'Set up an automatic monthly SIP before you see the money in your account — the single highest-leverage change for most people\'s finances.',
      priority: savingsRate < 0.05 ? 'Critical' : 'High',
      financialImpact: Math.round(inputs.monthlyIncome * 0.1 * 12),
      timeToResult: 'Immediate, compounds over years',
      toolLink: { label: 'SIP Calculator', url: '/tools/finance/sip' },
    });
  }

  if (inputs.exerciseDaysPerWeek < 3) {
    candidates.push({
      title: 'Get to 3 exercise sessions a week',
      description: 'Even brisk walking 3x/week measurably lowers long-run medical costs and improves energy for work — the biggest jump is from 0 to 3 sessions.',
      priority: inputs.exerciseDaysPerWeek === 0 ? 'High' : 'Medium',
      healthImpact: 'Lower resting heart rate and better sleep within a month',
      timeToResult: '3-4 weeks',
      toolLink: { label: 'Calorie Calculator', url: '/tools/health/calories' },
    });
  }

  if (inputs.stressLevel >= 4) {
    candidates.push({
      title: 'Address the stress, not just its symptoms',
      description: 'High sustained stress raises cortisol, which independently worsens sleep, appetite, and impulse spending — treating it directly has knock-on benefits everywhere.',
      priority: 'High',
      healthImpact: 'Lower anxiety and better sleep quality',
      timeToResult: '2-6 weeks',
    });
  }

  if (inputs.monthlyExpenses / Math.max(1, inputs.monthlyIncome) > 0.7) {
    candidates.push({
      title: 'Run a real budget audit',
      description: 'Spending over 70% of income leaves very little margin. A structured 50/30/20-style review usually finds 10-15% in avoidable spend within a week.',
      priority: 'Medium',
      financialImpact: Math.round(inputs.monthlyExpenses * 0.12 * 12),
      timeToResult: '1 week',
      toolLink: { label: 'Budget Calculator', url: '/tools/finance/budget' },
    });
  }

  candidates.push({
    title: 'Build a 3-month emergency fund',
    description: 'Before optimising returns, make sure a sudden job loss or medical bill can\'t force you into debt — this is what actually protects the rest of your plan.',
    priority: 'Medium',
    timeToResult: '3-6 months to fully fund',
    toolLink: { label: 'Retirement Calculator', url: '/tools/finance/retirement' },
  });

  const priorityRank: Record<LifeROIAction['priority'], number> = { Critical: 0, High: 1, Medium: 2 };
  const topActions = candidates.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 5);

  // ── Projections — reuse the standard compound-growth formula on the current monthly surplus ──
  const monthlyRate = 0.12 / 12;
  const fv = (months: number) => {
    if (monthlySurplus <= 0) return 0;
    return Math.round(monthlySurplus * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  };
  const projections: LifeROIProjection[] = [
    { label: '1 year',  netWorthDelta: fv(12),  healthScoreDelta: clamp(healthScore + 5) - healthScore },
    { label: '5 years', netWorthDelta: fv(60),  healthScoreDelta: clamp(healthScore + 15) - healthScore },
    { label: '10 years',netWorthDelta: fv(120), healthScoreDelta: clamp(healthScore + 20) - healthScore },
  ];

  // ── Health cost of money — rough annualised estimate from the weakest habits ──
  const healthCostOfMoney = Math.round(
    (inputs.sleepHours < 7 ? 45000 : 0) +
    (inputs.exerciseDaysPerWeek < 3 ? 30000 : 0) +
    (inputs.stressLevel >= 4 ? 25000 : 0) +
    (inputs.smokes ? 60000 : 0) +
    (inputs.drinksRegularly ? 36000 : 0)
  );

  const lifeImpact = lifeROIScore >= 70
    ? 'At your current habits, you\'re compounding both health and wealth in the right direction — the priority now is consistency, not big changes.'
    : lifeROIScore >= 45
    ? 'You\'re on a workable path, but a couple of specific changes below would meaningfully accelerate both your health and your net worth.'
    : 'Small, consistent changes to the actions below can shift your trajectory significantly within a single quarter — start with the Critical one.';

  return { healthScore, financeScore, lifeROIScore, insights: insights.slice(0, 5), topActions, projections, lifeImpact, healthCostOfMoney };
}
