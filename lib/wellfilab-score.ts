/**
 * lib/wellfilab-score.ts — the WellFiLab Score algorithm.
 *
 * Framework-agnostic (no React, no Next.js APIs), same pattern as the rest
 * of this codebase's scoring logic: rule-based, computed entirely from the
 * user's own numbers, no network calls. Progressive by design — a 3-question
 * "quick" score works standalone; body + finance data upgrades it to a
 * "full" score with real rupee figures and trajectories, without ever
 * requiring the deeper data to get a result.
 */

// ── TYPES ──────────────────────────────────────────

export interface QuickInputs {
  healthFeeling: 1 | 2 | 3 | 4;    // 1=poor 2=ok 3=good 4=great
  financeFeeling: 1 | 2 | 3 | 4;   // 1=struggling 2=managing 3=stable 4=growing
  stressFeeling: 1 | 2 | 3 | 4;    // 1=very 2=somewhat 3=little 4=not at all
}

export interface BodyInputs {
  age: number;
  weight: number;        // kg
  height: number;        // cm
  sleepHours: number;    // 5-10
  exerciseDays: number;  // 0-7
  stressLevel: number;   // 1-10
  dietQuality: 1 | 2 | 3 | 4 | 5; // 1=poor 5=excellent
  waterLiters: number;   // 0.5-4
}

export interface FinanceInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  totalDebt: number;
  monthlyInvestments: number;
  hasEmergencyFund: boolean;
  hasInsurance: boolean;
}

export type ScoreLevel = 'quick' | 'body' | 'full';

export interface WellFiScore {
  overall: number;
  body: number;
  mind: number;
  wealth: number;
  life: number;
  level: ScoreLevel;

  archetype: Archetype;

  annualHealthCost?: number;
  lifetimeHealthCost?: number;

  dimensions: Dimension[];
  insights: Insight[];
  actions: Action[];
  trajectories?: Trajectory[];
  /** Itemized point-by-point breakdown behind body/mind/wealth — 'full' level only, since it needs real finance data. */
  scoreFactors?: ScoreFactor[];

  previousScore?: number;
  scoreChange?: number;
  streakDays: number;

  /** ISO timestamp — set when a score is saved to history, not by the calculate functions themselves. */
  date?: string;
  /** Client-generated UUID, set at save time — doubles as a future DB primary key so a backend migration doesn't need to invent IDs for already-stored records. */
  id?: string;
}

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  strength: string;
  challenge: string;
  color: string;
}

export interface Dimension {
  id: string;
  label: string;
  score: number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'same';
  insight?: string;
}

export interface Insight {
  type: 'connection' | 'opportunity' | 'warning' | 'strength';
  emoji: string;
  headline: string;
  detail: string;
  financialValue?: number;
}

export interface Action {
  rank: number;
  title: string;
  why: string;
  impact: string;
  howEasy: 'today' | 'this-week' | 'this-month';
  category: 'health' | 'finance' | 'mind' | 'both';
  toolSlug?: string;
  toolCat?: string;
}

/** One line item behind a score — captured at the exact point each deduction/bonus is
 * applied inside calculateFullScore, never reconstructed after the fact, so the "Why
 * this score?" table on the results page can never drift from the real arithmetic. */
export interface ScoreFactor {
  id: string;
  label: string;
  value: string;
  points: number;
  dimension: 'body' | 'mind' | 'wealth';
}

export interface Trajectory {
  scenario: 'current' | 'improved' | 'optimal';
  label: string;
  netWorthAt60: number;
  lifeQuality: number;
  lifeExpectancy: number;
  monthlyPassiveIncome: number;
  keyChange: string;
}

// ── 8 ARCHETYPES ──────────────────────────────────

