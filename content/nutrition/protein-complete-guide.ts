import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'protein-complete-guide',
  title: 'Protein: How Much You Really Need and Why Most People Get It Wrong',
  excerpt: 'The official RDA for protein is based on the minimum to prevent deficiency, not the optimal amount. The research on optimal intake tells a very different story.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '🥩',
  readTime: 11,
  date: '2024-11-22',
  tags: ['protein', 'muscle building', 'protein intake', 'amino acids', 'protein sources India'],
  hwtCalc: { label: 'Macro Calculator', url: `${H}/health/macros` },
  body: [
    { type: 'intro', text: 'The official RDA for protein is 0.8 grams per kilogram of bodyweight — the minimum amount needed to prevent muscle wasting in a sedentary population. It says nothing about the optimal amount for muscle maintenance during resistance training, athletic performance, or healthy ageing. The research on optimal intake suggests the RDA may be less than half of what is actually beneficial for anyone training regularly.' },

    { type: 'stat-row', stats: [
      { label: 'Official RDA', value: '0.8 g/kg', color: 'red' },
      { label: 'Research-backed plateau', value: '1.62 g/kg', color: 'teal' },
      { label: 'Practical training range', value: '1.6–2.2 g/kg', color: 'green' },
    ] },

    { type: 'h2', text: 'The evidence on optimal protein intake' },
    { type: 'p', text: 'A 2017 systematic review and meta-analysis published in the British Journal of Sports Medicine, led by Morton and colleagues, pooled data from 49 randomized controlled trials with 1,863 participants and found that protein intakes above approximately 1.62 grams per kilogram of bodyweight per day produced no additional muscle gain in people doing resistance training, identifying this as the point of diminishing returns rather than a hard ceiling.' },
    { type: 'p', text: 'In practical terms, this translates to roughly 1.6 to 2.2 grams per kilogram covering virtually everyone engaged in regular resistance training. During dedicated fat loss phases, many practitioners recommend pushing toward the higher end, around 2.2 to 3.1 grams per kilogram, since higher protein intake helps protect existing muscle mass while the body is in a calorie deficit.' },

    { type: 'h2', text: 'Best protein sources in India: cost and practicality' },
    { type: 'table', table: {
      headers: ['Source', 'Protein (per 100g, or per item)', 'Notes'],
      rows: [
        ['Eggs', '~6g per egg', 'Highly bioavailable, cost-effective'],
        ['Chicken breast', '~31g / 100g cooked', 'Versatile, high quality'],
        ['Paneer', '~18g / 100g', 'Strongest common vegetarian source'],
        ['Moong dal (cooked)', '~7g / 100g', 'Complements rice for fuller amino profile'],
        ['Tofu / soy products', 'Comparable to animal protein quality', 'Underused relative to its value'],
        ['Greek yogurt / curd', 'Varies by brand', 'Check label rather than assume'],
      ],
    } },

    { type: 'h2', text: 'Protein timing: does it matter as much as commonly claimed?' },
    { type: 'p', text: 'The idea of an "anabolic window," requiring protein consumption within roughly 30 minutes after a workout to capture the full benefit, is considerably overstated relative to how it is often presented. Total daily protein intake matters far more than precise timing around a single workout. Spreading protein intake across 3 to 4 meals of roughly 30 to 40 grams each tends to be more effective for muscle protein synthesis over the course of a day than consuming the same total amount concentrated into one or two very large servings.' },

    { type: 'h2', text: 'Protein and satiety — a relevant benefit beyond muscle' },
    { type: 'p', text: 'Protein is consistently the most satiating macronutrient per calorie, which is part of why higher-protein diets tend to make calorie deficits feel easier to sustain. This effect is relevant even for someone whose primary goal is fat loss rather than muscle building, since appetite management is often the real bottleneck in sustaining a deficit long enough to see results.' },

    { type: 'quote', text: 'The RDA tells you the minimum to avoid getting sick. It was never meant to tell you the optimal amount for the body you are actually trying to build.' },

    { type: 'h2', text: 'A practical starting point' },
    { type: 'steps', steps: [
      { title: 'Set your range', detail: 'If you train regularly, target 1.6–2.2 g/kg of bodyweight per day, not the 0.8 g/kg RDA figure.' },
      { title: 'Spread it across meals', detail: '3–4 meals rather than one or two large servings.' },
      { title: 'Lean higher during a deficit', detail: 'To help protect muscle mass while in a calorie shortfall.' },
      { title: 'Prioritise whole foods', detail: 'Treat protein supplements as a convenient top-up, not the primary source.' },
    ] },

    { type: 'callout', text: 'Calculate your exact daily protein target in grams based on your weight and goal.' },
  ],
};

export default post;
