import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'home-loan-guide-india',
  title: 'Home Loan in India: Everything You Need to Know Before Signing',
  excerpt: 'A home loan is likely the largest financial commitment of your life. Most people understand very little about how interest is calculated — and it costs them lakhs.',
  category: 'finance',
  tag: 'Debt',
  icon: '🏠',
  readTime: 12,
  date: '2024-10-30',
  tags: ['home loan', 'EMI', 'mortgage India', 'prepayment'],
  hwtCalc: { label: 'Loan / EMI Calculator', url: `${H}/finance/loan` },
  body: [
    { type: 'intro', text: 'On a 50 lakh rupee home loan at 8.5% for 20 years, you will repay roughly 1.04 crore rupees — more than double what you actually borrowed. The 54 lakh rupees paid as interest buys nothing tangible at all; it is purely the cost of borrowing the money over two decades. Yet most people sign the paperwork without ever calculating this total cost, focused only on whether the monthly EMI fits their current budget.' },

    { type: 'h2', text: 'How EMI is actually calculated' },
    { type: 'table', table: {
      caption: '₹50 lakh loan, 8.5% interest, 20-year tenure',
      headers: ['Metric', 'Amount'],
      rows: [
        ['Monthly EMI', '₹43,391'],
        ['Total amount repaid over 20 years', '₹1,04,13,879'],
        ['Total interest paid', '₹54,13,879'],
        ['Interest as % of loan amount', '108%'],
      ],
    } },
    { type: 'p', text: 'In the early years of a 20-year loan, the overwhelming majority of each EMI payment goes toward interest, not principal, because interest is calculated on the full outstanding balance, which is still close to the original loan amount. This is why making extra payments early in the loan term has a dramatically larger effect on total interest than the same extra payments made near the end.' },

    { type: 'h2', text: 'Fixed vs floating rates' },
    { type: 'comparison', comparison: {
      title: 'Fixed vs floating rate, for a loan longer than 5 years',
      optionA: {
        label: 'Fixed rate',
        points: ['Rate locked for the agreed period, fully predictable EMI', 'Typically 0.25–0.5% higher than the floating rate at sanction', 'Protects against rate increases, but you also miss out on rate decreases'],
      },
      optionB: {
        label: 'Floating rate',
        points: ['Starts 0.25–0.5% lower than the equivalent fixed rate', 'EMI can rise or fall as the benchmark rate moves', 'Over a 20-year, ₹50L loan, even a 0.5% lower start can mean ₹8–12L less interest paid'],
        verdict: 'Most financial analysts favour floating for loans longer than 5 years',
      },
    } },

    { type: 'h2', text: 'Prepayment: the highest-return investment available to most borrowers' },
    { type: 'p', text: 'Prepaying a home loan is, in effect, a risk-free return exactly equal to your loan\u2019s interest rate — in this example, a guaranteed 8.5%, which beats most FD rates and even PPF once tax is accounted for, with zero market risk involved.' },

    { type: 'chart', chart: {
      kind: 'bar',
      title: 'Extra ₹5,000/month on a ₹50L, 8.5%, 20-year loan',
      unit: '',
      bars: [
        { label: 'Total interest — standard EMI only', value: 5413879, display: '₹54.1 lakh' },
        { label: 'Total interest — with ₹5,000/mo extra', value: 4024629, display: '₹40.2 lakh' },
      ],
    } },
    { type: 'p', text: 'An extra 5,000 rupees per month on this loan saves roughly 13.9 lakh rupees in total interest and clears the loan about 4.4 years early — turning a 20-year commitment into roughly 15.6 years. Most home loans in India allow prepayment without penalty on floating-rate loans, making this one of the few genuinely "free" financial optimizations available.' },

    { type: 'h2', text: 'Tax benefits: Section 24 and Section 80C' },
    { type: 'p', text: 'Under the old tax regime, Section 24(b) allows a deduction of up to 2 lakh rupees annually on home loan interest for a self-occupied property. Section 80C separately allows a deduction of up to 1.5 lakh rupees annually on the principal repayment portion of your EMI, though this falls within the same overall 80C limit shared with other instruments like PPF and ELSS, so it is not automatically additive on top of everything else you might already be claiming.' },

    { type: 'h2', text: 'Choosing the right loan tenure' },
    { type: 'p', text: 'A longer tenure reduces the monthly EMI but substantially increases total interest paid over the life of the loan, while a shorter tenure does the reverse. The right choice depends on whether you can comfortably afford the higher EMI of a shorter tenure without straining your monthly budget — if you can, the interest savings are usually substantial enough to justify the higher monthly commitment.' },

    { type: 'quote', text: 'A home loan is the one debt most people take on without ever calculating its true total cost. That single omission is often the most expensive financial mistake of a lifetime.' },

    { type: 'h2', text: 'Before you sign' },
    { type: 'steps', steps: [
      { title: 'Calculate total interest, not just the EMI', detail: 'Compare the full cost over the entire tenure before comparing offers from different lenders.' },
      { title: 'Compare floating vs fixed explicitly', detail: 'Factor in your own risk tolerance for future rate increases.' },
      { title: 'Check for prepayment penalties', detail: 'Even though most floating-rate loans in India do not carry them, confirm this directly.' },
      { title: 'Model a modest extra monthly payment', detail: 'Before deciding it is not worth the effort — the savings are usually larger than expected.' },
    ] },

    { type: 'callout', text: 'Calculate your EMI, total interest cost, and see how extra payments could save you lakhs.' },
  ],
};

export default post;
