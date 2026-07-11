import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'water-intake-science',
  title: 'How Much Water Do You Actually Need?',
  excerpt: 'The 8 glasses a day rule has no scientific basis. Here is what research actually says about optimal hydration.',
  category: 'health',
  tag: 'Nutrition',
  icon: '💧',
  readTime: 8,
  date: '2024-11-05',
  tags: ['hydration', 'water intake', 'dehydration', 'electrolytes'],
  hwtCalc: { label: 'Water Intake Calculator', url: `${H}/health/water` },
  body: [
    { type: 'intro', text: 'The 8 glasses a day rule traces back to a 1945 recommendation by the US Food and Nutrition Board, which suggested adults consume roughly 2.5 litres of water daily — a figure that works out to about eight 8-ounce glasses. The detail almost universally dropped from that original recommendation: the same document explicitly noted that most of this quantity is already contained in ordinary food, not water that needs to be deliberately drunk.' },

    { type: 'h2', text: 'What actually determines your needs' },
    { type: 'table', table: {
      headers: ['Factor', 'Effect on daily need'],
      rows: [
        ['Bodyweight', 'Baseline of ~35ml per kg bodyweight from all sources'],
        ['Exercise', 'Add 500–1,000ml per hour, depending on sweat rate'],
        ['Hot or dry climate', 'Add 500–1,000ml above baseline'],
        ['High-protein diet', 'Increases need somewhat'],
        ['High fruit & vegetable intake', 'Reduces need somewhat — significant water content in food'],
      ],
    } },

    { type: 'h2', text: 'Urine colour: the practical, no-equipment guide' },
    { type: 'table', table: {
      headers: ['Colour', 'What it suggests'],
      rows: [
        ['Pale straw to pale yellow', 'Well hydrated'],
        ['Yellow', 'Mildly dehydrated'],
        ['Dark yellow / amber', 'Moderately dehydrated'],
        ['Clear', 'Possibly overhydrating — can dilute electrolytes if excessive'],
      ],
    } },

    { type: 'h2', text: 'Why "drink before you are thirsty" oversimplifies things' },
    { type: 'p', text: 'For most healthy adults going about an ordinary day, the thirst mechanism is a reasonably reliable guide — by the time you feel thirsty, you are mildly behind on fluid, not dangerously so. The exceptions are genuine: athletes during prolonged exercise, people working outdoors in heat, and older adults, whose thirst sensation tends to become less reliable with age, all warrant more deliberate fluid tracking rather than relying purely on the thirst signal.' },

    { type: 'h2', text: 'A practical approach' },
    { type: 'steps', steps: [
      { title: 'Start from bodyweight', detail: 'Use ~35ml per kg as a baseline, adjusted for climate and activity.' },
      { title: 'Check urine colour periodically', detail: 'A simple, free, real-time indicator without needing to track every glass.' },
      { title: 'Increase deliberately during exercise or heat', detail: 'Do not rely on thirst alone in these conditions.' },
      { title: 'Count food and beverages, not just plain water', detail: 'Coffee, tea, fruits, and soups all contribute meaningfully to total fluid intake.' },
    ] },

    { type: 'quote', text: 'The rule was never really "drink 8 glasses." It was "consume about 2.5 litres total, much of it already in your food" — and only half of that sentence survived 80 years of repetition.' },

    { type: 'callout', text: 'Get your personalised daily water intake target based on your weight, activity level, and climate.' },
  ],
};

export default post;
