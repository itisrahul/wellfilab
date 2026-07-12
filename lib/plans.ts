/**
 * plans.ts — Subscription plan definitions.
 * Prices in INR for Razorpay. Update razorpayPlanIds after creating plans in Razorpay dashboard.
 */

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  gradient: string;
  borderColor: string;
  badgeColor: string;
  monthlyPrice: number;   // INR per month
  yearlyPrice: number;    // INR per year (total)
  monthlyPriceUSD: number; // For display to international users
  razorpayPlanIds: {
    monthly: string;      // plan_xxx from Razorpay dashboard
    yearly:  string;
  };
  features: string[];
  deliverables: string[];
  highlight?: string;
  category: 'health' | 'finance' | 'bundle';
  enabled: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'diet',
    enabled: true,
    name: 'Diet & Nutrition Plan',
    tagline: 'Personalised weekly meal plan delivered to your inbox',
    icon: '🥗',
    gradient: 'from-teal-500 to-emerald-500',
    borderColor: 'border-teal-200 dark:border-teal-800',
    badgeColor: 'bg-teal-500',
    monthlyPrice: 149,
    yearlyPrice: 999,
    monthlyPriceUSD: 4,
    razorpayPlanIds: {
      monthly: process.env.RAZORPAY_PLAN_DIET_MONTHLY ?? '',
      yearly:  process.env.RAZORPAY_PLAN_DIET_YEARLY  ?? '',
    },
    category: 'health',
    features: [
      'Personal onboarding form — we learn your goals, restrictions, and cooking habits',
      'Custom weekly meal plan in 48 hours — created by our nutrition expert for you',
      'New meal plan every Monday — 7 days, shopping list, one simple recipe',
      'One focus habit per week — small change, big impact over time',
      'Email support — questions answered within 24 hours by a real person',
      'Monthly review — plan evolves as you improve',
      '30-day full refund — if not useful, full refund no questions asked',
    ],
    deliverables: [
      '5-minute onboarding form right after you subscribe',
      'Your first meal plan in your inbox within 48 hours',
      'A new week — plan, shopping list, one focus habit — every Monday',
    ],
  },
  {
    id: 'finance',
    enabled: true,
    name: 'Personal Finance Plan',
    tagline: 'Your custom roadmap to financial independence',
    icon: '💰',
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-500',
    monthlyPrice: 149,
    yearlyPrice: 999,
    monthlyPriceUSD: 4,
    razorpayPlanIds: {
      monthly: process.env.RAZORPAY_PLAN_FINANCE_MONTHLY ?? '',
      yearly:  process.env.RAZORPAY_PLAN_FINANCE_YEARLY  ?? '',
    },
    category: 'finance',
    highlight: 'Most Popular',
    features: [
      'Personal financial assessment — we understand your income, goals, debt, and habits',
      'Custom finance roadmap in 48 hours — created by our finance expert for you',
      'Monthly action plan — exactly what to focus on that month, step by step',
      'Calculator integration — your numbers pre-filled in relevant WellFiLab tools',
      'Email support — financial questions answered within 24 hours by a real person',
      'Quarterly review — strategy evolves as your situation improves',
      '30-day full refund — if not useful, full refund no questions asked',
    ],
    deliverables: [
      '5-minute financial assessment right after you subscribe',
      'Your finance roadmap in your inbox within 48 hours',
      'An updated action plan in your inbox every month',
    ],
  },
  {
    id: 'bundle',
    enabled: true,
    name: 'Health + Finance Bundle',
    tagline: 'Complete wellness — body and money — in one plan',
    icon: '⭐',
    gradient: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200 dark:border-purple-800',
    badgeColor: 'bg-purple-500',
    monthlyPrice: 249,
    yearlyPrice: 1499,
    monthlyPriceUSD: 7,
    razorpayPlanIds: {
      monthly: process.env.RAZORPAY_PLAN_BUNDLE_MONTHLY ?? '',
      yearly:  process.env.RAZORPAY_PLAN_BUNDLE_YEARLY  ?? '',
    },
    category: 'bundle',
    highlight: 'Best Value',
    features: [
      'Everything in Diet AND Finance plans',
      'Connected plans — health and money treated as one system, not two separate things',
      'Monthly combined review — shows how health improvements affect your finances',
      'Priority support — responses within 12 hours',
      'WellFiLab Score integration — plans update as your score changes each month',
      '30-day full refund — if not useful, full refund no questions asked',
    ],
    deliverables: [
      'One combined onboarding form covering nutrition and finance',
      'Both plans delivered together in your inbox within 48 hours',
      'Weekly meal updates and monthly finance updates, on their own cadence',
    ],
  },
];

export const getActivePlans = () => Promise.resolve(PLANS.filter(p => p.enabled));
export const getPlan        = (id: string) => PLANS.find(p => p.id === id && p.enabled) ?? null;
export const getPlanAny     = (id: string) => PLANS.find(p => p.id === id) ?? null;