const ARCHETYPES: Record<string, Archetype> = {
  optimizer: {
    id: 'optimizer',
    name: 'The Optimizer',
    emoji: '🎯',
    tagline: 'Both engines firing.',
    description: 'You have figured out what most people spend a lifetime trying to understand — that health and wealth build on each other. Your habits are compounding in your favour.',
    strength: 'You treat both your body and your bank account as investments.',
    challenge: 'Perfection can become its own stress. Make sure you are building a life, not just optimising one.',
    color: 'from-teal-500 to-emerald-500',
  },
  vitalist: {
    id: 'vitalist',
    name: 'The Vitalist',
    emoji: '🌿',
    tagline: 'Rich in health, growing in wealth.',
    description: 'Your body is in good shape. Your habits are healthy. But financial stress is quietly working against the health you have built. The irony: fixing your finances would directly improve your physical health.',
    strength: 'You understand that the body is the foundation. Most people learn this too late.',
    challenge: 'Financial anxiety raises cortisol. Your health score is carrying a hidden burden.',
    color: 'from-green-500 to-teal-500',
  },
  grinder: {
    id: 'grinder',
    name: 'The Grinder',
    emoji: '⚡',
    tagline: 'Winning financially, paying physically.',
    description: 'You have built real financial progress. But somewhere along the way your body became the collateral. The system you have built is not sustainable at this cost.',
    strength: 'You know how to execute. Apply that same discipline to your health and the results will compound.',
    challenge: 'High earners often discover too late that medical costs can erase financial gains.',
    color: 'from-amber-500 to-orange-500',
  },
  rebuilder: {
    id: 'rebuilder',
    name: 'The Rebuilder',
    emoji: '🔄',
    tagline: 'The best time to start was yesterday. Now is second best.',
    description: 'Both health and finances need attention. But here is what the data shows — people who improve from this position see the fastest gains. There is nowhere to go but up.',
    strength: 'Awareness is the first step. Most people are here and do not even know it.',
    challenge: 'Everything feels urgent. The key is to pick one thing and move it first.',
    color: 'from-purple-500 to-pink-500',
  },
  performer: {
    id: 'performer',
    name: 'The Performer',
    emoji: '💪',
    tagline: 'Strong body, tired mind.',
    description: 'Your physical health is genuinely impressive. But your mind is running on fumes. Stress, anxiety, or lack of purpose is creating a gap between how you look and how you feel.',
    strength: 'Physical discipline is transferable. The same habits that built your body can build mental resilience.',
    challenge: 'Your body is lying to you about how sustainable this is.',
    color: 'from-blue-500 to-teal-500',
  },
  thinker: {
    id: 'thinker',
    name: 'The Thinker',
    emoji: '🧠',
    tagline: 'Sharp mind, body catching up.',
    description: 'You think clearly, manage stress well, and have good mental habits. Your body has not caught up yet. The good news — your mental discipline makes physical change faster for you than most.',
    strength: 'You understand yourself. That self-awareness is a superpower most people lack.',
    challenge: 'Knowledge without action is just entertainment. Your body needs movement, not just ideas.',
    color: 'from-indigo-500 to-purple-500',
  },
  juggler: {
    id: 'juggler',
    name: 'The Juggler',
    emoji: '⚖️',
    tagline: 'Building and burning simultaneously.',
    description: 'You save but also carry significant debt. You invest but also overspend. You are running two financial systems that are working against each other. Breaking this cycle is one clear decision away.',
    strength: 'You are trying. The savings habit exists. Build on it.',
    challenge: 'Debt servicing is the invisible tax on everything you build.',
    color: 'from-yellow-500 to-amber-500',
  },
  steadyClimber: {
    id: 'steadyClimber',
    name: 'The Steady Climber',
    emoji: '📈',
    tagline: 'Consistent, balanced, underestimated.',
    description: 'You are not extreme in any direction. Everything is reasonably under control. This is actually rare — most people have major gaps in at least one area. Your task now is to go from good to great.',
    strength: 'Stability is the foundation that fast movers always end up wishing they had built.',
    challenge: 'Comfort can become complacency. Your next level requires intentional stretch.',
    color: 'from-teal-500 to-cyan-500',
  },
};

// ── ALGORITHM ──────────────────────────────────────

export function calculateQuickScore(
  inputs: QuickInputs,
  history: WellFiScore[]
): WellFiScore {
  const healthBase  = inputs.healthFeeling  * 22;
  const financeBase = inputs.financeFeeling * 22;
  // stressFeeling is already "higher = better" (1=very stressed … 4=not at all
  // stressed), same polarity as healthFeeling/financeFeeling — so it scales
  // the same way. (Previously inverted via `(5 - stressFeeling)`, which meant
  // answering "not at all stressed" produced a worse mind score than
  // answering "very stressed".)
  const mindBase    = inputs.stressFeeling * 25;

  const body    = Math.min(95, healthBase + 10);
  const wealth  = Math.min(95, financeBase + 10);
  const mind    = Math.min(95, mindBase + 5);
  const life    = Math.round((body + mind + wealth) / 3);
  const overall = Math.round((body * 0.3) + (mind * 0.3) + (wealth * 0.3) + (life * 0.1));

  const archetype = selectArchetype(body, mind, wealth, null);

  const dimensions: Dimension[] = [
    { id:'body',   label:'Body',   score:body,   icon:'💪', color:'text-teal-600',   insight:'Based on your self-rating' },
    { id:'mind',   label:'Mind',   score:mind,   icon:'🧠', color:'text-indigo-600', insight:'Based on your stress level' },
    { id:'wealth', label:'Wealth', score:wealth, icon:'💰', color:'text-amber-600',  insight:'Based on your self-rating' },
    { id:'life',   label:'Life',   score:life,   icon:'🌱', color:'text-green-600',  insight:'Combined balance score' },
  ];

  const insights = generateQuickInsights(body, mind, wealth);
  const actions  = generateQuickActions(body, mind, wealth);

  const previous     = history[0]?.overall;
  const scoreChange  = previous != null ? overall - previous : undefined;
  const streakDays   = calculateStreak(history);

  return {
    overall, body, mind, wealth, life,
    level: 'quick',
    archetype,
    dimensions,
    insights,
    actions,
    previousScore: previous,
    scoreChange,
    streakDays,
  };
}

