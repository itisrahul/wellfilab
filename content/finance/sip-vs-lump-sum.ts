import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'sip-vs-lump-sum',
  title: 'SIP vs Lump Sum: Which Wins Over 10, 20, and 30 Years?',
  excerpt: 'This is one of the most argued questions in Indian personal finance. The answer depends on timing and market conditions — and is more nuanced than either side admits.',
  category: 'finance',
  tag: 'SIP',
  icon: '💹',
  readTime: 10,
  date: '2024-11-25',
  tags: ['SIP', 'lump sum', 'mutual funds', 'rupee cost averaging', 'market timing'],
  hwtCalc: { label: 'SIP Calculator', url: `${H}/finance/sip` },
  body: [
    { type: 'intro', text: 'The standard answer from advisors is that SIP always wins because of rupee cost averaging. The more honest answer is that in steadily rising markets, lump sum investing has historically outperformed SIP. The reason SIP is still universally recommended is not that it produces the highest possible returns in every market condition — it is that it produces the best risk-adjusted, behaviorally sustainable outcome for people who cannot reliably predict where markets are headed next.' },

    { type: 'h2', text: 'The mathematics of rupee cost averaging' },
    { type: 'p', text: 'When you invest a fixed amount every month, you automatically buy more units when prices are low and fewer units when prices are high, smoothing your average purchase price over time. In volatile or declining markets, this produces a genuine mathematical advantage over investing everything at once at an unknown starting price. In steadily rising markets, you would on average have been better off buying everything at the lower starting price right at the beginning.' },

    { type: 'h2', text: 'Historical data: what actually happened' },
    { type: 'comparison', comparison: {
      title: 'Lump sum vs phased investing (Vanguard, US/UK/Australia, 1926–2011)',
      optionA: {
        label: 'Lump sum (invest all at once)',
        points: [
          'Outperformed in roughly two-thirds of rolling 10-year periods',
          'Average outperformance: 1.5–2.4%',
          'Logic: markets trend upward more often than not, so earlier exposure wins on average',
        ],
        verdict: 'Better expected return — if you already have the lump sum sitting in cash',
      },
      optionB: {
        label: '12-month dollar-cost averaging',
        points: [
          'Underperformed lump sum on average across the dataset',
          'Reduces risk of unlucky timing right before a downturn',
          'Smooths out volatility during the phasing-in period',
        ],
        verdict: 'Lower expected return, but lower regret risk in a sudden crash',
      },
    } },
    { type: 'p', text: 'This finding assumes the investor already has a lump sum sitting in cash, deciding how to deploy it. Most salaried individuals do not face that choice — they have income arriving monthly, with no large lump sum to deploy in the first place. For this much larger group, SIP is not a choice between two strategies with different expected returns; it is simply the structure that matches how their money actually becomes available.' },

    { type: 'h2', text: 'SIP step-up: the dramatically underused feature' },
    { type: 'chart', chart: {
      kind: 'bar',
      title: '₹10,000/month SIP for 20 years at 12% CAGR — flat vs 10% annual step-up',
      unit: '',
      bars: [
        { label: 'Flat SIP (no step-up)', value: 9991479, display: '≈ ₹99.9 lakh' },
        { label: 'With 10% annual step-up', value: 19888715, display: '≈ ₹1.99 crore' },
      ],
    } },
    { type: 'p', text: 'A standard SIP of 10,000 rupees per month for 20 years at a 12% CAGR produces roughly 99.9 lakh rupees. The same SIP with a 10% annual step-up, increasing the monthly contribution by 10% every year in line with rising income, produces roughly 1.99 crore rupees — almost double, from the same starting contribution. Most investors never use the step-up feature simply because they set up their SIP once and never revisit it.' },

    { type: 'h2', text: 'A practical hybrid approach' },
    { type: 'p', text: 'For situations where you do have a lump sum, such as a bonus, inheritance, or maturity payout, a common middle-ground approach is to deploy a majority of it immediately, perhaps 50 to 70%, while phasing the remainder in over the following 6 to 12 months. This captures most of lump sum investing\u2019s statistical advantage while reducing the psychological risk of deploying everything right before a sudden downturn.' },

    { type: 'h2', text: 'What this means for your own decision' },
    { type: 'steps', steps: [
      { title: 'If your money arrives as monthly income', detail: 'SIP is simply the natural structure — there is no real "versus" decision to make.' },
      { title: 'If you have a genuine lump sum in cash', detail: 'Historical data slightly favors deploying it sooner, but a hybrid approach is reasonable if a sudden downturn feels psychologically risky.' },
      { title: 'Enable annual step-up regardless', detail: 'One of the highest-leverage, easiest changes available to meaningfully increase your eventual corpus.' },
      { title: 'Do not let this debate delay you', detail: 'The cost of indecision, in years not invested, is almost always larger than the difference between SIP and lump sum outcomes.' },
    ] },

    { type: 'quote', text: 'The SIP-versus-lump-sum debate matters far less than simply starting. Every year spent deciding is a year removed from the compounding timeline.' },

    { type: 'callout', text: 'Model your exact SIP returns with step-up to see how much the annual increase feature adds.' },
  ],
};

export default post;
