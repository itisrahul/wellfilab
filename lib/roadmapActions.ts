/**
 * lib/roadmapActions.ts — real, numbered roadmap actions per fine-grained dimension.
 *
 * Originally defined inline in app/roadmap/page.tsx. Extracted once the dashboard
 * needed the same per-dimension action bank (for its Top Priorities and Next
 * Steps widgets) — a second inline copy would drift from the roadmap page's own
 * actions over time, so both now read from one source.
 */

import type { Dimension, BodyInputs, FinanceInputs, QuickInputs } from './wellfilab-score';

// QuickInputs is accepted but ignored by calculateFullScore once real body/finance
// data exists — this placeholder exists only to satisfy the function signature.
export const DUMMY_QUICK: QuickInputs = { healthFeeling: 3, financeFeeling: 3, stressFeeling: 3 };

export function fmtINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export interface RoadmapAction {
  title: string; why: string; impact: string;
  /** Annual ₹ figure, only set when genuinely a recurring annual saving/cost —
   * never a long-term corpus number (those live in the trajectories section,
   * a single source of truth, so they're not duplicated/re-derived here). */
  impactValue?: number;
  priority: 'Today' | 'This week'; category: 'Health' | 'Finance' | 'Mind';
  /** How long this specific action takes to DO — distinct from priority (when to start it). */
  timeEstimate: string;
  toolSlug?: string; toolCat?: 'health' | 'finance';
}

/** Builds real, numbered actions from the user's own body/finance data when available,
 * falling back to the existing generic-but-good text when they're not (quick-level score). */