/**
 * Body-only intermediate score — the type system's `level: 'body'` needs a
 * real calculation path between 'quick' and 'full', for when the user has
 * added body details but hasn't reached the finance step yet. Reuses the
 * exact body/mind formulas from calculateFullScore (finance-independent —
 * neither needs income or debt data). Wealth still comes from the Stage 1
 * self-rating since no real finance numbers exist yet. Rupee figures that
 * genuinely require income (health cost, SIP projections) stay illustrative
 * against a median-income assumption, clearly caveated, until the finance
 * step provides the user's real number.
 */
export function calculateBodyScore(
  quick: QuickInputs,
  body: BodyInputs,
  history: WellFiScore[]
): WellFiScore {
  const bmi = body.weight / Math.pow(body.height / 100, 2);

  let bodyScore = 100;
  if (bmi < 18.5 || bmi > 30) bodyScore -= 20;
  else if (bmi > 25)           bodyScore -= 10;
  const sleepGap = Math.max(0, 7.5 - body.sleepHours);
  bodyScore -= sleepGap * 8;
  bodyScore -= Math.max(0, (4 - body.exerciseDays) * 5);
  bodyScore -= (5 - body.dietQuality) * 4;
  const optimalWater = body.weight * 0.033;
  if (body.waterLiters < optimalWater * 0.8) bodyScore -= 5;
  if (body.age > 40) bodyScore -= Math.min((body.age - 40) * 0.3, 8);
  bodyScore = Math.max(10, Math.min(98, bodyScore));

  let mindScore = 100;
  mindScore -= (body.stressLevel - 1) * 7;
  if (body.sleepHours < 6) mindScore -= 20;
  else if (body.sleepHours < 7) mindScore -= 10;
  mindScore = Math.max(10, Math.min(98, mindScore));

  const wealthScore = Math.min(95, quick.financeFeeling * 22 + 10);

  const lifeScore = Math.round(
    (bodyScore * 0.3) + (mindScore * 0.3) + (wealthScore * 0.3) +
    (100 - Math.max(
      Math.abs(bodyScore - mindScore),
      Math.abs(mindScore - wealthScore),
      Math.abs(bodyScore - wealthScore)
    )) * 0.1
  );

  const overall = Math.round(
    (bodyScore * 0.28) + (mindScore * 0.28) + (wealthScore * 0.28) + (lifeScore * 0.16)
  );

  const archetype = selectArchetype(bodyScore, mindScore, wealthScore, null);

  // Illustrative only — no real income yet, so this uses a median-income
  // assumption purely to show the shape of the number. Becomes exact in
  // calculateFullScore once the finance step provides real income.
  const ASSUMED_ANNUAL_INCOME = 600000;
  const sleepCostEstimate = Math.round(sleepGap * 0.024 * ASSUMED_ANNUAL_INCOME);

  const dimensions: Dimension[] = [
    {
      id:'sleep', label:'Sleep', score:Math.round(Math.min(100, Math.max(0, 100 - sleepGap * 20))), icon:'😴',
      color:'text-indigo-600',
      insight: body.sleepHours >= 7.5 ? 'Optimal sleep' : `${(7.5 - body.sleepHours).toFixed(1)} hours below optimal`,
    },
    {
      id:'movement', label:'Movement', score:Math.round(Math.min(100, body.exerciseDays * 14 + 2)), icon:'🏃',
      color:'text-teal-600',
      insight: body.exerciseDays >= 4 ? 'Excellent activity' : `${4 - body.exerciseDays} more days/week recommended`,
    },
    {
      id:'stress', label:'Stress', score:Math.round(100 - body.stressLevel * 9), icon:'🧘',
      color:'text-purple-600',
      insight: body.stressLevel <= 4 ? 'Well managed' : `Level ${body.stressLevel}/10`,
    },
  ];

  const insights: Insight[] = [];
  if (body.sleepHours < 7 && sleepCostEstimate > 5000) {
    insights.push({
      type: 'connection', emoji: '😴',
      headline: `Sleeping ${body.sleepHours} hours has a real financial cost`,
      detail: `Roughly ₹${Math.round(sleepCostEstimate/1000)}K/year at a typical income — add yours in the next step for your exact number.`,
    });
  }
  if (body.exerciseDays >= 4) {
    insights.push({
      type: 'strength', emoji: '💪',
      headline: `${body.exerciseDays} workout days/week is a real financial asset`,
      detail: 'Regular exercise reduces annual medical costs by an average of ₹24,000. Add your finances to see your full picture.',
      financialValue: 24000,
    });
  }

  const actions = generateQuickActions(bodyScore, mindScore, wealthScore);

  const previous     = history[0]?.overall;
  const scoreChange  = previous != null ? overall - previous : undefined;
  const streakDays   = calculateStreak(history);

  return {
    overall, body: bodyScore, mind: mindScore, wealth: wealthScore, life: lifeScore,
    level: 'body',
    archetype,
    dimensions,
    insights: insights.slice(0, 2),
    actions,
    previousScore: previous,
    scoreChange,
    streakDays,
  };
}

