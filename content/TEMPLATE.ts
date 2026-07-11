/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  HOW TO WRITE A NEW POST                                     ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  1. Copy this file to the right category folder:             ║
 * ║       content/health/your-post-slug.ts                       ║
 * ║       content/finance/your-post-slug.ts                      ║
 * ║       content/nutrition/your-post-slug.ts                    ║
 * ║       content/lifestyle/your-post-slug.ts                    ║
 * ║                                                              ║
 * ║  2. Fill in the fields below                                 ║
 * ║                                                              ║
 * ║  3. Add one import line to that category's index.ts:         ║
 * ║       import your_post_slug from './your-post-slug';         ║
 * ║       const posts = [..., your_post_slug];                   ║
 * ║                                                              ║
 * ║  4. Done — post appears on site, sitemap, and search         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * BODY SECTION TYPES:
 *   intro   — first paragraph, slightly larger text
 *   h2      — main section heading
 *   h3      — sub-section heading
 *   p       — regular paragraph
 *   ul      — bullet list  (use items: [...])
 *   ol      — numbered list (use items: [...])
 *   quote   — pull quote, displayed prominently
 *   callout — calculator CTA box (links to hwtCalc automatically)
 *
 * CATEGORY OPTIONS:  'health' | 'finance' | 'nutrition' | 'lifestyle'
 *
 * CALCULATOR URLS (hwtCalc):
 *   Health:  health/bmi  health/calories  health/sleep  health/heart-rate
 *            health/body-fat  health/water  health/macros  health/weight-loss
 *            health/steps  health/calories-burned  health/age  health/due-date
 *   Finance: finance/compound  finance/sip  finance/loan  finance/retirement
 *            finance/fire  finance/budget  finance/net-worth  finance/debt-payoff
 *            finance/income-tax  finance/salary  finance/inflation  finance/gst
 *            finance/currency  finance/tip  finance/savings-goal
 */

import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  // ── Required fields ────────────────────────────────────────────
  slug:     'your-post-slug',               // must match the filename
  title:    'Your Post Title Here',
  excerpt:  'A 1–2 sentence summary shown on cards and in Google search results.',
  category: 'health',                       // health | finance | nutrition | lifestyle
  tag:      'Weight Loss',                  // short label shown as a badge
  icon:     '🏃',                           // single emoji
  readTime: 7,                              // estimated minutes to read
  date:     '2025-01-15',                   // YYYY-MM-DD

  // ── Tags for SEO ───────────────────────────────────────────────
  tags: ['tag one', 'tag two', 'tag three'],

  // ── Calculator link (shown as CTA inside article) ─────────────
  hwtCalc: { label: 'Calculator Name', url: `${H}/health/calories` },

  // ── Article body ───────────────────────────────────────────────
  body: [
    {
      type: 'intro',
      text: 'The opening paragraph. Make it punchy — state the problem or surprising fact that makes this article worth reading.',
    },
    {
      type: 'h2',
      text: 'First Section Heading',
    },
    {
      type: 'p',
      text: 'A paragraph of content. Each paragraph is its own object.',
    },
    {
      type: 'ul',
      items: [
        'First bullet point — be specific, include numbers where possible',
        'Second bullet point',
        'Third bullet point',
      ],
    },
    {
      type: 'h2',
      text: 'Second Section Heading',
    },
    {
      type: 'p',
      text: 'Another paragraph.',
    },
    {
      type: 'ol',
      items: [
        'Step one: do this',
        'Step two: do that',
        'Step three: result',
      ],
    },
    {
      type: 'quote',
      text: 'A memorable quote or key insight worth highlighting.',
    },
    {
      type: 'h2',
      text: 'Final Section',
    },
    {
      type: 'p',
      text: 'Final paragraph before the callout.',
    },
    {
      type: 'callout',
      text: 'Short description of what the calculator does. This appears inside the calculator CTA box.',
    },
  ],
};

export default post;
