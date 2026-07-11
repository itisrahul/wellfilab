import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'inflation-impact-savings',
  title: 'Inflation and Your Money: Why Your Savings Are Losing Value Right Now',
  excerpt: 'At 6% inflation, every ₹1 lakh in your bank account becomes worth roughly ₹55,839 in real terms after 10 years. Here is how to fight the invisible tax on cash.',
  category: 'finance',
  tag: 'Finance',
  icon: '📉',
  readTime: 10,
  date: '2024-10-22',
  tags: ['inflation', 'purchasing power', 'real returns', 'savings account'],
  hwtCalc: { label: 'Inflation Calculator', url: `${H}/finance/inflation` },
  body: [
    { type: 'intro', text: 'In 2004, a litre of petrol in Delhi cost roughly 34 rupees. Two decades later, that same litre costs well over double, even after accounting for occasional tax cuts and price freezes along the way. Money sitting in a savings account earning a modest interest rate over that same period effectively lost purchasing power every single year, even though the number printed on the bank statement kept growing.' },

    { type: 'stat-row', stats: [
      { label: '₹1 lakh today', value: '₹1,00,000', color: 'teal' },
      { label: 'Same buying power, 10 yrs @ 6% inflation', value: '₹55,839', color: 'red' },
      { label: 'Effective loss in purchasing power', value: '44%', color: 'red' },
    ] },

    { type: 'h2', text: 'Real returns vs nominal returns — the distinction that actually matters' },
    { type: 'p', text: 'A nominal return is the number your bank or investment statement shows you. A real return subtracts the effect of inflation, revealing what your money is actually worth in terms of what it can buy.' },

    { type: 'table', table: {
      headers: ['Instrument', 'Nominal return', 'Inflation', 'Real return'],
      rows: [
        ['Savings account', '3.5%', '6%', '−2.4%'],
        ['Fixed deposit', '7%', '6%', '+0.9%'],
        ['PPF', '7.1%', '6%', '+1.0%'],
        ['Equity index fund (historical avg.)', '12%', '6%', '+5.7%'],
      ],
    } },

    { type: 'h2', text: 'Why this matters more for cash than people assume' },
    { type: 'p', text: 'Holding a large cash buffer feels safe precisely because the nominal number never goes down — there is no visible loss the way there would be in a market downturn. But the erosion from inflation is just as real, simply less visible, because it shows up as reduced purchasing power rather than a smaller account balance.' },

    { type: 'h2', text: 'The emergency fund dilemma' },
    { type: 'p', text: 'Emergency funds create a genuine tension: they need to remain highly liquid and low-risk, which generally means accepting a lower return that may not fully keep pace with inflation. One practical compromise is splitting the emergency fund — keeping perhaps 3 months of expenses in an ordinary savings account for instant access, and the remaining 3 months in a liquid mutual fund, which typically offers a somewhat higher return, often in the 7 to 8% range, while still allowing withdrawal within a day or two.' },

    { type: 'comparison', comparison: {
      title: 'Split emergency fund vs all-cash emergency fund',
      optionA: {
        label: 'All cash, savings account',
        points: ['Instant access, zero complexity', 'Real return roughly −2.4% at typical rates', 'Erodes steadily even while "doing its job"'],
      },
      optionB: {
        label: 'Split: 3mo savings + 3mo liquid fund',
        points: ['Still near-instant access (1–2 day withdrawal on the liquid portion)', 'Real return improves to roughly +0.9–1.9% on half the fund', 'Reduces inflation drag without sacrificing core liquidity'],
      },
    } },

    { type: 'h2', text: 'Why long-term goals should rarely sit in cash or low-yield instruments' },
    { type: 'p', text: 'For money earmarked for goals more than 5 to 7 years away, holding it primarily in cash or low-yield fixed-income instruments is itself a financial risk, even though it feels conservative — the guaranteed, slow erosion from inflation can be more damaging over a long horizon than the volatility of an equity investment that has time to recover from any short-term dips.' },

    { type: 'quote', text: 'Inflation is the only tax that requires no legislation, no enforcement, and no one to actively collect it. It simply happens to money that sits still.' },

    { type: 'h2', text: 'A practical response' },
    { type: 'steps', steps: [
      { title: 'Keep only near-term needs in cash', detail: 'Everything beyond genuine short-term liquidity needs should be earning a real, inflation-beating return.' },
      { title: 'Lean toward equity for 5+ year goals', detail: 'Specifically because of its historically stronger real return, not despite its volatility.' },
      { title: 'Question large idle cash balances', detail: 'Ask explicitly what real return they are earning after inflation, not just the nominal rate shown.' },
      { title: 'Use a split emergency fund', detail: 'To reduce inflation drag on the portion least likely to be needed on a moment\u2019s notice.' },
    ] },

    { type: 'callout', text: 'Calculate exactly how inflation erodes your money over any time period.' },
  ],
};

export default post;