export function calculateFullScore(
  _quick: QuickInputs,
  body: BodyInputs,
  finance: FinanceInputs,
  history: WellFiScore[]
): WellFiScore {
  const bmi = body.weight / Math.pow(body.height / 100, 2);
  const annualIncome = finance.monthlyIncome * 12;
  const factors: ScoreFactor[] = [];

  // ── Body Score (0-100) ──────────────────────────
  let bodyScore = 100;
  const bmiDelta = bmi < 18.5 || bmi > 30 ? -20 : bmi > 25 ? -10 : 0;
  bodyScore += bmiDelta;
  factors.push({ id: 'bmi', label: 'BMI', value: bmi.toFixed(1), points: bmiDelta, dimension: 'body' });

  const sleepGap = Math.max(0, 7.5 - body.sleepHours);
  const sleepBodyDelta = -(sleepGap * 8);
  bodyScore += sleepBodyDelta;
  factors.push({ id: 'sleep-body', label: 'Sleep', value: `${body.sleepHours} hours`, points: Math.round(sleepBodyDelta * 10) / 10, dimension: 'body' });

  const exerciseDelta = -Math.max(0, (4 - body.exerciseDays) * 5);
  bodyScore += exerciseDelta;
  factors.push({ id: 'exercise', label: 'Exercise', value: `${body.exerciseDays} days/week`, points: exerciseDelta, dimension: 'body' });

  const dietDelta = -((5 - body.dietQuality) * 4);
  bodyScore += dietDelta;
  factors.push({ id: 'diet', label: 'Diet quality', value: `${body.dietQuality}/5`, points: dietDelta, dimension: 'body' });

  const optimalWater = body.weight * 0.033;
  const waterDelta = body.waterLiters < optimalWater * 0.8 ? -5 : 0;
  bodyScore += waterDelta;
  factors.push({ id: 'water', label: 'Hydration', value: `${body.waterLiters}L/day`, points: waterDelta, dimension: 'body' });

  const ageDelta = body.age > 40 ? -Math.min((body.age - 40) * 0.3, 8) : 0;
  bodyScore += ageDelta;
  if (ageDelta !== 0) factors.push({ id: 'age', label: 'Age factor', value: `${body.age} years`, points: Math.round(ageDelta * 10) / 10, dimension: 'body' });

  bodyScore = Math.max(10, Math.min(98, bodyScore));

  // ── Mind Score (0-100) ──────────────────────────
  let mindScore = 100;
  const stressDelta = -((body.stressLevel - 1) * 7);
  mindScore += stressDelta;
  factors.push({ id: 'stress', label: 'Stress level', value: `${body.stressLevel}/10`, points: stressDelta, dimension: 'mind' });

  const sleepMindDelta = body.sleepHours < 6 ? -20 : body.sleepHours < 7 ? -10 : 0;
  mindScore += sleepMindDelta;
  factors.push({ id: 'sleep-mind', label: 'Sleep (mental impact)', value: `${body.sleepHours} hours`, points: sleepMindDelta, dimension: 'mind' });

  const debtToIncome = finance.totalDebt / (annualIncome || 1);
  const debtMindDelta = debtToIncome > 3 ? -15 : debtToIncome > 1 ? -7 : 0;
  mindScore += debtMindDelta;
  if (finance.totalDebt > 0) factors.push({ id: 'debt-mind', label: 'Debt (mental load)', value: `${debtToIncome.toFixed(1)}× income`, points: debtMindDelta, dimension: 'mind' });

  mindScore = Math.max(10, Math.min(98, mindScore));

  // ── Wealth Score (0-100) ────────────────────────
  let wealthScore = 100;
  const savingsRate = (finance.monthlyIncome - finance.monthlyExpenses) / (finance.monthlyIncome || 1);
  const savingsDelta = savingsRate >= 0.3 ? 0 : savingsRate >= 0.2 ? -10 : savingsRate >= 0.1 ? -20 : savingsRate >= 0 ? -30 : -40;
  wealthScore += savingsDelta;
  factors.push({ id: 'savings-rate', label: 'Savings rate', value: `${Math.round(savingsRate * 100)}%`, points: savingsDelta, dimension: 'wealth' });

  const emergencyDelta = finance.hasEmergencyFund ? 0 : -20;
  wealthScore += emergencyDelta;
  factors.push({ id: 'emergency-fund', label: 'Emergency fund', value: finance.hasEmergencyFund ? 'Yes' : 'No', points: emergencyDelta, dimension: 'wealth' });

  const insuranceDelta = finance.hasInsurance ? 0 : -10;
  wealthScore += insuranceDelta;
  factors.push({ id: 'insurance', label: 'Health insurance', value: finance.hasInsurance ? 'Yes' : 'No', points: insuranceDelta, dimension: 'wealth' });

  const investRate = finance.monthlyInvestments / (finance.monthlyIncome || 1);
  const investDelta = investRate >= 0.2 ? 0 : investRate >= 0.1 ? -10 : investRate > 0 ? -18 : -25;
  wealthScore += investDelta;
  factors.push({ id: 'investing', label: 'Investments', value: finance.monthlyInvestments > 0 ? `₹${finance.monthlyInvestments.toLocaleString('en-IN')}/month` : '₹0/month', points: investDelta, dimension: 'wealth' });

  const debtWealthDelta = debtToIncome > 5 ? -15 : debtToIncome > 2 ? -8 : 0;
  wealthScore += debtWealthDelta;
  if (finance.totalDebt > 0) factors.push({ id: 'debt-wealth', label: 'Debt (financial load)', value: `${debtToIncome.toFixed(1)}× income`, points: debtWealthDelta, dimension: 'wealth' });

  wealthScore = Math.max(10, Math.min(98, wealthScore));

  // ── Life Score ──────────────────────────────────
  const lifeScore = Math.round(
    (bodyScore * 0.3) + (mindScore * 0.3) + (wealthScore * 0.3) +
    (100 - Math.max(
      Math.abs(bodyScore - mindScore),
      Math.abs(mindScore - wealthScore),
      Math.abs(bodyScore - wealthScore)
    )) * 0.1
  );

  // ── Overall ─────────────────────────────────────
  const overall = Math.round(
    (bodyScore * 0.28) + (mindScore * 0.28) +
    (wealthScore * 0.28) + (lifeScore * 0.16)
  );

  // ── Financial health cost ────────────────────────
  const sleepCost     = Math.round(sleepGap * 0.024 * annualIncome);
  const stressCost    = Math.round(Math.max(0, (body.stressLevel - 5) / 5) * 0.18 * annualIncome);
  const bmiCost       = bmi > 30 ? 35000 : bmi > 25 ? 18000 : 0;
  const exerciseSave  = body.exerciseDays >= 3 ? 24000 : body.exerciseDays >= 1 ? 12000 : 0;
  const annualHealthCost = Math.max(0, sleepCost + stressCost + bmiCost - exerciseSave);
  const yearsWorking  = Math.max(10, 60 - body.age);
  const lifetimeHealthCost = annualHealthCost * yearsWorking;

  // ── Archetype ────────────────────────────────────
  const archetype = selectArchetype(bodyScore, mindScore, wealthScore, debtToIncome);

  // ── Dimensions ──────────────────────────────────
  const sleepScore    = Math.min(100, Math.max(0, 100 - sleepGap * 20));
  const exerciseScore = Math.min(100, body.exerciseDays * 14 + 2);
  const savingsScore  = Math.min(100, Math.max(0, savingsRate * 300));
  const investScore   = Math.min(100, Math.max(0, investRate * 500));
  const debtScore     = Math.min(100, Math.max(0, 100 - debtToIncome * 15));

  const dimensions: Dimension[] = [
    {
      id:'sleep', label:'Sleep', score:Math.round(sleepScore), icon:'😴',
      color:'text-indigo-600',
      insight: body.sleepHours >= 7.5 ? 'Optimal sleep' :
               `${(7.5 - body.sleepHours).toFixed(1)} hours below optimal`,
    },
    {
      id:'movement', label:'Movement', score:Math.round(exerciseScore), icon:'🏃',
      color:'text-teal-600',
      insight: body.exerciseDays >= 4 ? 'Excellent activity' :
               `${4 - body.exerciseDays} more days/week recommended`,
    },
    {
      id:'stress', label:'Stress', score:Math.round(100 - body.stressLevel * 9), icon:'🧘',
      color:'text-purple-600',
      insight: body.stressLevel <= 4 ? 'Well managed' :
               `Level ${body.stressLevel}/10 — costing ₹${Math.round(stressCost/1000)}K/yr`,
    },
    {
      id:'savings', label:'Savings', score:Math.round(savingsScore), icon:'🏦',
      color:'text-amber-600',
      insight: `${Math.round(savingsRate * 100)}% savings rate`,
    },
    {
      id:'investing', label:'Investing', score:Math.round(investScore), icon:'📈',
      color:'text-green-600',
      insight: finance.monthlyInvestments > 0 ?
               `₹${(finance.monthlyInvestments/1000).toFixed(0)}K/month invested` :
               'Not investing yet',
    },
    {
      id:'debt', label:'Debt Health', score:Math.round(debtScore), icon:'💳',
      color:'text-red-600',
      insight: finance.totalDebt === 0 ? 'Debt free' :
               `${debtToIncome.toFixed(1)}x annual income in debt`,
    },
  ];

  // ── Insights ─────────────────────────────────────
  const insights = generateFullInsights(
    body, finance, bmi,
    sleepCost, stressCost
  );

  // ── Actions ──────────────────────────────────────
  const actions = generateFullActions(
    body, finance,
    sleepCost, stressCost
  );

  // ── Trajectories ─────────────────────────────────
  const trajectories = generateTrajectories(
    body, finance, overall, yearsWorking
  );

  const previous    = history[0]?.overall;
  const scoreChange = previous != null ? overall - previous : undefined;
  const streakDays  = calculateStreak(history);

  return {
    overall, body: bodyScore, mind: mindScore,
    wealth: wealthScore, life: lifeScore,
    level: 'full',
    archetype,
    annualHealthCost,
    lifetimeHealthCost,
    dimensions,
    insights,
    actions,
    trajectories,
    scoreFactors: factors,
    previousScore: previous,
    scoreChange,
    streakDays,
  };
}

