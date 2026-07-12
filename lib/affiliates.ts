import type { WellFiScore } from './wellfilab-score';

/**
 * lib/affiliates.ts — roadmap affiliate recommendations.
 *
 * Philosophy: only recommend when the user is READY, gated by roadmap phase
 * and their actual dimension score — never at the start, never generic.
 * getRelevantAffiliates() caps at 2 per roadmap regardless of how many are
 * eligible, so this list can grow without ever overwhelming the page.
 */

export interface Affiliate {
  id: string;
  name: string;
  logo: string; // emoji for now
  category: 'investing' | 'health' | 'insurance' | 'banking' | 'nutrition' | 'mindfulness';
  tagline: string;
  whyRecommend: string;
  url: string;
  cta: string;
  showWhen: {
    minPhase: 1 | 2 | 3;
    condition: string; // human readable, for our own reference — not rendered
    dimensionId?: string;
    maxDimScore?: number;
    minDimScore?: number;
  };
}

export const AFFILIATES: Affiliate[] = [
  {
    id: 'zerodha',
    name: 'Zerodha',
    logo: '📈',
    category: 'investing',
    tagline: 'Start your first SIP today',
    whyRecommend: "India's largest broker. Zero commission on mutual funds. Best for first-time investors.",
    url: 'https://zerodha.com/open-account',
    cta: 'Open free account →',
    showWhen: { minPhase: 2, condition: 'investing score is low AND user has reached Phase 2', dimensionId: 'investing', maxDimScore: 40 },
  },
  {
    id: 'groww',
    name: 'Groww',
    logo: '🌱',
    category: 'investing',
    tagline: 'Simplest app to start investing',
    whyRecommend: 'Most beginner-friendly investing app. Zero paperwork.',
    url: 'https://groww.in',
    cta: 'Start investing →',
    showWhen: { minPhase: 2, condition: 'not investing yet', dimensionId: 'investing', maxDimScore: 20 },
  },
  {
    id: 'policybazaar',
    name: 'PolicyBazaar',
    logo: '🛡️',
    category: 'insurance',
    tagline: 'Compare and get health insurance',
    whyRecommend: 'Best platform to compare health insurance plans in India. Your score shows no insurance coverage.',
    url: 'https://www.policybazaar.com',
    cta: 'Compare plans →',
    showWhen: { minPhase: 1, condition: 'no health insurance', dimensionId: 'savings', maxDimScore: 60 },
  },
  {
    id: 'healthifyme',
    name: 'HealthifyMe',
    logo: '🥗',
    category: 'nutrition',
    tagline: 'AI nutrition tracking',
    whyRecommend: 'Best nutrition tracking app for Indian food. Your diet score suggests tracking would help.',
    url: 'https://www.healthifyme.com',
    cta: 'Try free →',
    showWhen: { minPhase: 2, condition: 'diet quality below average', dimensionId: 'movement', maxDimScore: 50 },
  },
  {
    id: 'fi-money',
    name: 'Fi Money',
    logo: '💳',
    category: 'banking',
    tagline: 'Smart account that auto-saves',
    whyRecommend: 'Zero-fee account with automatic savings rules. Perfect for building your emergency fund.',
    url: 'https://fi.money',
    cta: 'Open account →',
    showWhen: { minPhase: 1, condition: 'no emergency fund', dimensionId: 'savings', maxDimScore: 50 },
  },
  {
    id: 'headspace',
    name: 'Headspace',
    logo: '🧘',
    category: 'mindfulness',
    tagline: '10 min/day reduces stress by 40%',
    whyRecommend: 'Best meditation app for stress reduction. Your stress score suggests this would help most.',
    url: 'https://www.headspace.com',
    cta: 'Try free →',
    showWhen: { minPhase: 1, condition: 'stress score below 50', dimensionId: 'stress', maxDimScore: 50 },
  },
  {
    id: 'kuvera',
    name: 'Kuvera',
    logo: '💰',
    category: 'investing',
    tagline: 'Free direct mutual fund platform',
    whyRecommend: 'Zero commission direct mutual funds. Better returns than regular funds.',
    url: 'https://kuvera.in',
    cta: 'Start free →',
    showWhen: { minPhase: 3, condition: 'ready to invest seriously in Phase 3', dimensionId: 'investing', maxDimScore: 60 },
  },
];

/** Returns which affiliates to show, based on score and current phase — capped at `max`. */
export function getRelevantAffiliates(score: WellFiScore, currentPhase: 1 | 2 | 3, max = 2): Affiliate[] {
  return AFFILIATES
    .filter(a => {
      if (a.showWhen.minPhase > currentPhase) return false;

      if (a.showWhen.dimensionId) {
        const dim = score.dimensions.find(d => d.id === a.showWhen.dimensionId);
        if (!dim) return false;
        if (a.showWhen.maxDimScore != null && dim.score > a.showWhen.maxDimScore) return false;
        if (a.showWhen.minDimScore != null && dim.score < a.showWhen.minDimScore) return false;
      }
      return true;
    })
    .slice(0, max);
}
