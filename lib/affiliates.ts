import type { WellFiScore } from './wellfilab-score';

/**
 * lib/affiliates.ts — roadmap product/service/book recommendations.
 *
 * Philosophy: only recommend when the user is READY, gated by roadmap phase
 * and their actual dimension score — never at the start, never generic.
 * getRelevantAffiliates() caps at 2 per roadmap regardless of how many are
 * eligible, so this list can grow without ever overwhelming the page.
 *
 * Trust framework: every entry answers the 4 required questions explicitly —
 * whyRecommend (why this, why now), expectedBenefit (what changes if you act
 * on it), relatedGuideSlug/relatedCalcSlug (where to verify the reasoning
 * yourself, in this product, not just take our word for it).
 */

export interface Affiliate {
  id: string;
  name: string;
  logo: string; // emoji for now
  type: 'product' | 'service' | 'app' | 'book' | 'plan';
  category: 'investing' | 'health' | 'insurance' | 'banking' | 'nutrition' | 'mindfulness' | 'fitness' | 'learning';
  tagline: string;
  whyRecommend: string;
  /** What real, specific change to expect if this recommendation is followed —
   * never a vague "improves your life," always tied to the score/roadmap math. */
  expectedBenefit: string;
  url: string;
  cta: string;
  /** In-product places to verify the reasoning rather than take our word for it.
   * relatedGuideTitle is stored directly (not looked up from lib/posts.ts) so
   * this file — imported by the client-rendered roadmap page — never pulls
   * the full guide-content bundle into client JS just to show a link. */
  relatedGuideSlug?: string;
  relatedGuideTitle?: string;
  relatedCalcSlug?: string;
  relatedCalcCat?: 'health' | 'finance';
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
    name: 'Zerodha', logo: '📈', type: 'service', category: 'investing',
    tagline: 'Start your first SIP today',
    whyRecommend: "India's largest broker. Zero commission on mutual funds. Best for first-time investors.",
    expectedBenefit: 'A ₹5K/month SIP started today, left alone, grows to roughly ₹50L in 20 years at a 12% assumed return — the account is the first step, not the goal.',
    url: 'https://zerodha.com/open-account', cta: 'Open free account →',
    relatedGuideSlug: 'sip-complete-guide', relatedGuideTitle: 'SIP Calculator India: How to Project Your Real Investment Returns', relatedCalcSlug: 'sip', relatedCalcCat: 'finance',
    showWhen: { minPhase: 2, condition: 'investing score is low AND user has reached Phase 2', dimensionId: 'investing', maxDimScore: 40 },
  },
  {
    id: 'groww',
    name: 'Groww', logo: '🌱', type: 'service', category: 'investing',
    tagline: 'Simplest app to start investing',
    whyRecommend: 'Most beginner-friendly investing app. Zero paperwork.',
    expectedBenefit: 'Removes the "which broker" decision paralysis that keeps a ₹0/month investor at ₹0/month for years.',
    url: 'https://groww.in', cta: 'Start investing →',
    relatedGuideSlug: 'how-to-invest-first-salary', relatedGuideTitle: 'How to Invest Your First Salary: A Complete Step-by-Step Guide', relatedCalcSlug: 'sip', relatedCalcCat: 'finance',
    showWhen: { minPhase: 2, condition: 'not investing yet', dimensionId: 'investing', maxDimScore: 20 },
  },
  {
    id: 'policybazaar',
    name: 'PolicyBazaar', logo: '🛡️', type: 'service', category: 'insurance',
    tagline: 'Compare and get health insurance',
    whyRecommend: 'Best platform to compare health insurance plans in India. Your score shows no insurance coverage.',
    expectedBenefit: 'Converts an uncapped ₹3–15L hospitalization risk into a fixed, budgetable monthly premium.',
    url: 'https://www.policybazaar.com', cta: 'Compare plans →',
    relatedCalcSlug: 'net-worth', relatedCalcCat: 'finance',
    showWhen: { minPhase: 1, condition: 'no health insurance', dimensionId: 'savings', maxDimScore: 60 },
  },
  {
    id: 'healthifyme',
    name: 'HealthifyMe', logo: '🥗', type: 'app', category: 'nutrition',
    tagline: 'AI nutrition tracking',
    whyRecommend: 'Best nutrition tracking app for Indian food. Your diet score suggests tracking would help.',
    expectedBenefit: 'People who track intake for even 2 weeks typically discover 300-500 untracked daily calories — the gap between "I eat healthy" and what actually happens.',
    url: 'https://www.healthifyme.com', cta: 'Try free →',
    relatedGuideSlug: 'macro-counting-guide', relatedGuideTitle: 'Macro Counting: A Practical Guide From Zero to Results', relatedCalcSlug: 'calories', relatedCalcCat: 'health',
    showWhen: { minPhase: 2, condition: 'diet quality below average', dimensionId: 'movement', maxDimScore: 50 },
  },
  {
    id: 'fi-money',
    name: 'Fi Money', logo: '💳', type: 'service', category: 'banking',
    tagline: 'Smart account that auto-saves',
    whyRecommend: 'Zero-fee account with automatic savings rules. Perfect for building your emergency fund.',
    expectedBenefit: 'Automating the transfer removes the monthly decision to save — money moved before it can be spent is the single biggest predictor of a completed emergency fund.',
    url: 'https://fi.money', cta: 'Open account →',
    relatedGuideSlug: 'budgeting-50-30-20-india', relatedGuideTitle: 'The 50/30/20 Budget: Why It Fails for Most Indians and How to Fix It', relatedCalcSlug: 'savings-goal', relatedCalcCat: 'finance',
    showWhen: { minPhase: 1, condition: 'no emergency fund', dimensionId: 'savings', maxDimScore: 50 },
  },
  {
    id: 'headspace',
    name: 'Headspace', logo: '🧘', type: 'app', category: 'mindfulness',
    tagline: '10 min/day reduces stress by 40%',
    whyRecommend: 'Best meditation app for stress reduction. Your stress score suggests this would help most.',
    expectedBenefit: 'Published trials on daily meditation show measurable stress-marker reductions within 2-4 weeks of consistent practice.',
    url: 'https://www.headspace.com', cta: 'Try free →',
    relatedGuideSlug: 'sleep-science-complete-guide', relatedGuideTitle: 'The Science of Sleep: Why 7 Hours Is Not Enough for Everyone',
    showWhen: { minPhase: 1, condition: 'stress score below 50', dimensionId: 'stress', maxDimScore: 50 },
  },
  {
    id: 'kuvera',
    name: 'Kuvera', logo: '💰', type: 'service', category: 'investing',
    tagline: 'Free direct mutual fund platform',
    whyRecommend: 'Zero commission direct mutual funds. Better returns than regular funds.',
    expectedBenefit: 'Direct plans typically carry a 0.5-1% lower expense ratio than regular plans — compounded over 20 years, that gap alone is worth several lakhs on a serious SIP.',
    url: 'https://kuvera.in', cta: 'Start free →',
    relatedGuideSlug: 'index-fund-vs-active-india', relatedGuideTitle: 'Index Funds vs Active Funds in India: What the Data Actually Shows', relatedCalcSlug: 'sip', relatedCalcCat: 'finance',
    showWhen: { minPhase: 3, condition: 'ready to invest seriously in Phase 3', dimensionId: 'investing', maxDimScore: 60 },
  },
  // ── Books — real titles, linked to an honest public search, not a fabricated affiliate ID ──
  {
    id: 'book-psychology-of-money',
    name: 'The Psychology of Money', logo: '📘', type: 'book', category: 'investing',
    tagline: 'Morgan Housel — why behavior beats math in investing',
    whyRecommend: 'The single most common reason SIPs get abandoned is behavioral, not mathematical — this book is specifically about that gap.',
    expectedBenefit: 'A reader who internalizes even one chapter (staying invested through volatility) avoids the single most expensive mistake in long-term investing: selling at the bottom.',
    url: 'https://www.amazon.in/s?k=The+Psychology+of+Money+Morgan+Housel', cta: 'Find the book →',
    relatedGuideSlug: 'sip-vs-lump-sum', relatedGuideTitle: 'SIP vs Lump Sum: Which Wins Over 10, 20, and 30 Years?', relatedCalcSlug: 'sip', relatedCalcCat: 'finance',
    showWhen: { minPhase: 2, condition: 'investing score is low — behavioral gap, not just a missing account', dimensionId: 'investing', maxDimScore: 50 },
  },
  {
    id: 'book-why-we-sleep',
    name: 'Why We Sleep', logo: '📗', type: 'book', category: 'health',
    tagline: 'Matthew Walker — the real cost of sleep debt',
    whyRecommend: 'Read chapters 1-3 only — the case for why sleep is non-negotiable, in plain terms, from the research itself rather than our summary of it.',
    expectedBenefit: "Most readers don't finish the book but do change their bedtime after chapter 2 — the goal is the behavior change, not finishing it.",
    url: 'https://www.amazon.in/s?k=Why+We+Sleep+Matthew+Walker', cta: 'Find the book →',
    relatedGuideSlug: 'sleep-science-complete-guide', relatedGuideTitle: 'The Science of Sleep: Why 7 Hours Is Not Enough for Everyone', relatedCalcSlug: 'sleep', relatedCalcCat: 'health',
    showWhen: { minPhase: 1, condition: 'sleep dimension is the weakest — book reinforces the "why" behind the roadmap action', dimensionId: 'sleep', maxDimScore: 55 },
  },
  {
    id: 'book-atomic-habits',
    name: 'Atomic Habits', logo: '📙', type: 'book', category: 'fitness',
    tagline: "James Clear — start at chapter 3 if you've stalled before",
    whyRecommend: "For anyone who's tried and stopped a fitness or diet routine more than once — the book is specifically about why willpower-based plans fail and what to build instead.",
    expectedBenefit: 'Applying the "make it obvious, make it easy" framework to a single habit (e.g. a fixed workout time) measurably raises adherence versus an unscheduled intention.',
    url: 'https://www.amazon.in/s?k=Atomic+Habits+James+Clear', cta: 'Find the book →',
    relatedGuideSlug: 'how-to-lose-weight-without-starving', relatedGuideTitle: 'How to Lose Weight Without Starving: The Science of Sustainable Fat Loss', relatedCalcSlug: 'calories-burned', relatedCalcCat: 'health',
    showWhen: { minPhase: 1, condition: 'movement dimension is the weakest', dimensionId: 'movement', maxDimScore: 55 },
  },
  // ── Health products/services beyond apps ──
  {
    id: 'cult-fit',
    name: 'Cult.fit', logo: '🏋️', type: 'service', category: 'fitness',
    tagline: 'Structured group fitness classes',
    whyRecommend: "Structure removes the single biggest barrier to consistent exercise — deciding what to do that day. A scheduled class is a commitment device, a solo gym plan isn't.",
    expectedBenefit: 'Group-class attendees show measurably higher 90-day adherence than solo-gym-plan starters — the accountability, not the workout itself, is the mechanism.',
    url: 'https://www.cult.fit', cta: 'See classes near you →',
    relatedCalcSlug: 'calories-burned', relatedCalcCat: 'health',
    showWhen: { minPhase: 1, condition: 'movement dimension weak and exercise days low', dimensionId: 'movement', maxDimScore: 45 },
  },
  {
    id: 'whey-protein-basics',
    name: 'Whey protein (any reputable brand)', logo: '🥤', type: 'product', category: 'nutrition',
    tagline: '~25-30g protein per serving, the most common real gap',
    whyRecommend: 'Most Indian diets fall short of the 0.8-1g protein per kg bodyweight target purely from food — a single daily scoop closes most of that gap for under ₹15/day.',
    expectedBenefit: 'Closing a protein gap materially improves satiety (less snacking) and preserves muscle during any calorie deficit — a direct lever on the diet-quality score.',
    url: 'https://www.amazon.in/s?k=whey+protein+isolate', cta: 'Compare options →',
    relatedGuideSlug: 'macro-counting-guide', relatedGuideTitle: 'Macro Counting: A Practical Guide From Zero to Results', relatedCalcSlug: 'calories', relatedCalcCat: 'health',
    showWhen: { minPhase: 1, condition: 'diet quality flagged as a gap', dimensionId: 'movement', maxDimScore: 55 },
  },
  // ── Learning path — beyond a single book ──
  {
    id: 'nism-learning-path',
    name: 'NISM Investor Certification (free)', logo: '🎓', type: 'service', category: 'learning',
    tagline: "SEBI-backed, free — for 'ready to invest seriously' users",
    whyRecommend: "Free, official, and specifically built for retail investors moving past their first SIP into real asset-allocation decisions — not a paid course selling a strategy.",
    expectedBenefit: 'Enough working knowledge to evaluate an advisor\'s advice instead of just trusting it — the actual goal of Phase 3 investing discipline.',
    url: 'https://www.nism.ac.in', cta: 'See free modules →',
    relatedGuideSlug: 'index-fund-vs-active-india', relatedGuideTitle: 'Index Funds vs Active Funds in India: What the Data Actually Shows', relatedCalcSlug: 'sip', relatedCalcCat: 'finance',
    showWhen: { minPhase: 3, condition: 'Phase 3 — ready for real financial literacy investment', dimensionId: 'investing', maxDimScore: 70 },
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
