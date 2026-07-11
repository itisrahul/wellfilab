import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'intermittent-fasting-evidence',
  title: 'Intermittent Fasting: What the Research Actually Shows After 10 Years',
  excerpt: 'Intermittent fasting exploded in popularity from 2012–2020. A decade of research has produced a clearer, more nuanced picture than the early hype suggested.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '⏰',
  readTime: 9,
  date: '2024-11-08',
  tags: ['intermittent fasting', '16:8', '5:2', 'time restricted eating'],
  hwtCalc: { label: 'Calorie Calculator', url: `${H}/health/calories` },
  body: [
    { type: 'intro', text: 'A 2022 randomized controlled trial published in the New England Journal of Medicine, led by Liu and colleagues, assigned 139 people with obesity to either 16:8 time-restricted eating or daily calorie restriction with matched total calories, and found no significant difference in weight loss between the two groups over 12 months. The honest summary of a decade of research: time-restricted eating specifically appears effective primarily because it tends to reduce total caloric intake, not because of a unique metabolic advantage beyond that.' },

    { type: 'h2', text: 'The main protocols and what research shows' },
    { type: 'table', table: {
      headers: ['Protocol', 'Structure', 'Evidence summary'],
      rows: [
        ['16:8 (time-restricted eating)', 'Fast 16 hours, eat within an 8-hour window', 'Comparable to matched daily calorie restriction — NEJM 2022 found no significant advantage'],
        ['5:2 (modified fasting)', 'Eat normally 5 days, ~500 kcal on 2 days', 'Some evidence of improved insulin sensitivity beyond the calorie deficit alone'],
        ['Alternate-day fasting', '24-hour fast alternating with normal eating', 'The one approach a 2025 BMJ network meta-analysis of 99 trials found to modestly outperform continuous restriction'],
        ['OMAD (One Meal A Day)', 'Very aggressive single daily meal', 'Associated with increased muscle loss risk if protein intake is inadequate'],
      ],
    } },

    { type: 'h2', text: 'Where fasting may have a genuine edge beyond the calorie deficit' },
    { type: 'p', text: 'Multiple meta-analyses have found that fasting protocols produce somewhat greater improvements in fasting insulin and insulin resistance markers than calorie-matched continuous restriction, suggesting fasting may carry a metabolic benefit independent of total calories consumed. The clinical significance of this difference for people without existing metabolic disease, however, is still being established, and it has not consistently translated into a meaningfully larger weight loss advantage in head-to-head trials.' },

    { type: 'comparison', comparison: {
      title: 'Neither approach has shown a consistent overall winner — adherence is the deciding factor',
      optionA: {
        label: 'Intermittent fasting (16:8 or 5:2)',
        points: ['Comparable weight loss to matched continuous restriction in most trials', 'Some evidence of better insulin sensitivity at equal calories', 'May improve adherence for people who prefer fewer, larger meals'],
      },
      optionB: {
        label: 'Continuous calorie restriction',
        points: ['Comparable weight loss in most head-to-head trials', 'More flexible meal timing, may suit social and family eating patterns better', 'Longer track record across more diverse populations'],
      },
    } },

    { type: 'h2', text: 'Who should avoid intermittent fasting' },
    { type: 'ul', items: [
      'History of eating disorders — fasting patterns can trigger or reinforce disordered eating.',
      'Pregnant or breastfeeding women.',
      'Type 1 diabetes or unstable Type 2 diabetes, due to blood sugar management complexity.',
      'Athletes with high training volumes, where fuelling around training sessions becomes harder to manage within a restricted eating window.',
    ] },

    { type: 'quote', text: 'Intermittent fasting is not metabolically magic. It is a structure that happens to make a calorie deficit easier for some people to sustain, and harder for others.' },

    { type: 'callout', text: 'Calculate your calorie needs to understand the deficit created by any fasting protocol.' },
  ],
};

export default post;