// ── ARCHETYPE SELECTION ────────────────────────────

function selectArchetype(
  body: number, mind: number, wealth: number,
  debtToIncome: number | null
): Archetype {
  const highBody   = body >= 70;
  const highMind   = mind >= 70;
  const highWealth = wealth >= 70;
  const highDebt   = debtToIncome !== null && debtToIncome > 2;

  if (highBody && highMind && highWealth)    return ARCHETYPES.optimizer;
  if (highBody && !highWealth && !highDebt)  return ARCHETYPES.vitalist;
  if (!highBody && highWealth && !highMind)  return ARCHETYPES.grinder;
  if (!highBody && !highWealth)              return ARCHETYPES.rebuilder;
  if (highBody && !highMind)                 return ARCHETYPES.performer;
  if (!highBody && highMind)                 return ARCHETYPES.thinker;
  if (highWealth && highDebt)                return ARCHETYPES.juggler;
  return ARCHETYPES.steadyClimber;
}

// ── INSIGHT GENERATORS ────────────────────────────

function generateQuickInsights(
  body: number, mind: number, wealth: number
): Insight[] {
  const insights: Insight[] = [];
  const lowest = Math.min(body, mind, wealth);

  if (lowest === mind && mind < 60) {
    insights.push({
      type: 'warning', emoji: '🧠',
      headline: 'Your mind score is pulling everything down',
      detail: 'Stress and mental load affect your health, your earning capacity, and your spending habits simultaneously. It is the highest-leverage thing to fix.',
    });
  }

  if (lowest === wealth && wealth < 60) {
    insights.push({
      type: 'connection', emoji: '💡',
      headline: 'Financial stress is a hidden health cost',
      detail: 'Money anxiety raises cortisol levels — the same stress hormone that disrupts sleep, increases inflammation, and reduces immune function. Your health score has a financial component you may not see.',
    });
  }

  if (body > 75 && wealth < 55) {
    insights.push({
      type: 'opportunity', emoji: '🔄',
      headline: 'Your health habits could earn you more money',
      detail: 'Research shows people with strong health habits earn 9% more on average. Your body score suggests those habits exist. The financial picture has not caught up yet.',
    });
  }

  return insights.slice(0, 2);
}

