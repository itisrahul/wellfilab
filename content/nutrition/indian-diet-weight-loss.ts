import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'indian-diet-weight-loss',
  title: 'Losing Weight on an Indian Diet: A Practical, Science-Based Approach',
  excerpt: 'Most weight loss advice assumes Western eating patterns. This guide is built around rice, dal, roti, sabji, and the realities of Indian family meals.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '🍛',
  readTime: 10,
  date: '2024-10-25',
  tags: ['Indian diet', 'weight loss India', 'roti rice weight loss', 'desi diet'],
  hwtCalc: { label: 'Calorie Calculator', url: `${H}/health/calories` },
  body: [
    { type: 'intro', text: 'The Indian diet is not the problem. Rice and roti are not uniquely fattening. Ghee is not the enemy. What has changed in Indian households over the past 30 years is portion sizes, cooking oil quantities, refined carbohydrate consumption, and reduced physical activity. A traditional Indian diet — dal, sabji, moderate rice or roti, curd — is reasonably well-balanced. The modern Indian diet, scaled up in portion and oil while activity has scaled down, is not.' },

    { type: 'h2', text: 'Where the calories are hiding in Indian food' },
    { type: 'table', table: {
      headers: ['Food item', 'Typical serving', 'Calories'],
      rows: [
        ['Cooking oil', '1 tbsp (~14g)', '~120–126 kcal'],
        ['A typical sabji (using 2–4 tbsp oil)', '1 serving', '~240–500 invisible kcal from oil alone'],
        ['White rice', '2–3 cups, standard serving', '~400–600 kcal'],
        ['Chapati / roti, plain', '1 medium', '~70–100 kcal'],
        ['Chapati with butter or ghee', '3–4 pieces', '~250–400+ kcal'],
        ['Restaurant butter chicken + naan + rice', '1 person', '~900–1,200 kcal'],
      ],
    } },

    { type: 'h2', text: 'Traditional pattern vs modern pattern' },
    { type: 'comparison', comparison: {
      title: 'The same core foods, very different calorie load',
      optionA: {
        label: 'Traditional pattern',
        points: ['1–2 tsp oil per dish', 'Dal, sabji, and a moderate grain portion in roughly equal proportion', 'Higher daily activity (walking, manual tasks)'],
        verdict: 'Reasonably balanced as eaten historically',
      },
      optionB: {
        label: 'Modern pattern',
        points: ['2–4 tbsp oil per dish — 4–8× more than traditional', 'Grain portion dominates the plate, vegetables and dal shrink', 'Lower daily activity, more sedentary work and commuting'],
        verdict: 'Same foods, meaningfully higher calorie load and lower expenditure',
      },
    } },

    { type: 'h2', text: 'Practical swaps that work' },
    { type: 'steps', steps: [
      { title: 'Reduce oil to 1 teaspoon per sabji', detail: 'Instead of 2–3 tablespoons — saves roughly 200–300 calories per meal without changing the dish itself.' },
      { title: 'Switch to smaller steel plates', detail: 'Portion distortion is a real, well-documented effect — smaller plates reduce serving size without conscious restriction.' },
      { title: 'Start meals with sabji or salad before rice or roti', detail: 'Increases satiety before the higher-calorie-density portion of the meal.' },
      { title: 'Increase dal proportionally', detail: 'High protein, high fibre, relatively low calorie density — a strong substitute for some of the rice or roti portion.' },
    ] },

    { type: 'quote', text: 'The fix is rarely "eat differently." It is usually "eat the same foods, in the proportions your grandparents actually ate them."' },

    { type: 'callout', text: 'Calculate your calorie maintenance and target.' },
  ],
};

export default post;
