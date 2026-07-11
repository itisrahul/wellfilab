import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'compound-interest-complete-guide',
  title: 'Compound Interest: The Mathematical Force Behind Every Great Fortune',
  excerpt: "Einstein's eighth wonder of the world is not a metaphor. This guide explains the precise mathematics of compounding and how to harness it before time runs out.",
  category: 'finance',
  tag: 'Investing',
  icon: '📈',
  readTime: 12,
  date: '2024-12-02',
  tags: ['compound interest', 'investing', 'wealth building', 'Rule of 72'],
  hwtCalc: { label: 'Compound Interest Calculator', url: `${H}/finance/compound` },
  body: [
    { type: 'intro', text: 'In 1626, Peter Minuit purchased Manhattan Island for 60 guilders. Had those 60 guilders been invested at 8% per annum, they would be worth an almost incomprehensible sum today. The number itself is a curiosity, but the underlying mechanism is the single most important mathematical concept in personal finance, because it is the engine behind every long-term wealth outcome that does not involve luck or inheritance.' },

    { type: 'h2', text: 'Simple vs compound interest — the same starting numbers, very different endings' },
    { type: 'chart', chart: {
      kind: 'line',
      title: '₹1,00,000 at 10% annual return — simple vs compound, over 30 years',
      xLabels: ['0', '5', '10', '15', '20', '25', '30'],
      series: [
        { name: 'Simple interest', color: '#94a3b8', values: [100000, 150000, 200000, 250000, 300000, 350000, 400000] },
        { name: 'Compound interest', color: '#14b8a6', values: [100000, 161051, 259374, 417725, 672750, 1083471, 1744940] },
      ],
    } },
    { type: 'p', text: 'Simple interest earns a fixed return on the original principal only, every period. Compound interest earns a return on the principal plus all previously accumulated interest. As the chart shows, the two start identically but diverge dramatically — by year 30, compounding has produced more than four times the result of simple interest on the exact same principal and rate.' },

    { type: 'h2', text: 'The Rule of 72' },
    { type: 'p', text: 'A useful mental shortcut: divide 72 by your annual return rate to estimate the years required to double your investment.' },
    { type: 'table', table: {
      headers: ['Annual return', 'Years to double (Rule of 72)'],
      rows: [
        ['6%', '~12 years'],
        ['9%', '~8 years'],
        ['12%', '~6 years'],
      ],
    } },
    { type: 'p', text: 'The same rule applies in reverse to inflation eroding purchasing power — at 6% inflation, the real value of cash sitting idle halves roughly every 12 years, which is why holding large sums in non-growing assets is itself a compounding problem, just working against you.' },

    { type: 'h2', text: 'The time penalty: what waiting actually costs you' },
    { type: 'comparison', comparison: {
      title: 'Starting at 25 vs starting at 35 — same monthly amount',
      optionA: {
        label: 'Riya: invests ₹5,000/month, age 25–35 only, then stops',
        points: ['Total contributed: ₹6,00,000 over 10 years', 'Then lets it sit invested, untouched, for 25 more years', 'Value at age 60 (at 10% return): ≈ ₹2.06 crore'],
      },
      optionB: {
        label: 'Arun: invests ₹5,000/month, age 35–60, continuously',
        points: ['Total contributed: ₹15,00,000 over 25 years — 2.5× more than Riya', 'Invests for 25 straight years instead of 10', 'Value at age 60 (at 10% return): ≈ ₹1.95 crore'],
      },
    } },
    { type: 'p', text: 'Riya invested for only 10 years and contributed less than half as much money as Arun, yet ends up with slightly more — purely because her money had 25 extra years to compound. This is the clearest illustration of why the most expensive financial mistake most people make is a delayed start, not a bad investment choice.' },

    { type: 'quote', text: 'The best time to start investing was 20 years ago. The second best time is today.' },

    { type: 'h2', text: 'Indian investment vehicles and how they compound differently' },
    { type: 'table', table: {
      headers: ['Instrument', 'Typical rate', 'Compounding', 'Tax treatment'],
      rows: [
        ['PPF', '~7.1%', 'Annual', 'Fully tax-free (EEE)'],
        ['EPF', '~8.15%', 'Annual', 'Tax-free after 5 years'],
        ['Fixed Deposit', '6–7.5%', 'Quarterly', 'Fully taxable'],
        ['Equity mutual funds', '10–12% (historical avg.)', 'Continuous, market-linked', 'LTCG 12.5% above ₹1.25L exemption'],
      ],
    } },

    { type: 'h2', text: 'Why compounding accelerates rather than grows in a straight line' },
    { type: 'p', text: 'A common misunderstanding is expecting compound growth to look like a steady, linear climb. It does not — the curve is flat-looking for years before becoming visibly steep, simply because the absolute amount of interest generated each year depends on a growing base. The first few years of any compounding investment produce relatively little visible growth, which is exactly why so many people give up early, right before the effect becomes dramatic.' },

    { type: 'h2', text: 'Putting this into practice' },
    { type: 'steps', steps: [
      { title: 'Start now, even with a small amount', detail: 'The specific instrument matters far less than the number of years the money is given to compound.' },
      { title: 'Avoid unnecessary withdrawals', detail: 'Each withdrawal interrupts the compounding base and effectively restarts part of the clock.' },
      { title: 'Increase contributions as income grows', detail: 'Rather than waiting for a "better" moment to start that may never arrive.' },
      { title: 'Match the instrument to the timeline', detail: 'Equity for goals 7+ years away, safer instruments for shorter horizons.' },
    ] },

    { type: 'callout', text: 'See exactly what your money grows to — with monthly breakdown, chart, and CSV download.' },
  ],
};

export default post;
