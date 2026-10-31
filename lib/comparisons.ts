/**
 * lib/comparisons.ts — data behind /learn/best, the site's provider
 * comparison articles (the spec's "Comparisons" / "Best Picks" sections,
 * merged into one content type since they share the same structure: a
 * short list of real, named providers, compared on the same real axes,
 * for a stated real use case).
 *
 * Content rules, same credibility bar as the rest of the site (see the
 * standing "no fudge multipliers, no fake citations" direction):
 *   - Only well-known, generally stable facts about each provider — what
 *     it's known for, its general pricing model, who it suits. No specific
 *     numeric fee tables or star ratings, which go stale and can't be
 *     verified live from here.
 *   - `lastVerified` is shown on every page with an explicit "confirm
 *     current details on the provider's site before acting" note.
 *   - URLs are the providers' real public sign-up pages — not tracked
 *     affiliate links, since no real affiliate IDs exist yet (see
 *     lib/affiliates.ts, which uses the same plain-URL pattern).
 *   - Every pick explains *why* it's listed and *who* it's for — never a
 *     bare logo-and-link.
 */

/** The site's own rubric, same spirit as the WellFiLab Score's "show your
 * work" methodology page — 3 axes, 1-5 each, never a single invented
 * "4.8 stars" number with nothing behind it. See /learn/best/methodology
 * for the full explanation of what each axis means and how it's scored. */
export interface ComparisonRatings {
  beginnerFriendly: number;
  costSimplicity: number;
  featureBreadth: number;
}

export interface ComparisonPick {
  id: string;
  name: string;
  logo: string;
  /** A short, specific reason this pick is featured — "Best overall",
   * "Best for beginners" — so every pick (not just #1) has a real reason
   * to be the right click for someone, the same multi-winner pattern every
   * major comparison site uses instead of a single ranked list. */
  badge: string;
  tagline: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  ratings: ComparisonRatings;
  url: string;
  cta: string;
}

/** Derived, never hand-set — the overall star rating is always the real
 * average of the 3 scored axes, rounded to the nearest half star. */
export function overallRating(r: ComparisonRatings): number {
  const avg = (r.beginnerFriendly + r.costSimplicity + r.featureBreadth) / 3;
  return Math.round(avg * 2) / 2;
}

export interface ComparisonQuizQuestion {
  question: string;
  options: { label: string; pickId: string }[];
}

export interface ComparisonPost {
  slug: string;
  title: string;
  dek: string;
  category: 'investing' | 'insurance' | 'banking' | 'credit';
  lastVerified: string; // ISO date
  topPickId: string;
  picks: ComparisonPick[];
  comparisonRows: { label: string; values: Record<string, string> }[];
  whyWeRecommend: string;
  /** A single quick question that routes straight to a pick — a lighter,
   * more honest version of a "personalized recommendation" quiz: every
   * option is just one of the real picks' own `bestFor` reframed as a
   * choice, not a hidden scoring model. */
  quiz?: ComparisonQuizQuestion;
  faq: { q: string; a: string }[];
  relatedCalcSlug?: string;
  relatedCalcCat?: 'health' | 'finance';
  relatedGuideSlug?: string;
}

