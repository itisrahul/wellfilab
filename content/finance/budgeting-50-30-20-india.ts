import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'budgeting-50-30-20-india',
  title: 'The 50/30/20 Budget: Why It Fails for Most Indians and How to Fix It',
  excerpt: 'The famous rule was designed for American middle-class incomes. Applied in Indian cities, it often produces unrealistic targets. Here is a better framework.',
  category: 'finance',
  tag: 'Budgeting',
  icon: '💰',
  readTime: 10,
  date: '2024-09-30',
  tags: ['budgeting', '50/30/20 rule', 'budget India', 'money management'],
  hwtCalc: { label: 'Budget Calculator', url: `${H}/finance/budget` },
  body: [
    { type: 'intro', text: 'Elizabeth Warren popularised the 50/30/20 rule in her 2005 book: 50% of income toward needs, 30% toward wants, 20% toward savings. It is elegant, easy to remember, and based on American household income and cost-of-living data from the early 2000s — which is exactly why it frequently fails when applied directly to Indian urban realities, where housing alone can consume 35 to 45% of income in major metro cities.' },

    { type: 'table', table: {
      caption: 'A 1BHK in Mumbai vs the original 50/30/20 assumption',
      headers: ['Monthly income', 'Typical 1BHK rent', '% of income on rent alone'],
      rows: [
        ['₹80,000', '₹25,000', '31%'],
        ['₹80,000', '₹40,000', '50%'],
        ['₹50,000', '₹25,000', '50%'],
      ],
    } },
    { type: 'p', text: 'For a professional earning 80,000 rupees per month, rent alone can already be 31 to 50% of total income, before food, utilities, transport, or any loan EMIs are even factored in. Applying the American 50% needs ceiling directly in this context sets a target that is simply not achievable without either an unrealistic living situation or treating the rule as aspirational rather than literal.' },

    { type: 'h2', text: 'A more India-relevant framework: 60/20/20' },
    { type: 'comparison', comparison: {
      title: 'Original 50/30/20 vs India-adapted 60/20/20',
      optionA: {
        label: 'Original: 50/30/20',
        points: ['50% needs — frequently unrealistic in Indian metros', '30% wants', '20% savings'],
        verdict: 'Built on US cost-of-living data, often unworkable here',
      },
      optionB: {
        label: 'Adapted: 60/20/20',
        points: ['60% needs — housing, food, utilities, transport, insurance, EMIs', '20% wants and discretionary spending', '20% savings — kept non-negotiable, automated first'],
        verdict: 'Same savings rate, more realistic needs ceiling',
      },
    } },
    { type: 'p', text: 'This reallocation does not mean savings should be lower than the original 20% target — it means accepting that needs genuinely consume a larger share of income in Indian metro cities, and adjusting the wants category downward to compensate.' },

    { type: 'h2', text: 'The real rule underneath any percentage split: pay savings first' },
    { type: 'p', text: 'The specific percentages matter far less than the order of operations. Decide your target savings rate first, automate that exact amount through a standing instruction on salary day, and structure remaining spending around whatever is left. When savings are automated and removed from the decision-making process entirely, the precise split between needs and wants in the remaining income becomes a much less consequential decision.' },

    { type: 'h2', text: 'Adjusting the framework as income grows' },
    { type: 'p', text: 'A common and costly pattern is letting lifestyle spending expand to match every salary increase, keeping the percentage split unchanged year after year even as absolute income rises. A more deliberate approach increases the savings percentage specifically as income grows — someone moving from 60/20/20 to 50/20/30 as their salary rises is keeping needs roughly flat in absolute terms while letting savings grow disproportionately.' },

    { type: 'h2', text: 'What to do if even 60/20/20 feels unrealistic' },
    { type: 'p', text: 'If needs genuinely consume more than 60% of income even after reviewing every line item honestly, the more productive question becomes whether the underlying living situation, particularly housing, is structurally mismatched to current income. In some cases the only real fix is a different living arrangement, a roommate situation, or a location change — no budgeting framework can fully compensate for housing costs that consume the majority of take-home pay on their own.' },

    { type: 'quote', text: 'The percentage split is a starting template, not a law of physics. The non-negotiable part is paying your future self first.' },

    { type: 'h2', text: 'A practical first step' },
    { type: 'steps', steps: [
      { title: 'Track one full month first', detail: 'Most people misjudge their own needs-versus-wants split by a wide margin before actually tracking it.' },
      { title: 'Automate savings on salary day', detail: 'Before any other spending happens, not after.' },
      { title: 'Categorize honestly', detail: 'Resist the temptation to reclassify wants as needs to make the numbers look better.' },
      { title: 'Revisit annually', detail: 'Or after any significant income or rent change, rather than leaving the split fixed indefinitely.' },
    ] },

    { type: 'callout', text: 'Calculate your ideal budget split based on your actual income.' },
  ],
};

export default post;
