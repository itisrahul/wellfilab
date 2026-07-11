import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'tax-saving-guide-india',
  title: 'Tax Saving in India: Every Legitimate Deduction You Should Be Using',
  excerpt: 'The average salaried employee leaves ₹20,000–60,000 in legitimate deductions unused every year. This covers every major deduction under the old tax regime.',
  category: 'finance',
  tag: 'Finance',
  icon: '🧾',
  readTime: 12,
  date: '2024-10-08',
  tags: ['tax saving', '80C', 'Section 80D', 'HRA', 'NPS', 'income tax India'],
  hwtCalc: { label: 'Income Tax Calculator', url: `${H}/finance/income-tax` },
  body: [
    { type: 'intro', text: 'The Indian Income Tax Act contains over 100 sections providing deductions, exemptions, and benefits. Most salaried employees are aware of Section 80C and very little else, and the result is consistent overpayment by people who could legally retain thousands of rupees more each year simply by claiming what they are already entitled to. Everything below applies specifically to the old tax regime, which still tends to win for many salaried individuals with income above roughly 7 lakh rupees once deductions are fully utilised.' },

    { type: 'table', table: {
      caption: 'Key deductions at a glance — old tax regime only',
      headers: ['Section', 'What it covers', 'Max deduction'],
      rows: [
        ['80C', 'ELSS, PPF, EPF, life insurance, home loan principal', '₹1,50,000 (combined cap)'],
        ['80D (self + family)', 'Health insurance premium', '₹25,000 (₹50,000 if senior citizen)'],
        ['80D (parents)', 'Health insurance premium for parents', '₹25,000 (₹50,000 if senior citizen parents)'],
        ['80CCD(1B)', 'NPS Tier-1 contribution', '₹50,000 (separate from 80C)'],
        ['HRA exemption', 'House Rent Allowance', 'Least of 3 conditions — see below'],
      ],
    } },

    { type: 'h2', text: 'Section 80C — the 1.5 lakh rupee limit most people only partially use' },
    { type: 'ul', items: [
      'ELSS mutual funds: The instrument with the strongest return potential within 80C, with a relatively short 3-year lock-in and market-linked growth.',
      'EPF and PPF contributions: Risk-free, government-backed, and guaranteed at their stated rates.',
      'Life insurance premiums: Qualify only if the annual premium is 10% or less of the policy\u2019s sum assured — a detail many people miss.',
      'Home loan principal repayment: Qualifies under 80C, but only from the point of possession onward.',
    ] },
    { type: 'p', text: 'The 1.5 lakh rupee cap is shared across all of these instruments combined, not per instrument — a common point of confusion. Once you have identified which combination already fills this limit through existing EPF and insurance, additional 80C investments beyond that point provide no further tax benefit.' },

    { type: 'h2', text: 'Section 80D — health insurance, a frequently underused 1,00,000 rupee opportunity' },
    { type: 'p', text: 'Individuals below 60 can claim up to 25,000 rupees for health insurance premiums covering themselves, a spouse, and dependent children. A separate, additional deduction of 25,000 rupees is available for premiums paid for parents below 60, rising to 50,000 rupees if those parents are senior citizens.' },

    { type: 'stat-row', stats: [
      { label: 'Self + family (under 60)', value: '₹25,000', color: 'teal' },
      { label: 'Parents (under 60)', value: '₹25,000', color: 'teal' },
      { label: 'Parents (senior citizen)', value: '₹50,000', color: 'amber' },
      { label: 'Max combined possible', value: '₹1,00,000', color: 'green' },
    ] },
    { type: 'p', text: 'This means a taxpayer with senior citizen parents can potentially claim up to 75,000 to 1,00,000 rupees combined across both halves of this section — one of the most underused tax benefits in practice, since many people insure themselves but never separately insure or claim for their parents\u2019 premiums.' },

    { type: 'h2', text: 'Section 80CCD(1B) — an additional 50,000 rupees through NPS' },
    { type: 'p', text: 'This deduction is entirely separate from the 1.5 lakh rupee 80C limit, meaning it is genuinely additive rather than competing for the same cap. At a 30% tax bracket, a full 50,000 rupee NPS contribution saves roughly 15,600 rupees in tax immediately, making it one of the highest-value, lowest-effort deductions available to higher earners specifically.' },

    { type: 'h2', text: 'HRA exemption — often miscalculated' },
    { type: 'p', text: 'House Rent Allowance exemption follows a least-of-three-conditions rule: the actual HRA received, rent paid minus 10% of basic salary, or 50% of basic salary in a metro city (40% in non-metro). Many salaried employees either fail to claim this at all if they live with family, even when paying genuine, documented rent to a parent, or miscalculate the exemption by assuming the full HRA received is automatically tax-free.' },

    { type: 'h2', text: 'The old regime vs new regime decision' },
    { type: 'comparison', comparison: {
      title: 'Old regime vs new regime — which wins depends on your deductions',
      optionA: {
        label: 'Old tax regime',
        points: ['Higher headline slab rates', 'Full access to 80C, 80D, HRA, and other Chapter VI-A deductions', 'Wins for most people who fully utilise 80C + 80D + NPS + HRA'],
      },
      optionB: {
        label: 'New tax regime',
        points: ['Lower headline slab rates', 'Most deductions disallowed, with very limited exceptions', 'Wins for those with few deductions to claim'],
      },
    } },
    { type: 'p', text: 'This decision is not fixed for life — salaried individuals can generally choose between regimes each year when filing, making it worth recalculating both scenarios annually rather than defaulting to whichever regime was chosen previously.' },

    { type: 'h2', text: 'A practical year-end checklist' },
    { type: 'steps', steps: [
      { title: 'Check your 80C utilisation', detail: 'Confirm whether the limit is already filled through EPF and existing insurance before investing further.' },
      { title: 'Claim parent-specific 80D separately', detail: 'Check whether you are paying for parents\u2019 health insurance and separately claiming that deduction.' },
      { title: 'Consider an NPS Tier-1 contribution', detail: 'It does not compete with your 80C limit and adds a genuinely separate ₹50,000 deduction.' },
      { title: 'Recalculate HRA exemption carefully', detail: 'Use the actual least-of-three-conditions formula, not an assumption that full HRA is exempt.' },
      { title: 'Run both regime calculations', detail: 'Before the financial year closes, rather than assuming last year\u2019s choice still applies.' },
    ] },

    { type: 'quote', text: 'Most overpaid tax in India is not the result of high rates. It is the result of deductions people were always entitled to, but never claimed.' },

    { type: 'callout', text: 'Estimate your income tax under old and new regimes to see which saves you more.' },
  ],
};

export default post;
