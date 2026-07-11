import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'macro-counting-guide',
  title: 'Macro Counting: A Practical Guide From Zero to Results',
  excerpt: 'Counting macros is more flexible and more powerful than calorie counting alone. This guide explains how to calculate your targets and hit them.',
  category: 'health',
  tag: 'Nutrition',
  icon: '🥗',
  readTime: 11,
  date: '2024-10-15',
  tags: ['macros', 'protein', 'carbohydrates', 'fat', 'flexible dieting'],
  hwtCalc: { label: 'Macro Calculator', url: `${H}/health/macros` },
  body: [
    { type: 'intro', text: 'Flexible dieting, tracking protein, carbohydrates, and fat against daily gram targets rather than following a rigid list of allowed and forbidden foods, is among the most evidence-supported approaches to body composition nutrition currently available. A substantial body of research over the past decade consistently shows it produces better long-term adherence than highly restrictive approaches.' },

    { type: 'h2', text: 'The three macronutrients, and what each one is actually doing' },
    { type: 'table', table: {
      headers: ['Macronutrient', 'Calories/gram', 'Primary role', 'Practical minimum'],
      rows: [
        ['Protein', '4 kcal/g', 'Muscle synthesis, satiety, immune function', '~1.6g/kg bodyweight'],
        ['Carbohydrates', '4 kcal/g', 'Brain fuel, high-intensity exercise fuel', 'Varies by training volume'],
        ['Fat', '9 kcal/g', 'Hormone production, vitamin absorption', 'Never below ~30g/day'],
      ],
    } },

    { type: 'h2', text: 'How to calculate your starting macros' },
    { type: 'steps', steps: [
      { title: 'Calculate your TDEE', detail: 'Using bodyweight, height, age, and activity level as the foundation everything else builds from.' },
      { title: 'Set your overall calorie target', detail: 'TDEE minus 300–500 kcal for fat loss, or TDEE plus 200–300 kcal for muscle building.' },
      { title: 'Set your protein target', detail: 'Commonly around 1.8g/kg of bodyweight, then multiply by 4 to find the calories that protein represents.' },
      { title: 'Set your fat target', detail: 'Commonly 25–30% of total calories, then divide by 9 to convert to grams.' },
      { title: 'Fill the remainder with carbohydrates', detail: 'Divide the leftover calories by 4 to find the gram target.' },
    ] },

    { type: 'h2', text: 'Why this order matters' },
    { type: 'p', text: 'Setting protein and a sensible fat floor first, then letting carbohydrates fill whatever calorie space remains, tends to produce a more sustainable and physiologically sound split than starting with carbohydrates and treating protein as an afterthought. Protein in particular is the macronutrient most directly tied to specific outcomes like muscle preservation during a deficit.' },

    { type: 'h2', text: 'Common mistakes that undermine an otherwise correct plan' },
    { type: 'comparison', comparison: {
      title: 'Two people with identical calorie targets, very different results',
      optionA: {
        label: 'Tracks calories only, ignores macros',
        points: ['Hits the same calorie number daily', 'Protein often falls below 1g/kg without noticing', 'Cooking oil and added fats frequently untracked'],
        verdict: 'Same calories, worse body composition outcome',
      },
      optionB: {
        label: 'Tracks calories and macros',
        points: ['Protein deliberately set and hit consistently', 'Oils and fats logged explicitly', 'Eating-back exercise calories done conservatively, if at all'],
        verdict: 'Same calories, better muscle preservation and satiety',
      },
    } },
    { type: 'ul', items: [
      'Not tracking cooking oils and added fats: a single tablespoon of olive oil or ghee adds roughly 120 calories.',
      'Eating back all calories estimated as "burned" by exercise: most fitness trackers overestimate burn by 50–100%, which means eating back the full estimated amount frequently undermines an intended deficit.',
      'Treating macro targets as requiring exact precision every single day: hitting targets within a reasonable range consistently over a week matters more than perfect daily precision.',
    ] },

    { type: 'h2', text: 'Adjusting macros as your situation changes' },
    { type: 'p', text: 'Macro targets are derived from your TDEE and goal, both of which shift as your weight changes, your activity level changes, or your goal itself changes. Recalculating macros every several weeks, or whenever body weight shifts by a noticeable amount, keeps the targets aligned with where you actually are.' },

    { type: 'quote', text: 'Calorie counting tells you how much to eat. Macro counting tells you what that food is actually doing once you eat it.' },

    { type: 'callout', text: 'Get your exact macro targets in grams — enter your calories and goal to see protein, carbs, and fat.' },
  ],
};

export default post;
