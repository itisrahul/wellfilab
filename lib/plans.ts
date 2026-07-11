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
      'Personalised weekly meal plan based on your goals',
      'Macro targets from your BMI & activity level',
      'Weekly grocery shopping list',
      'Access to 50+ healthy Indian recipes',
      'Monthly check-in & plan adjustment',
      'Email support within 24 hours',
    ],
    deliverables: [
      'Onboarding form within 5 minutes of subscribing',
      'Week 1 meal plan within 48 hours',
      'Updated plan every Monday',
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
      'Personalised budget based on your income & expenses',
      'SIP / mutual fund investment roadmap',
      'Debt payoff strategy (avalanche or snowball)',
      'Retirement corpus target with monthly savings plan',
      'Tax-saving opportunities identified',
      'Monthly progress review',
    ],
    deliverables: [
      'Financial health questionnaire on sign-up',
      'Custom budget spreadsheet within 48 hours',
      'Monthly strategy email with action items',
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
      'Everything in Diet & Nutrition Plan',
      'Everything in Personal Finance Plan',
      'Integrated health + wealth dashboard',
      'Priority support within 12 hours',
      'Quarterly 30-min review session',
      'Private member community access',
    ],
    deliverables: [
      'Combined onboarding form on sign-up',
      'Both plans delivered within 48 hours',
      'Monthly email covering health + finance together',
    ],
  },
];

export const getActivePlans = () => Promise.resolve(PLANS.filter(p => p.enabled));
export const getPlan        = (id: string) => PLANS.find(p => p.id === id && p.enabled) ?? null;
export const getPlanAny     = (id: string) => PLANS.find(p => p.id === id) ?? null;