function generateFullInsights(
  body: BodyInputs, finance: FinanceInputs, bmi: number,
  sleepCost: number, stressCost: number
): Insight[] {
  const insights: Insight[] = [];
  const annualIncome = finance.monthlyIncome * 12;

  if (body.sleepHours < 7 && sleepCost > 5000) {
    insights.push({
      type: 'connection', emoji: '😴',
      headline: `Sleeping ${body.sleepHours} hours is like taking a ₹${Math.round(sleepCost/1000)}K pay cut every year`,
      detail: `Each hour below 8 costs 2.4% of your earning capacity. For your income of ₹${Math.round(annualIncome/1000)}K/year that is ₹${Math.round(sleepCost/1000)}K. Sleep more and give yourself a raise.`,
      financialValue: sleepCost,
    });
  }

  if (body.stressLevel >= 7 && finance.totalDebt > 0) {
    insights.push({
      type: 'connection', emoji: '🔄',
      headline: 'Your debt is making you stressed. Your stress is making you spend more.',
      detail: 'High financial stress triggers cortisol spikes that increase impulse purchases by 30-40%. It is a cycle. Breaking the debt breaks the stress — and likely improves your sleep too.',
    });
  }

  if (finance.monthlyInvestments === 0) {
    const surplus = finance.monthlyIncome - finance.monthlyExpenses;
    if (surplus > 0) {
      const sipAmount = Math.round(surplus * 0.4);
      const futureValue = Math.round(sipAmount * 12 * ((Math.pow(1.12, 20) - 1) / 0.12));
      insights.push({
        type: 'opportunity', emoji: '📈',
        headline: `₹${Math.round(surplus/1000)}K sits unused every month`,
        detail: `Investing just ₹${Math.round(sipAmount/1000)}K/month (40% of your surplus) grows to ₹${Math.round(futureValue/100000)}L in 20 years at 12% returns. Start a SIP today.`,
        financialValue: futureValue,
      });
    }
  }

  if (body.exerciseDays >= 4) {
    insights.push({
      type: 'strength', emoji: '💪',
      headline: `${body.exerciseDays} workout days/week is saving you ₹24,000/year`,
      detail: 'Regular exercise reduces annual medical costs by an average of ₹24,000. You are already making this investment in yourself.',
      financialValue: 24000,
    });
  }

  if (bmi > 30 && !finance.hasInsurance) {
    insights.push({
      type: 'warning', emoji: '⚠️',
      headline: 'High BMI without insurance is a financial risk',
      detail: `With BMI ${bmi.toFixed(1)}, lifestyle-related conditions are statistically more likely. Without insurance, one hospitalisation can cost ₹3-15 lakh out of pocket.`,
    });
  }

  return insights.slice(0, 3);
}

