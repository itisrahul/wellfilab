import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'net-worth-guide',
  title: 'Your Net Worth: How to Calculate It, Track It, and Grow It',
  excerpt: 'Net worth is the single most important financial number you own. Most people have never calculated it properly.',
  category: 'finance',
  tag: 'Finance',
  icon: '🏦',
  readTime: 11,
  date: '2024-09-08',
  tags: ['net worth', 'assets', 'liabilities', 'financial health', 'wealth building'],
  hwtCalc: { label: 'Net Worth Calculator', url: `${H}/finance/net-worth` },
  body: [
    { type: 'intro', text: 'Income is what you earn. Net worth is what you keep. Two people can have identical incomes and radically different net worths depending on what they spend, save, and invest. Net worth is the scoreboard of financial decisions over time, and unlike a payslip, it cannot be inflated by a single good month — it only moves when behavior actually changes.' },

    { type: 'h2', text: 'The basic equation' },
    { type: 'p', text: 'Net worth equals total assets minus total liabilities. Assets are everything you own that has monetary value: cash, fixed deposits, mutual funds, stocks, EPF and NPS balances, property, and gold. Liabilities are everything you owe: home loans, car loans, personal loans, and credit card balances. The result can be negative, and for many people early in their career, it is — that is normal, not alarming, on its own.' },

    { type: 'table', table: {
      caption: 'A simple net worth worksheet — fill in your own numbers in the same structure',
      headers: ['Category', 'Example item', 'Example value (₹)'],
      rows: [
        ['Liquid assets', 'Savings account, FDs', '3,00,000'],
        ['Investments', 'Mutual funds, stocks, EPF/NPS', '8,50,000'],
        ['Property', 'Home (market value, conservative estimate)', '65,00,000'],
        ['Other assets', 'Gold, vehicle (at resale value)', '4,00,000'],
        ['— Total assets', '', '80,50,000'],
        ['Home loan outstanding', '', '38,00,000'],
        ['Car loan outstanding', '', '3,50,000'],
        ['Credit card / personal loan', '', '40,000'],
        ['— Total liabilities', '', '41,90,000'],
        ['Net worth (assets − liabilities)', '', '38,60,000'],
      ],
    } },

    { type: 'h2', text: 'What counts as an asset — and what genuinely should not' },
    { type: 'p', text: 'Financial assets such as equity, mutual funds, EPF, NPS, and fixed deposits are unambiguously assets — they have a clear market value and can typically be converted to cash. Your car is a different story: it depreciates 15 to 20% per year and costs money continuously through fuel, insurance, and maintenance, which is why many net worth frameworks exclude vehicles entirely or count them at a steep discount to purchase price.' },
    { type: 'p', text: 'Your primary home is the most debated category. It provides genuine shelter value and can appreciate over time, but it also costs money in property tax, maintenance, and opportunity cost on the capital tied up in it. Many financial planners track "investable net worth," which excludes the primary residence, separately from total net worth that includes it — both are valid as long as you are consistent about which one you are tracking.' },

    { type: 'comparison', comparison: {
      title: 'Total net worth vs investable net worth — which should you track?',
      optionA: {
        label: 'Total net worth (includes your home)',
        points: [
          'Captures your complete financial picture, including the roof over your head',
          'Better reflects family wealth transferred across generations',
          'Can feel misleadingly large if home equity dominates the number',
        ],
        verdict: 'Best for: estate planning, understanding total family wealth',
      },
      optionB: {
        label: 'Investable net worth (excludes your home)',
        points: [
          'Shows what you could actually deploy for retirement income or emergencies',
          'More directly comparable to a FIRE number, which is based on spendable assets',
          'Can understate wealth for someone with a fully paid-off, valuable home',
        ],
        verdict: 'Best for: retirement planning, FIRE tracking, year-over-year progress',
      },
    } },

    { type: 'h2', text: 'Why net worth matters more than income' },
    { type: 'p', text: 'Income measures cash flow over a period — a month, a year. Net worth measures accumulated wealth, the result of every saving, spending, investing, and debt decision compounding over years. A high earner who spends everything they make can have a lower net worth than a moderate earner who saves and invests consistently, because net worth captures the gap between income and spending, not the income figure itself.' },
    { type: 'p', text: 'This is also why net worth is a more honest measure of financial progress than a salary hike. A 20% raise that gets fully absorbed into a bigger rent, a new car EMI, and increased discretionary spending leaves net worth completely unchanged, even though the headline number — income — looks like clear progress.' },

    { type: 'h2', text: 'Benchmarks by age — India-adapted' },
    { type: 'p', text: 'These are rough guides, not strict targets — actual circumstances like education loans, family responsibilities, or career changes shift the picture meaningfully. Use them as a general compass, not a scorecard to feel bad about.' },

    { type: 'chart', chart: {
      kind: 'bar',
      title: 'Suggested net worth as a multiple of annual salary, by age',
      unit: 'x',
      bars: [
        { label: 'Age 30', value: 1, display: '1× salary' },
        { label: 'Age 35', value: 2.5, display: '2–3× salary' },
        { label: 'Age 40', value: 5, display: '4–6× salary' },
        { label: 'Age 50', value: 10, display: '10× salary' },
        { label: 'Retirement', value: 25, display: '25× annual expenses' },
      ],
    } },

    { type: 'h2', text: 'How to actually calculate yours' },
    { type: 'steps', steps: [
      { title: 'List every asset', detail: 'Bank balances, FDs, mutual funds, stocks, EPF, NPS, gold, property value — use a conservative, realistic estimate for property, not an aspirational one.' },
      { title: 'List every liability', detail: 'Outstanding home loan, car loan, personal loan balance, and any credit card debt carried month to month.' },
      { title: 'Subtract liabilities from assets', detail: 'The result is your net worth — it can be negative, and that is a normal starting point for many people.' },
      { title: 'Write it down with the date', detail: 'Even a negative number recorded today becomes the baseline you measure progress against.' },
      { title: 'Repeat every 3 to 6 months', detail: 'Using the same method each time, so the trend is meaningful and genuinely comparable.' },
    ] },

    { type: 'h2', text: 'Why tracking the trend matters more than any single number' },
    { type: 'p', text: 'A single net worth calculation is a snapshot. Tracking it consistently every few months reveals the trend that actually reflects financial behavior — whether debt is shrinking, investments are compounding, and overall direction is upward, even if the absolute number still has a long way to go. This is particularly useful during debt payoff: watching a negative net worth figure climb steadily toward zero, and eventually turn positive, tends to be a far more motivating way to track progress than focusing only on the shrinking loan balance.' },

    { type: 'quote', text: 'Net worth does not care how busy you were this month. It only reflects what actually changed.' },

    { type: 'h2', text: 'A common mistake: confusing liquidity with wealth' },
    { type: 'p', text: 'Not all net worth is equally usable. A large net worth concentrated in an illiquid asset like property is not the same as an equivalent net worth held in cash and liquid mutual funds — the first cannot easily cover an emergency or a sudden opportunity, while the second can. When reviewing your own number, it is worth separately noting how much of it is actually accessible within a few days if needed.' },

    { type: 'callout', text: 'Calculate your current net worth and see how it compares to benchmarks by age.' },
  ],
};

export default post;