export function getDimActions(id: string, dim: Dimension, body: BodyInputs | null, finance: FinanceInputs | null): RoadmapAction[] {
  switch (id) {
    case 'sleep': {
      const gap = body ? Math.max(0, 7.5 - body.sleepHours) : null;
      const annualIncome = finance ? finance.monthlyIncome * 12 : null;
      const sleepCost = gap != null && annualIncome != null ? Math.round(gap * 0.024 * annualIncome) : null;
      return [
        {
          title: gap && gap > 0 ? `Go to bed ${gap.toFixed(1)}h earlier tonight` : 'Set a consistent bedtime alarm tonight',
          why: body ? `You currently sleep ${body.sleepHours} hours — ${dim.insight}. A bedtime alarm prevents late-night scrolling from eating into your sleep window.`
                    : `${dim.insight}. A bedtime alarm prevents late-night scrolling from eating into your sleep window.`,
          impact: sleepCost && sleepCost > 0 ? `💰 Recovers an estimated ${fmtINR(sleepCost)}/year in productivity` : '⚡ Energy improves within 3-5 days. Costs nothing.',
          impactValue: sleepCost && sleepCost > 0 ? sleepCost : undefined,
          priority: 'Today', category: 'Health', timeEstimate: '30 seconds to set', toolSlug: 'sleep', toolCat: 'health',
        },
        { title: 'No phone 30 min before bed — start tonight', why: 'Blue light suppresses melatonin for 3+ hours after exposure.', impact: '⚡ Sleep onset up to 40% faster within 1 week.', priority: 'Today', category: 'Health', timeEstimate: 'Costs nothing' },
        { title: 'Keep a consistent wake time, even on weekends', why: 'Circadian rhythm consistency matters more than total hours for how rested you actually feel.', impact: '⚡ Noticeable energy improvement within 2 weeks.', priority: 'This week', category: 'Health', timeEstimate: 'Costs nothing' },
      ];
    }
    case 'movement': {
      const currentSave = body ? (body.exerciseDays >= 3 ? 24000 : body.exerciseDays >= 1 ? 12000 : 0) : null;
      const potential = currentSave != null ? 24000 - currentSave : null;
      const daysNeeded = body ? Math.max(0, 3 - body.exerciseDays) : null;
      return [
        { title: 'Walk for 20 minutes tomorrow morning', why: 'Before checking your phone — this sets your cortisol rhythm for the whole day.', impact: '⚡ Mood and energy improve same-day. Costs nothing.', priority: 'Today', category: 'Health', timeEstimate: '20 minutes', toolSlug: 'calories-burned', toolCat: 'health' },
        {
          title: daysNeeded && daysNeeded > 0 ? `Move ${daysNeeded} more day${daysNeeded > 1 ? 's' : ''}/week — pick fixed time slots now` : 'Pick one recurring time slot this week for movement',
          why: `${dim.insight}. A fixed slot beats a vague intention every time.`,
          impact: potential && potential > 0 ? `💰 Worth up to ${fmtINR(potential)}/year more in medical-cost savings at 3+ days/week` : 'Consistency compounds — most people quit from lack of a schedule, not lack of motivation.',
          impactValue: potential && potential > 0 ? potential : undefined,
          priority: 'This week', category: 'Health', timeEstimate: '5 minutes to plan',
        },
        { title: 'Try a beginner routine this week (bodyweight or a 20-min video)', why: 'Structure removes the "what do I even do" barrier that stops most people before they start.', impact: 'A repeatable routine beats a one-off workout.', priority: 'This week', category: 'Health', timeEstimate: '20 minutes', toolSlug: 'calories-burned', toolCat: 'health' },
      ];
    }
    case 'stress': {
      const monthlyImpact = finance ? Math.round(finance.monthlyExpenses * 0.05) : null;
      return [
        { title: 'Write your 3 biggest stressors now', why: `${dim.insight}. Writing externalises stress — it reduces it immediately, before you solve anything.`, impact: '⚡ Cortisol reduces within minutes. Free. Immediate.', priority: 'Today', category: 'Mind', timeEstimate: '5 minutes' },
        { title: 'Set one boundary today', why: 'Chronic stress is sustained by unprotected time and energy — one boundary interrupts that.', impact: 'Compounds over weeks as the pattern breaks.', priority: 'Today', category: 'Mind', timeEstimate: 'Costs nothing' },
        {
          title: 'Walk outside for 20 min on Mon, Wed, Fri — before checking your phone',
          why: `Morning light exposure is linked to a healthier cortisol rhythm for the day. ${body ? `Your stress level of ${body.stressLevel}/10 suggests an elevated baseline.` : dim.insight}`,
          impact: monthlyImpact ? `⚡ Stress-related studies show reductions of 15-20% within 2 weeks. 💰 May cut impulse spending by an estimated ${fmtINR(monthlyImpact)}/month` : '⚡ Stress reduces 15-20% within 2 weeks in published studies.',
          impactValue: monthlyImpact ? monthlyImpact * 12 : undefined,
          priority: 'This week', category: 'Mind', timeEstimate: '20 min, 3x/week',
        },
      ];
    }
    case 'savings': {
      const target = finance ? finance.monthlyExpenses * 3 : null;
      const autoTransfer = finance ? Math.round(finance.monthlyIncome * 0.05) : null;
      const monthsToTarget = finance && target != null && autoTransfer && autoTransfer > 0 ? Math.max(1, Math.ceil(Math.max(0, target - finance.totalSavings) / autoTransfer)) : null;
      return [
        {
          title: 'Open a separate savings account for your emergency fund',
          why: finance ? `Your current savings of ${fmtINR(finance.totalSavings)} are mixed with spending money. Separation makes it automatic.` : `${dim.insight}. Separation prevents spending from savings automatically.`,
          impact: '🛡️ Protects against unexpected expenses that currently could set you back months',
          priority: 'Today', category: 'Finance', timeEstimate: '15 minutes', toolSlug: 'savings-goal', toolCat: 'finance',
        },
        {
          title: autoTransfer ? `Set auto-transfer of ${fmtINR(autoTransfer)} on every payday` : 'Automate one transfer to savings on payday',
          why: target != null && autoTransfer && monthsToTarget != null ? `Target: ${fmtINR(target)} emergency fund (3 months of expenses). At ${fmtINR(autoTransfer)}/month, that's about ${monthsToTarget} month${monthsToTarget > 1 ? 's' : ''} to build it.` : 'Automatic beats willpower — money saved before you see it never gets the chance to be spent.',
          impact: '💰 Eliminates financial anxiety that is currently costing you sleep and focus',
          priority: 'This week', category: 'Finance', timeEstimate: '5 minutes to set up', toolSlug: 'savings-goal', toolCat: 'finance',
        },
        { title: 'List every subscription you pay this weekend', why: 'Most people underestimate fixed expenses by 20-30%.', impact: '💰 Typically finds ₹500-2,000/month in unused subscriptions', impactValue: 12000, priority: 'Today', category: 'Finance', timeEstimate: '15 minutes', toolSlug: 'budget', toolCat: 'finance' },
      ];
    }
    case 'investing': {
      const sipAmount = finance ? Math.max(1000, Math.round(finance.monthlyIncome * 0.1)) : null;
      const fv20 = sipAmount ? Math.round(sipAmount * 12 * ((Math.pow(1.12, 20) - 1) / 0.12)) : null;
      return [
        {
          title: sipAmount ? `Start a ₹${(sipAmount / 1000).toFixed(0)}K/month SIP in a Nifty 50 index fund` : 'Calculate your first SIP amount',
          why: sipAmount && fv20 && finance ? `You currently invest ${fmtINR(finance.monthlyInvestments)}/month. At 10% of income, ${fmtINR(sipAmount)}/month grows to roughly ${fmtINR(fv20)} in 20 years at an assumed 12% annual return.` : `${dim.insight}.`,
          impact: fv20 ? `📈 See the exact "with vs. without" comparison in the impact section below` : 'A concrete monthly number beats a vague "I should invest more."',
          priority: 'This week', category: 'Finance', timeEstimate: '5 minutes', toolSlug: 'sip', toolCat: 'finance',
        },
        { title: 'Set a calendar reminder to review your SIP in 90 days', why: 'Consistency matters more than perfection — review, don\'t obsess over daily market moves.', impact: 'Keeps the habit alive without turning into anxiety.', priority: 'This week', category: 'Finance', timeEstimate: '2 minutes', toolSlug: 'sip', toolCat: 'finance' },
        { title: 'Open a demat account when ready', why: 'The single blocking step between "planning to invest" and actually investing.', impact: 'Takes about 15 minutes online, most providers.', priority: 'This week', category: 'Finance', timeEstimate: '15 minutes' },
      ];
    }
    case 'debt':
    default: {
      return [
        { title: 'List every debt with its interest rate', why: finance && finance.totalDebt > 0 ? `You're carrying ${fmtINR(finance.totalDebt)} in debt. ${dim.insight}. You can't attack what you haven't mapped.` : `${dim.insight}. You can't attack what you haven't mapped.`, impact: 'Usually surfaces one obvious highest-priority target.', priority: 'Today', category: 'Finance', timeEstimate: '10 minutes', toolSlug: 'debt-payoff', toolCat: 'finance' },
        { title: 'Pick your highest-interest debt and pay ₹500 extra this month', why: 'Extra payments on the highest-rate debt save the most over time (the avalanche method).', impact: 'Reduces total interest paid — see the exact amount in the Debt Payoff calculator.', priority: 'This week', category: 'Finance', timeEstimate: '5 minutes', toolSlug: 'debt-payoff', toolCat: 'finance' },
        { title: 'Call one lender and ask about a lower rate', why: 'Many lenders will negotiate for an existing customer with a good payment history — it costs nothing to ask.', impact: 'Even a 1-2% rate cut compounds significantly over the loan term.', priority: 'This week', category: 'Finance', timeEstimate: '15 minutes', toolSlug: 'debt-payoff', toolCat: 'finance' },
      ];
    }
  }
}

export const DIM_CATEGORY_TITLE: Record<string, string> = {
  sleep: 'Physical Foundation', movement: 'Physical Foundation',
  stress: 'Mental & Emotional Load',
  savings: 'Financial Foundation', investing: 'Financial Foundation', debt: 'Financial Foundation',
};

export const HEALTH_TOOL_SLUGS = ['sleep', 'bmi', 'calories', 'body-fat', 'calories-burned'];
export const FINANCE_TOOL_SLUGS = ['sip', 'savings-goal', 'budget', 'retirement', 'fire', 'debt-payoff'];

export const BOOK_REC: Record<'stress' | 'finance' | 'body', { title: string; author: string; note: string }> = {
  stress: { title: 'Why We Sleep', author: 'Matthew Walker', note: 'Chapter 1-3 only' },
  finance: { title: 'The Psychology of Money', author: 'Morgan Housel', note: 'All chapters, ~30 min each' },
  body: { title: 'Atomic Habits', author: 'James Clear', note: 'Start at Chapter 3' },
};

export function howEasyTime(howEasy: 'today' | 'this-week' | 'this-month'): string {
  return howEasy === 'today' ? 'Under 15 minutes' : howEasy === 'this-week' ? '30-60 minutes' : 'A few hours';
}