// ── ACTION GENERATORS ─────────────────────────────

function generateQuickActions(
  body: number, mind: number, wealth: number
): Action[] {
  const actions: Action[] = [];
  const scores = [
    { score: body,   cat: 'health'  as const },
    { score: mind,   cat: 'mind'    as const },
    { score: wealth, cat: 'finance' as const },
  ].sort((a, b) => a.score - b.score);

  scores.forEach((s, i) => {
    if (s.cat === 'health') {
      actions.push({
        rank: i + 1,
        title: 'Add one health habit this week',
        why: `Your body score of ${s.score} suggests your physical habits have room to grow. One small change compounds fast.`,
        impact: 'Better energy, focus, and long-term health cost savings',
        howEasy: 'this-week',
        category: 'health',
        toolSlug: 'bmi', toolCat: 'health',
      });
    } else if (s.cat === 'mind') {
      actions.push({
        rank: i + 1,
        title: 'Do one stress-reducing thing today',
        why: `A mind score of ${s.score} means stress is creating friction everywhere — health, finances, relationships.`,
        impact: 'Reduces impulse spending and improves sleep simultaneously',
        howEasy: 'today',
        category: 'mind',
      });
    } else {
      actions.push({
        rank: i + 1,
        title: 'Review your finances this weekend',
        why: `A wealth score of ${s.score} suggests there are gains available. Even a 30-minute review can surface quick wins.`,
        impact: 'Financial clarity reduces stress which improves health',
        howEasy: 'this-week',
        category: 'finance',
        toolSlug: 'sip', toolCat: 'finance',
      });
    }
  });

  return actions.slice(0, 3);
}

function generateFullActions(
  body: BodyInputs, finance: FinanceInputs,
  sleepCost: number, stressCost: number
): Action[] {
  const candidates: Action[] = [];

  if (body.sleepHours < 7) {
    candidates.push({
      rank: 0,
      title: `Sleep ${(7.5 - body.sleepHours).toFixed(1)} more hours`,
      why: `You sleep ${body.sleepHours} hours. At your income, that sleep deficit costs ₹${Math.round(sleepCost/1000)}K/year in lost productivity.`,
      impact: `₹${Math.round(sleepCost/1000)}K/year recovered. Better decisions. Lower cortisol.`,
      howEasy: 'today',
      category: 'both',
      toolSlug: 'sleep', toolCat: 'health',
    });
  }

  const investRate = finance.monthlyInvestments / (finance.monthlyIncome || 1);
  if (investRate < 0.1) {
    const sipAmount = Math.max(1000, Math.round(finance.monthlyIncome * 0.1));
    candidates.push({
      rank: 0,
      title: `Start ₹${Math.round(sipAmount/1000)}K/month SIP`,
      why: `You are saving but not investing. At 10% of your income, ₹${Math.round(sipAmount/1000)}K/month in index funds grows to ₹${Math.round(sipAmount * 12 * ((Math.pow(1.12, 20) - 1) / 0.12)/100000)}L in 20 years.`,
      impact: `₹${Math.round(sipAmount * 12 * ((Math.pow(1.12, 20) - 1) / 0.12)/100000)}L in 20 years`,
      howEasy: 'this-week',
      category: 'finance',
      toolSlug: 'sip', toolCat: 'finance',
    });
  }

  if (!finance.hasEmergencyFund) {
    const target = finance.monthlyExpenses * 3;
    candidates.push({
      rank: 0,
      title: 'Build ₹' + Math.round(target/1000) + 'K emergency fund',
      why: 'No emergency fund means one unexpected event — medical, job loss, car — wipes your finances and spikes your stress score significantly.',
      impact: 'Eliminates financial anxiety. Improves sleep. Reduces stress score by an estimated 2 points.',
      howEasy: 'this-month',
      category: 'finance',
      toolSlug: 'savings-goal', toolCat: 'finance',
    });
  }

  if (body.exerciseDays < 3) {
    candidates.push({
      rank: 0,
      title: `Walk 30 min daily (${3 - body.exerciseDays} more days/week)`,
      why: `You exercise ${body.exerciseDays} day${body.exerciseDays !== 1 ? 's' : ''}/week. Three sessions minimum saves ₹24,000/year in medical costs and raises earnings by 9% on average.`,
      impact: '₹24,000/year saved. 9% higher earnings. Better mood within 2 weeks.',
      howEasy: 'today',
      category: 'health',
      toolSlug: 'calories-burned', toolCat: 'health',
    });
  }

  if (body.stressLevel >= 7) {
    candidates.push({
      rank: 0,
      title: 'Reduce stress from ' + body.stressLevel + '/10 to below 5',
      why: `Your stress level costs ₹${Math.round(stressCost/1000)}K/year in reduced output. At level ${body.stressLevel}, your financial decisions are also compromised by cortisol.`,
      impact: `₹${Math.round(stressCost/1000)}K/year recovered. Better sleep. Better financial decisions.`,
      howEasy: 'this-week',
      category: 'both',
    });
  }

  if (!finance.hasInsurance) {
    candidates.push({
      rank: 0,
      title: 'Get health insurance this month',
      why: 'No insurance at your income level means a single hospitalisation can erase years of savings. A ₹500/month premium protects ₹5-10 lakh of coverage.',
      impact: 'Protects against ₹3-15L potential medical costs',
      howEasy: 'this-month',
      category: 'finance',
    });
  }

  const priority = ['today', 'this-week', 'this-month'];
  return candidates
    .sort((a, b) => priority.indexOf(a.howEasy) - priority.indexOf(b.howEasy))
    .slice(0, 3)
    .map((a, i) => ({ ...a, rank: i + 1 }));
}

