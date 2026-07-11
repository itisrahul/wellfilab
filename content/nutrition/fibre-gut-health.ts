import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'fibre-gut-health',
  title: 'Dietary Fibre: The Nutrient Most Indians Are Chronically Deficient In',
  excerpt: 'Average Indian fibre intake is well below the evidence-based target of 25–38g/day. The gap causes significant preventable disease.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '🌾',
  readTime: 9,
  date: '2024-10-18',
  tags: ['fibre', 'gut health', 'microbiome', 'colon cancer', 'prebiotics'],
  hwtCalc: { label: 'Calorie Calculator', url: `${H}/health/calories` },
  body: [
    { type: 'intro', text: 'A 2019 systematic review and meta-analysis published in The Lancet, covering 185 prospective studies and 58 clinical trials, found that compared to under 15g of fibre per day, eating 25 to 29g per day was associated with a 15 to 30% reduction in all-cause mortality and meaningfully lower rates of coronary heart disease, stroke, type 2 diabetes, and colorectal cancer. This is one of the strongest diet-disease relationships documented in nutrition literature.' },

    { type: 'chart', chart: {
      kind: 'bar',
      title: 'Risk reduction at 25–29g fibre/day vs under 15g/day (Lancet, 2019)',
      unit: '%',
      bars: [
        { label: 'All-cause mortality', value: 22, display: '15–30%' },
        { label: 'Coronary heart disease', value: 20, display: '16–24%' },
        { label: 'Colorectal cancer', value: 22, display: '22%' },
      ],
    } },

    { type: 'h2', text: 'Best fibre sources in the Indian diet' },
    { type: 'table', table: {
      headers: ['Food (100g)', 'Fibre content', 'Notes'],
      rows: [
        ['Rajma (cooked)', '7.4g', 'Excellent protein source too'],
        ['Masoor dal / lentils (cooked)', '7.9g', 'One of the highest among common dals'],
        ['Chickpeas / chana (cooked)', '7.6g', 'Versatile across many dishes'],
        ['Oats (dry)', '10.6g', 'Highest among common breakfast foods'],
        ['Guava', '5.4g', 'Among the highest-fibre common fruits'],
      ],
    } },

    { type: 'h2', text: 'Increasing fibre without digestive discomfort' },
    { type: 'p', text: 'Adding fibre too quickly causes bloating and gas as gut bacteria adapt to the increased load. A gradual approach, increasing by roughly 5g per week, gives the gut microbiome time to adjust. Increasing water intake simultaneously matters as well, since fibre requires adequate hydration to function properly through the digestive system, and prioritising whole food sources over isolated fibre supplements tends to produce better overall results.' },

    { type: 'h2', text: 'A practical weekly approach' },
    { type: 'steps', steps: [
      { title: 'Add one extra serving of dal or legumes daily', detail: 'Most Indian diets already include these — increasing the portion is often the simplest lever.' },
      { title: 'Swap white rice for a fibre-rich grain some days', detail: 'Oats, or a mix of rice with added legumes, increases fibre without a dramatic dietary change.' },
      { title: 'Keep fruit skins on where reasonable', detail: 'Much of a fruit\u2019s fibre content sits in or near the skin.' },
      { title: 'Increase gradually, not all at once', detail: 'Roughly 5g/week, with adequate water, avoids the bloating that derails many people\u2019s attempts to increase fibre quickly.' },
    ] },

    { type: 'quote', text: 'Fibre is one of the few nutrients where the evidence is this strong and the gap between recommended and actual intake is this large.' },

    { type: 'callout', text: 'Track your diet and ensure you are meeting daily fibre and calorie targets.' },
  ],
};

export default post;
