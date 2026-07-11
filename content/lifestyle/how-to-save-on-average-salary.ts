import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'how-to-save-on-average-salary',
  title: 'How to Save Money on an Average Indian Salary: A Realistic Guide',
  excerpt: 'With rent, EMIs, family obligations, and rising prices, saving on ₹30,000–60,000 per month feels impossible. Here is a framework that actually works.',
  category: 'lifestyle',
  tag: 'Lifestyle',
  icon: '💵',
  readTime: 9,
  date: '2024-10-05',
  tags: ['saving money India', 'budget tips India', 'financial planning'],
  hwtCalc: { label: 'Savings Goal Calculator', url: `${H}/finance/savings-goal` },
  body: [
    { type: 'intro', text: 'The average Indian salary is approximately 25,000 to 40,000 rupees per month in urban areas. After rent, food, transport, utilities, and family obligations, many people genuinely have little left. The financial advice industry largely ignores this reality, defaulting to advice about cutting lattes that does not meaningfully move the needle at this income level.' },

    { type: 'h2', text: 'The largest expenses and what can actually be changed' },
    { type: 'table', table: {
      headers: ['Expense category', 'Typical share of income', 'Realistic lever'],
      rows: [
        ['Housing', '30–50%', 'A flatmate cuts cost by 40–50%; moving slightly further out with good transport cuts rent 20–35%'],
        ['Food delivery', 'Varies widely', 'Reducing delivery from daily to 2–3×/week saves roughly ₹2,000–4,000/month'],
        ['Subscriptions', '₹800–1,500/month typically wasted', 'A monthly audit usually finds 2–4 forgotten or unused subscriptions'],
      ],
    } },

    { type: 'h2', text: 'Where small savings amounts actually go' },
    { type: 'chart', chart: {
      kind: 'bar',
      title: 'A SIP from age 25 to 45 at 10% CAGR — even modest amounts compound meaningfully',
      unit: '',
      bars: [
        { label: '₹500/month', value: 382848, display: '≈ ₹3.83 lakh' },
        { label: '₹2,000/month', value: 1531394, display: '≈ ₹15.3 lakh' },
      ],
    } },
    { type: 'p', text: 'The primary task at low income is establishing the habit, not optimising the exact amount. Someone who starts with even 500 rupees per month and stays consistent for 20 years builds a meaningfully larger sum than someone who waits for a "real" amount to start with and never begins.' },

    { type: 'h2', text: 'A practical approach for tight budgets' },
    { type: 'steps', steps: [
      { title: 'Track actual spending for one month', detail: 'Most people are surprised by where the money is actually going, especially on food delivery and subscriptions.' },
      { title: 'Tackle housing first if it dominates the budget', detail: 'This is the single largest lever — even a partial change (flatmate, slightly different location) moves more than any other single decision.' },
      { title: 'Automate whatever amount you can, even if small', detail: 'Consistency matters more than size at this stage.' },
      { title: 'Increase the amount with every raise', detail: 'Rather than letting the entire increase get absorbed into lifestyle spending.' },
    ] },

    { type: 'quote', text: 'At this income level, the goal is not optimization. It is starting the habit before life gets more expensive, not less.' },

    { type: 'callout', text: 'Calculate how long it will take to reach your savings goal at different monthly saving rates.' },
  ],
};

export default post;
