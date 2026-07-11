import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'understanding-tdee',
  title: 'TDEE: The Number You Need to Know Before Making Any Diet Decision',
  excerpt: 'Total Daily Energy Expenditure is the foundation of all evidence-based nutrition. Get this number right and every other dietary decision becomes clearer.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '⚡',
  readTime: 10,
  date: '2024-09-20',
  tags: ['TDEE', 'BMR', 'calories burned', 'activity multiplier', 'energy expenditure'],
  hwtCalc: { label: 'Calorie Calculator', url: `${H}/health/calories` },
  body: [
    { type: 'intro', text: 'Most diet advice starts with a rule — eat 1,200 calories, eliminate carbs, fast for 16 hours — without ever establishing the most fundamental number: how many calories do you actually burn per day? Your Total Daily Energy Expenditure, or TDEE, is that number, and virtually every effective dietary intervention works because it creates a specific, deliberate relationship to it.' },

    { type: 'h2', text: 'The four components of TDEE' },
    { type: 'chart', chart: {
      kind: 'bar',
      title: 'Typical share of TDEE by component (sedentary person)',
      unit: '%',
      bars: [
        { label: 'BMR (resting metabolism)', value: 65, display: '60–70%' },
        { label: 'NEAT (daily movement)', value: 20, display: '15–30%' },
        { label: 'TEF (digesting food)', value: 10, display: '8–15%' },
        { label: 'EAT (deliberate exercise)', value: 5, display: 'highly variable' },
      ],
    } },
    { type: 'p', text: 'BMR is the energy spent just keeping your body running at complete rest. TEF is the energy cost of digesting food itself, notably higher for protein than fat. NEAT covers all non-exercise movement — fidgeting, walking, standing — and is the most variable component between two otherwise similar people. EAT is calories burned during structured exercise, and is frequently overestimated by fitness trackers, sometimes by 20 to 40%.' },

    { type: 'h2', text: 'Why NEAT is the most underappreciated variable' },
    { type: 'p', text: 'Research comparing lean and obese individuals of similar size has found that leaner people typically have 300 to 500 more calories of NEAT per day, driven by spontaneous movement rather than deliberate exercise. NEAT also tends to drop during a sustained calorie deficit, often without the person noticing — fidgeting decreases, walking pace slows. This adaptive decline is one reason weight loss often slows over time even when calorie intake stays the same.' },

    { type: 'h2', text: 'Estimating your TDEE in practice' },
    { type: 'table', table: {
      caption: 'Activity multiplier applied to BMR — the most common source of an inaccurate TDEE estimate is picking too high a multiplier',
      headers: ['Activity level', 'Multiplier', 'What this actually means'],
      rows: [
        ['Sedentary', '× 1.2', 'Little to no structured exercise, mostly desk-based day'],
        ['Lightly active', '× 1.375', 'Light exercise 1–3 days/week'],
        ['Moderately active', '× 1.55', 'Structured exercise most days, 3–5 days/week'],
        ['Very active', '× 1.725', 'Hard exercise 6–7 days/week'],
        ['Extremely active', '× 1.9', 'Physical job plus daily training'],
      ],
    } },
    { type: 'p', text: 'The most common error here is selecting too high an activity multiplier — "moderately active" is meant for someone with structured exercise most days of the week, not simply someone with an active job or who occasionally walks. Overestimating activity level leads to a TDEE estimate that is too generous, which then undermines a weight loss or maintenance plan built on top of it.' },

    { type: 'h2', text: 'Using TDEE for fat loss, maintenance, or muscle gain' },
    { type: 'comparison', comparison: {
      title: 'Fat loss deficit vs muscle-building surplus',
      optionA: {
        label: 'Fat loss: TDEE − 500 to 750 kcal',
        points: [
          'Produces roughly 0.5–0.75 kg/week of fat loss for most people',
          'Deficits larger than this raise the risk of muscle loss alongside fat loss',
          'Pairs best with high protein intake (1.6g+/kg) to protect lean mass',
        ],
      },
      optionB: {
        label: 'Muscle gain: TDEE + 200 to 300 kcal',
        points: [
          'Supports gradual muscle gain while limiting unnecessary fat gain',
          'Must be paired with resistance training to direct the surplus toward muscle',
          'Larger surpluses do not meaningfully speed up muscle building past this point',
        ],
      },
    } },

    { type: 'h2', text: 'Why your TDEE estimate needs to be revisited' },
    { type: 'p', text: 'As body weight changes, BMR changes with it — a lighter body requires fewer calories to maintain itself at rest. A TDEE calculated for your starting weight gradually becomes inaccurate as that weight changes, typically becoming too generous during weight loss. Recalculating every 4 to 5 kg of weight change keeps the number aligned with where you actually are.' },

    { type: 'quote', text: 'TDEE is not a fixed number you calculate once. It is a moving target that shifts with your weight, your activity, and even how much you have been sleeping.' },

    { type: 'h2', text: 'When your real-world results do not match the math' },
    { type: 'p', text: 'If actual weight change over 2 to 3 weeks consistently does not match what a TDEE-based calorie target predicted, the most likely explanation is an inaccurate activity multiplier or imprecise food tracking, not a "broken metabolism." Adjusting the activity level down a notch, or tightening up food logging accuracy, resolves the mismatch in the vast majority of cases.' },

    { type: 'callout', text: 'Calculate your TDEE accurately using age, height, weight, and activity level.' },
  ],
};

export default post;