export const COMPARISONS: ComparisonPost[] = [
  {
    slug: 'best-investing-apps-india',
    title: 'Best Investing Apps in India',
    dek: 'For a first SIP or your first direct mutual fund — three real platforms, compared on what actually matters when you\'re starting out.',
    category: 'investing',
    lastVerified: '2026-10-31',
    topPickId: 'zerodha',
    picks: [
      {
        id: 'zerodha', name: 'Zerodha', logo: '📈', badge: 'Best overall',
        tagline: "India's largest stockbroker by active client count",
        bestFor: 'Someone who wants one account for both direct mutual funds and stocks, and is comfortable with a slightly more functional, less hand-held interface.',
        pros: [
          'Zero brokerage on equity delivery trades, a flat low fee on intraday/F&O',
          'One account covers both stocks and direct mutual funds (via Coin)',
          'Large, active user base means more community tutorials and third-party tools built around it',
        ],
        cons: [
          'Interface is more utilitarian than consumer-app-polished — a steeper first-week learning curve',
          'No in-house financial advisory — you\'re expected to make your own calls',
        ],
        ratings: { beginnerFriendly: 3, costSimplicity: 4, featureBreadth: 5 },
        url: 'https://zerodha.com/open-account', cta: 'Open a free account →',
      },
      {
        id: 'groww', name: 'Groww', logo: '🌱', badge: 'Best for beginners',
        tagline: 'The most beginner-friendly mainstream investing app',
        bestFor: 'A first-time investor who wants the simplest possible path from "I want to start a SIP" to actually starting one, with minimal jargon.',
        pros: [
          'Clean, mobile-first UI built around a first-time user, not a trader',
          'Fast account opening, entirely digital, no paperwork',
          'Mutual funds and stocks in one simple app',
        ],
        cons: [
          'Fewer advanced trading/charting tools than a trader-oriented platform',
          'Less third-party tooling built around it compared to larger platforms',
        ],
        ratings: { beginnerFriendly: 5, costSimplicity: 4, featureBreadth: 4 },
        url: 'https://groww.in', cta: 'Start investing →',
      },
      {
        id: 'kuvera', name: 'Kuvera', logo: '💰', badge: 'Best for SIP-only investors',
        tagline: 'A direct-mutual-fund-only platform — no stocks, no distractions',
        bestFor: 'Someone who only wants to run SIPs in direct mutual funds, and would rather not have a stock-trading screen as a temptation at all.',
        pros: [
          'Direct plans only — typically a lower ongoing expense ratio than the "regular" plans sold with a commission baked in',
          'Goal-based SIP tools built specifically around mutual-fund investing, not bolted onto a trading app',
          'Free to use for direct mutual fund investing',
        ],
        cons: [
          'No stock trading at all — you\'ll need a separate account if you ever want that',
          'Smaller company, shorter track record than the two above',
        ],
        ratings: { beginnerFriendly: 4, costSimplicity: 5, featureBreadth: 2 },
        url: 'https://kuvera.in', cta: 'Start free →',
      },
    ],
    comparisonRows: [
      { label: 'Direct mutual funds', values: { zerodha: 'Yes, via Coin', groww: 'Yes', kuvera: 'Yes — its core product' } },
      { label: 'Stock trading', values: { zerodha: 'Yes', groww: 'Yes', kuvera: 'No' } },
      { label: 'Account opening', values: { zerodha: 'Fully digital', groww: 'Fully digital', kuvera: 'Fully digital' } },
      { label: 'Best suited for', values: { zerodha: 'Stocks + funds, one account', groww: 'First-time investors', kuvera: 'SIP-only, no trading temptation' } },
    ],
    whyWeRecommend: 'All three are real, widely-used platforms with no account-opening cost. The right one depends on whether you ever want to buy individual stocks (Zerodha or Groww) or specifically want a mutual-fund-only app with nothing else to distract you (Kuvera) — not on which one is "best" in the abstract. Run the numbers on our SIP calculator first so you know your target monthly amount before you open any account.',
    quiz: {
      question: 'What matters most to you right now?',
      options: [
        { label: 'The simplest possible app to start a SIP', pickId: 'groww' },
        { label: 'One account for both stocks and mutual funds', pickId: 'zerodha' },
        { label: 'Only mutual funds — no stock-trading temptation', pickId: 'kuvera' },
      ],
    },
    faq: [
      { q: 'Do any of these charge a fee just to open an account?', a: 'All three offer free account opening as of when this page was last checked — confirm on the provider\'s own site, since fee structures do change.' },
      { q: 'Can I switch platforms later if I change my mind?', a: 'Yes — mutual fund units and demat holdings are portable between brokers/platforms in India, though the process takes some paperwork. It\'s not a permanent decision.' },
      { q: 'Which one does WellFiLab actually recommend?', a: 'We don\'t push one over the others — the comparison above is meant to help you pick based on your own situation, not steer you toward whichever pays the highest commission.' },
    ],
    relatedCalcSlug: 'sip', relatedCalcCat: 'finance',
    relatedGuideSlug: 'how-to-invest-first-salary',
  },
];

export function getComparison(slug: string): ComparisonPost | undefined {
  return COMPARISONS.find(c => c.slug === slug);
}