// ── TRAJECTORY GENERATOR ──────────────────────────

function generateTrajectories(
  body: BodyInputs, finance: FinanceInputs,
  overall: number, yearsWorking: number
): Trajectory[] {
  const monthlyInv    = finance.monthlyInvestments || 0;
  const annualReturn  = 0.12;

  // Future value of a monthly SIP annuity plus the user's EXISTING savings —
  // both compounding forward to the same horizon. Previously totalSavings
  // was added un-compounded (as if it earned 0% for the entire period),
  // which massively understated net worth for anyone with real savings —
  // e.g. ₹5L today at 12% over 30 years grows to ~₹1.5Cr on its own, not
  // the flat ₹5L the old formula credited it.
  const fv = (pmt: number, r: number, n: number) =>
    pmt * 12 * ((Math.pow(1 + r, n) - 1) / r) + finance.totalSavings * Math.pow(1 + r, n);

  const currentNW  = fv(monthlyInv, annualReturn, yearsWorking);
  const improvedPmt = Math.max(monthlyInv, finance.monthlyIncome * 0.15);
  const improvedNW = fv(improvedPmt, annualReturn, yearsWorking);
  const optimalPmt = finance.monthlyIncome * 0.25;
  const optimalR   = annualReturn + 0.02;
  const optimalNW  = fv(optimalPmt, optimalR, yearsWorking);

  return [
    {
      scenario: 'current',
      label: 'Nothing changes',
      netWorthAt60:         Math.round(currentNW),
      lifeQuality:          Math.round(overall / 14),
      lifeExpectancy:       72 + (overall > 70 ? 3 : 0),
      monthlyPassiveIncome: Math.round(currentNW * 0.04 / 12),
      keyChange:            'Current trajectory maintained',
    },
    {
      scenario: 'improved',
      label: 'Fix top 3 issues',
      netWorthAt60:         Math.round(improvedNW),
      lifeQuality:          Math.min(9, Math.round(overall / 14) + 2),
      lifeExpectancy:       75 + (body.exerciseDays >= 3 ? 2 : 0),
      monthlyPassiveIncome: Math.round(improvedNW * 0.04 / 12),
      keyChange:            `Sleep fix + ₹${Math.round(finance.monthlyIncome * 0.15 / 1000)}K SIP`,
    },
    {
      scenario: 'optimal',
      label: 'Full potential',
      netWorthAt60:         Math.round(optimalNW),
      lifeQuality:          9,
      lifeExpectancy:       80,
      monthlyPassiveIncome: Math.round(optimalNW * 0.04 / 12),
      keyChange:            'All habits optimised',
    },
  ];
}

// ── PRESENTATION HELPERS — shared by /score and /dashboard ────────────────

export function scoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#0d9488';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function scoreLabel(score: number): 'Excellent' | 'Good' | 'Average' | 'Needs Work' | 'Critical' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Needs Work';
  return 'Critical';
}

// ── HELPERS ───────────────────────────────────────

/**
 * Consecutive-day streak from real dates on saved history entries, ending
 * today or yesterday (so it doesn't reset the moment the clock ticks past
 * midnight before the user has had a chance to check back in).
 */
function calculateStreak(history: WellFiScore[]): number {
  const dayTimestamps = Array.from(new Set(
    history.filter(h => h.date).map(h => new Date(h.date as string).setHours(0, 0, 0, 0))
  )).sort((a, b) => b - a);

  if (dayTimestamps.length === 0) return 1;

  const today = new Date().setHours(0, 0, 0, 0);
  const daysSinceLast = Math.round((today - dayTimestamps[0]) / 86400000);
  if (daysSinceLast > 1) return 1;

  let streak = 1;
  for (let i = 0; i < dayTimestamps.length - 1; i++) {
    const gap = Math.round((dayTimestamps[i] - dayTimestamps[i + 1]) / 86400000);
    if (gap === 1) streak++;
    else break;
  }
  return streak;
}
