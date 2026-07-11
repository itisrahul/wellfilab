import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'index-fund-vs-active-india',
  title: 'Index Funds vs Active Funds in India: What the Data Actually Shows',
  excerpt: 'Active fund managers charge 1–2% more than index funds and promise to beat the market. The SPIVA India data tells a clear story.',
  category: 'finance',
  tag: 'Investing',
  icon: '📊',
  readTime: 11,
  date: '2024-10-15',
  tags: ['index funds', 'active funds', 'mutual funds India', 'expense ratio', 'SPIVA'],
  hwtCalc: { label: 'SIP Calculator', url: `${H}/finance/sip` },
  body: [
    { type: 'intro', text: 'The SPIVA India Scorecard, published by S&P Dow Jones Indices, is the most rigorous public tracking of how actively managed Indian funds perform against their benchmark indices over time. The year-end 2023 data found that 73% of Indian large-cap active funds underperformed their benchmark over a 10-year period, and the figure was even higher, 82%, for mid-cap and small-cap funds over the same horizon. These numbers are after fees.' },

    { type: 'chart', chart: {
      kind: 'bar',
      title: 'SPIVA India Year-End 2023 — active fund underperformance rate, 10-year horizon',
      unit: '%',
      bars: [
        { label: 'Large-cap funds', value: 73, display: '73%' },
        { label: 'Mid/small-cap funds', value: 82, display: '82%' },
      ],
    } },

    { type: 'h2', text: 'Why active funds underperform: the underlying arithmetic' },
    { type: 'p', text: 'Before fees, the market is close to a zero-sum game — for every investor who beats the average, another must underperform it by a corresponding amount. After fees are subtracted, the average active investor must underperform the index by roughly the amount of fees charged.' },

    { type: 'table', table: {
      caption: '₹10 lakh invested at 12% gross return for 20 years — fee impact',
      headers: ['Fund type', 'Annual fee', 'Value after 20 years'],
      rows: [
        ['Index fund', '0.1%', '₹95.2 lakh'],
        ['Active fund', '2.0%', '₹64.9 lakh'],
        ['Difference', '—', '₹30.3 lakh lost to fees'],
      ],
    } },

    { type: 'h2', text: 'Where the data is more favorable to active management' },
    { type: 'p', text: 'The picture is not uniformly negative for active funds across every category. ELSS funds, the tax-saving category under Section 80C, have historically shown meaningfully better relative performance than large-cap funds in several SPIVA reporting periods. Mid-cap and small-cap segments are also generally considered less efficiently priced than large-cap stocks, since they receive far less analyst coverage — though the SPIVA data shows this theoretical opportunity does not consistently translate into actual outperformance once fees are accounted for.' },

    { type: 'h2', text: 'Why the underperformance rate tends to worsen over longer horizons' },
    { type: 'p', text: 'A notable pattern in the SPIVA data is that underperformance rates for large-cap funds tend to be lower over very short periods, sometimes even showing a majority of funds beating the benchmark in a single strong year, but rise substantially over 3, 5, and 10-year horizons. This reflects the fact that beating a benchmark consistently, year after year, is a much harder bar to clear than beating it in any single favorable year.' },

    { type: 'h2', text: 'A practical portfolio approach' },
    { type: 'comparison', comparison: {
      title: 'A core-and-satellite structure',
      optionA: {
        label: 'Core (≈70%): Index funds',
        points: ['Nifty 50 or Nifty Next 50', 'Minimal cost, full transparency', 'Data strongly favours this for large-cap exposure'],
      },
      optionB: {
        label: 'Satellite (≈30%): Selected active funds',
        points: ['Focused on ELSS or mid/small-cap categories', 'Where the case for active management is comparatively stronger', 'Choose funds with a long, consistent track record'],
      },
    } },

    { type: 'h2', text: 'What this means in practice for most investors' },
    { type: 'ol', items: [
      'For large-cap equity exposure specifically, the data strongly favors low-cost index funds over actively managed alternatives.',
      'For ELSS tax-saving investments, actively managed funds have shown a comparatively stronger relative track record.',
      'Always compare the expense ratio explicitly before choosing between a direct and regular plan of the same fund.',
      'Reassess any active fund holding against its benchmark periodically, since past outperformance is not a reliable predictor of continued future outperformance.',
    ] },

    { type: 'quote', text: 'Beating the market once is luck. Beating it consistently, after fees, for a decade, is what the data shows most fund managers cannot do.' },

    { type: 'callout', text: 'Model your SIP returns with different expense ratios to see what fees cost over your investment horizon.' },
  ],
};

export default post;
