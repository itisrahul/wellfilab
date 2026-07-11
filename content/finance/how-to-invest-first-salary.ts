import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'how-to-invest-first-salary',
  title: 'How to Invest Your First Salary: A Complete Step-by-Step Guide',
  excerpt: 'The decisions you make with your first salary set the trajectory for the next 30 years. Here are the exact steps to take in your first 90 days of employment.',
  category: 'finance',
  tag: 'Investing',
  icon: '🚀',
  readTime: 11,
  date: '2024-07-25',
  tags: ['first salary', 'investing for beginners India', 'SIP beginners'],
  hwtCalc: { label: 'SIP Calculator', url: `${H}/finance/sip` },
  body: [
    { type: 'intro', text: 'The most valuable financial decision a 22-year-old can make is not about which specific fund to pick or how to optimise taxes. It is simply this: start investing immediately, in anything reasonable, and do not stop. 3,000 rupees invested per month from age 22 grows to more by age 55 than 10,000 rupees per month started at age 32 — even though the second person invested more than three times as much total money over their working life.' },

    { type: 'h2', text: 'Month 1: building the foundation' },
    { type: 'steps', steps: [
      { title: 'Confirm your salary bank account', detail: 'Ensure it offers a reasonable savings interest rate rather than the minimum default.' },
      { title: 'Verify EPF activation', detail: 'Confirm directly with HR in your first month — this is often assumed to happen automatically.' },
      { title: 'Get term insurance only if you have dependents', detail: 'A 1 crore rupee cover for a healthy 22-year-old typically costs only 6,000 to 10,000 rupees per year.' },
      { title: 'Resist investing beyond an emergency fund yet', detail: 'Spend this first month genuinely understanding your actual monthly expenses before committing to investment amounts.' },
    ] },

    { type: 'h2', text: 'Months 2 to 3: acting on your first real expense data' },
    { type: 'steps', steps: [
      { title: 'Build a 3-month emergency fund', detail: 'Ideally in a liquid mutual fund rather than a regular savings account, for a modestly better return with next-day access.' },
      { title: 'Start a SIP of ₹2,000–5,000/month', detail: 'In a low-cost Nifty 50 index fund — simple, transparent, and a reasonable default while you are still learning.' },
      { title: 'Activate NPS if your employer offers it', detail: 'As part of your CTC structure — an often underused benefit that effectively adds free retirement contribution.' },
      { title: 'Explore independent health insurance', detail: 'If employer-provided cover feels insufficient, or you want continuity that does not depend on staying with the same employer.' },
    ] },

    { type: 'h2', text: 'What to avoid in the first year' },
    { type: 'comparison', comparison: {
      title: 'What feels safe vs what actually works',
      optionA: {
        label: 'Common first-year mistakes',
        points: [
          'ULIPs: typically 5–7% returns, bundled with illiquidity',
          'Endowment/money-back insurance: typically 4–6% returns, often below inflation',
          'Trading individual stocks without experience',
        ],
        verdict: 'Feels productive, usually underperforms simpler options',
      },
      optionB: {
        label: 'A simpler, more effective default',
        points: [
          'Term insurance (if dependents exist) + separate investing',
          'Low-cost index fund SIP, started immediately',
          'Building the savings habit before optimising the strategy',
        ],
        verdict: 'Less exciting, historically performs better',
      },
    } },

    { type: 'h2', text: 'Why starting early matters more than starting optimally' },
    { type: 'p', text: 'A frequent trap for first-time investors is spending months researching the "perfect" fund or strategy before investing anything at all. The cost of this delay, measured in lost compounding time, is almost always larger than the difference between a reasonable choice made immediately and a marginally better choice made six months later after exhaustive research.' },

    { type: 'quote', text: 'Your first salary will not be your largest. But it can start the longest compounding runway you will ever have.' },

    { type: 'h2', text: 'A realistic checklist for your first 90 days' },
    { type: 'ol', items: [
      'Confirm EPF activation and understand your monthly deduction.',
      'Track actual expenses for one full month before setting investment amounts.',
      'Open a liquid fund and build a 3-month emergency cushion.',
      'Start a modest SIP in a low-cost index fund, even if the amount feels small.',
      'Get term insurance only if you have dependents who rely on your income.',
      'Avoid ULIPs, endowment policies, and individual stock trading until you have more experience.',
    ] },

    { type: 'callout', text: 'See how much your monthly SIP grows over 30 years.' },
  ],
};

export default post;
