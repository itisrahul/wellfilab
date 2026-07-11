import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'body-fat-percentage-guide',
  title: 'Body Fat Percentage: The Number BMI Cannot Tell You',
  excerpt: 'Body fat percentage is a far more meaningful health metric than weight or BMI. Here is how it is measured, what the ranges mean, and how to change it.',
  category: 'health',
  tag: 'Body & Weight',
  icon: '📊',
  readTime: 10,
  date: '2024-11-10',
  tags: ['body fat', 'body composition', 'DEXA', 'visceral fat'],
  hwtCalc: { label: 'Body Fat Calculator', url: `${H}/health/body-fat` },
  body: [
    { type: 'intro', text: 'Two people can have identical BMIs but radically different health profiles. One might be 15% body fat with excellent insulin sensitivity. The other might be 35% body fat with early signs of metabolic syndrome despite weighing and measuring the same. The difference between them is body composition — completely invisible to a metric that only uses weight and height.' },

    { type: 'h2', text: 'Measurement methods ranked by accuracy' },
    { type: 'table', table: {
      headers: ['Method', 'Accuracy', 'Practicality'],
      rows: [
        ['DEXA scan', '±1–2%', 'Requires hospital or specialised clinic'],
        ['Bioelectrical impedance (BIA)', '±3–5%', 'Home scale, sensitive to hydration & food timing'],
        ['US Navy circumference formula', '±3–4%', 'Free, just a tape measure'],
        ['Skinfold calipers', 'Highly operator-dependent', 'Needs a trained, consistent assessor'],
      ],
    } },

    { type: 'h2', text: 'Healthy ranges by sex' },
    { type: 'table', table: {
      headers: ['Category', 'Men', 'Women'],
      rows: [
        ['Athletic', '6–13%', '14–20%'],
        ['Fitness', '14–17%', '21–24%'],
        ['Average', '18–24%', '25–31%'],
        ['Higher body fat', 'Above 25%', 'Above 32%'],
      ],
    } },
    { type: 'p', text: 'These ranges shift somewhat with age — essential fat requirements and typical healthy ranges are not identical for a 25-year-old and a 65-year-old, even at the same activity level.' },

    { type: 'h2', text: 'Visceral fat: the more dangerous category hiding within the number' },
    { type: 'p', text: 'Visceral fat, stored around internal organs rather than just under the skin, is the kind most strongly linked to insulin resistance, cardiovascular disease, and metabolic syndrome. It is possible to have a relatively low overall body fat percentage while still carrying disproportionately high visceral fat — a pattern sometimes seen in people who are thin overall but carry weight specifically around the abdomen.' },

    { type: 'comparison', comparison: {
      title: 'Same body fat %, different risk — why distribution matters',
      optionA: {
        label: 'Fat stored mainly on hips/thighs ("pear")',
        points: ['Lower visceral fat accumulation', 'Generally lower cardiovascular and metabolic risk', 'Waist-to-hip ratio typically below risk threshold'],
      },
      optionB: {
        label: 'Fat stored mainly around abdomen ("apple")',
        points: ['Higher visceral fat accumulation', 'Elevated cardiovascular and metabolic risk at the same total body fat %', 'Waist-to-hip ratio typically above risk threshold'],
      },
    } },
    { type: 'p', text: 'Waist circumference and waist-to-hip ratio are useful companion measurements specifically because they capture this visceral fat pattern in a way that overall body fat percentage alone does not fully distinguish.' },

    { type: 'h2', text: 'Why body fat percentage matters more than weight during a fat loss phase' },
    { type: 'p', text: 'Tracking body fat percentage alongside weight, rather than weight alone, reveals whether weight loss is coming primarily from fat or from a mix of fat and muscle. Two people losing the same 5 kg over a few months can have very different outcomes — one losing almost entirely fat while preserving muscle through adequate protein and resistance training, the other losing a meaningful proportion of muscle alongside the fat, which produces a worse long-term outcome even though the scale shows the same number.' },

    { type: 'h2', text: 'Practical measurement habits that actually produce reliable trends' },
    { type: 'steps', steps: [
      { title: 'Measure at the same time of day', detail: 'Ideally first thing in the morning before eating or drinking, for consistency.' },
      { title: 'Use the same method every time', detail: 'Switching between a BIA scale and the Navy formula introduces noise that has nothing to do with real change.' },
      { title: 'Track the trend over 4–8 weeks', detail: 'Rather than reacting to any single reading, since day-to-day fluctuation from hydration alone can shift the number noticeably.' },
      { title: 'Pair with a waist measurement', detail: 'This adds visceral fat context that body fat percentage alone does not fully capture.' },
    ] },

    { type: 'quote', text: 'The scale tells you what changed. Body composition tells you what kind of change actually happened.' },

    { type: 'callout', text: 'Estimate your body fat percentage using height, weight, waist, and neck measurements.' },
  ],
};

export default post;
