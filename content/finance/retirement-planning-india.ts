import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'retirement-planning-india',
  title: 'Retirement Planning in India: The Complete Decade-by-Decade Guide',
  excerpt: 'India has no universal pension system. The responsibility falls entirely on individuals. Here is a roadmap that actually works.',
  category: 'finance',
  tag: 'Retirement',
  icon: '🌅',
  readTime: 14,
  date: '2024-11-12',
  tags: ['retirement planning', 'NPS', 'EPF', 'PPF', 'pension'],
  hwtCalc: { label: 'Retirement Calculator', url: `${H}/finance/retirement` },
  body: [
    { type: 'intro', text: 'India\u2019s workforce of roughly 500 million people has formal pension coverage for fewer than 15% of them. The vast majority of Indian retirees either depend on family support or on whatever they personally managed to accumulate over their working years. As nuclear families become more common and life expectancy continues to rise, this gap between traditional family-based support and an individual\u2019s own savings becomes an increasingly acute and urgent planning problem.' },

    { type: 'h2', text: 'How much corpus do you actually need?' },
    { type: 'p', text: 'A widely used starting point is the 25x rule: your retirement corpus should be roughly 25 times your expected annual expenses, expressed in today\u2019s rupees, then adjusted forward for inflation between now and retirement.' },

    { type: 'table', table: {
      caption: 'Example: someone expecting to spend ₹60,000/month in retirement, in today\u2019s money',
      headers: ['Step', 'Calculation', 'Result'],
      rows: [
        ['Monthly expense (today\u2019s value)', '—', '₹60,000'],
        ['Annual expense (today\u2019s value)', '× 12', '₹7,20,000'],
        ['Corpus needed (today\u2019s value, 25x rule)', '× 25', '₹1.8 crore'],
        ['Corpus needed (adjusted for 25 yrs @ 6% inflation)', '× ~4.3', '≈ ₹7.7 crore'],
      ],
    } },
    { type: 'p', text: 'Adjusted forward for 25 years of 6% inflation before you actually retire, the real target becomes closer to 7.7 crore rupees — a figure that surprises most people the first time they calculate it honestly.' },

    { type: 'h2', text: 'Why India needs a different inflation assumption than Western retirement guides' },
    { type: 'p', text: 'Most Western retirement planning content assumes 2 to 3% long-run inflation. Indian inflation has averaged closer to 6 to 7% over the past two decades. At 6% inflation, prices broadly double every 12 years, which means a 30-year retirement horizon could see prices increase by a factor of 4 to 5 times from where they started. This is why Indian-specific retirement planning typically recommends a more conservative 3 to 4% safe withdrawal rate, rather than the 4% commonly cited in US-centric content.' },

    { type: 'h2', text: 'The Indian retirement toolkit' },
    { type: 'comparison', comparison: {
      title: 'Guaranteed-return tools vs market-linked tools',
      optionA: {
        label: 'EPF + PPF (guaranteed, government-backed)',
        points: [
          'EPF: ~8.15%, employer + employee each contribute 12% of basic, tax-free after 5 years',
          'PPF: ~7.1%, EEE tax status, 1.5L annual cap, 15-year lock-in',
          'Zero market risk — the stable core of a plan',
        ],
      },
      optionB: {
        label: 'NPS + ELSS (market-linked, higher potential growth)',
        points: [
          'NPS: market-linked returns, extra ₹50,000 deduction under 80CCD(1B), low fund management fees',
          'ELSS: 80C benefit, 3-year lock-in, historically 10–13% CAGR',
          'Carries volatility, but historically outpaces inflation by a wider margin',
        ],
      },
    } },

    { type: 'h2', text: 'Decade-by-decade action plan' },
    { type: 'h3', text: 'Your 20s' },
    { type: 'p', text: 'Maximise EPF contributions automatically through your salary, open an NPS account even with a modest contribution, and start a SIP of 2,000 to 5,000 rupees per month as early as possible. Eliminate any high-interest debt, particularly credit cards, before this decade ends.' },
    { type: 'h3', text: 'Your 30s' },
    { type: 'p', text: 'Increase your SIP contribution by roughly 10% each year as income grows. Fully utilise both the 80C limit and the additional 80CCD(1B) NPS deduction. Build a 6-month emergency fund if you have not already.' },
    { type: 'h3', text: 'Your 40s' },
    { type: 'p', text: 'Reassess your corpus target with more accurate numbers. Consciously resist lifestyle inflation creeping further upward, since every rupee of additional fixed monthly expense raises your eventual corpus target by roughly 25 times that amount. Begin planning specifically for post-retirement health insurance.' },
    { type: 'h3', text: 'Your 50s' },
    { type: 'p', text: 'Begin shifting 20 to 30% of your corpus toward debt funds and other lower-volatility instruments, reducing the risk of a market downturn hitting right before you need to start withdrawing.' },

    { type: 'chart', chart: {
      kind: 'bar',
      title: 'Suggested equity allocation glide path by decade',
      unit: '%',
      bars: [
        { label: '20s', value: 80, display: '80% equity' },
        { label: '30s', value: 75, display: '75% equity' },
        { label: '40s', value: 65, display: '65% equity' },
        { label: '50s', value: 50, display: '50% equity' },
        { label: 'At retirement', value: 30, display: '30% equity' },
      ],
    } },

    { type: 'h2', text: 'A retirement plan is not just an investment plan' },
    { type: 'p', text: 'Two components are frequently underweighted relative to their actual importance: health insurance that extends well past employment, since medical costs are one of the largest unplanned expense categories in retirement, and an explicit plan for where you will actually live and what your monthly cost of living will be in that specific location.' },

    { type: 'quote', text: 'Retirement planning is not about denying yourself today. It is about ensuring you do not have to work in your 70s because you spent everything in your 30s.' },

    { type: 'h2', text: 'Revisiting the plan regularly' },
    { type: 'p', text: 'A retirement number calculated once in your 30s and never revisited becomes increasingly inaccurate as actual inflation, income growth, and lifestyle expectations diverge from the original assumptions. Recalculating every few years, particularly after major life events, keeps the target grounded in your actual trajectory rather than an outdated estimate.' },

    { type: 'callout', text: 'Calculate exactly how much you need to save monthly to retire on your terms.' },
  ],
};

export default post;
