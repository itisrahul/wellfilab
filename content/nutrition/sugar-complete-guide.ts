import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'sugar-complete-guide',
  title: 'Sugar: Separating Fact from the Moral Panic',
  excerpt: 'Sugar has replaced fat as the dietary villain of our time. Some of the concern is justified. Much of it is exaggerated. Here is what the evidence actually shows.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '🍬',
  readTime: 9,
  date: '2024-10-10',
  tags: ['sugar', 'added sugar', 'fructose', 'insulin', 'diabetes'],
  hwtCalc: { label: 'Calorie Calculator', url: `${H}/health/calories` },
  body: [
    { type: 'intro', text: 'In 1965, the Sugar Research Foundation paid Harvard nutrition researchers, including the chair of the university\u2019s Public Health Nutrition Department, to write a literature review favoring their preferred conclusion. The resulting 1967 review, published in the New England Journal of Medicine without disclosing the funding, concluded that cholesterol and saturated fat were the only dietary factors that mattered for heart disease, downplaying evidence linking sugar to the same outcome. This was only revealed publicly in 2016, by which point the review had shaped dietary guidelines for roughly five decades.' },

    { type: 'h2', text: 'What the evidence says about added sugar today' },
    { type: 'p', text: 'The WHO recommends limiting free sugars to less than 10% of total caloric intake, ideally below 5% for additional benefit — roughly 50g for a 2,000 calorie diet, ideally below 25g. Added sugar in processed food provides calories without nutrients and drives overconsumption through highly palatable sweetness-fat-salt combinations engineered for exactly that effect.' },

    { type: 'h2', text: 'Where the panic overcorrects' },
    { type: 'p', text: 'Whole fruit, despite containing natural sugars, is consistently associated with neutral or beneficial health outcomes in research, not the harm sometimes implied by sugar-focused messaging — the fibre, water content, and micronutrients in whole fruit change how that sugar is absorbed and metabolised compared to the same sugar consumed in isolation, such as in a fruit juice with the fibre removed.' },

    { type: 'h2', text: 'Practical guidance for Indians' },
    { type: 'table', table: {
      headers: ['Source', 'Typical sugar content', 'Context'],
      rows: [
        ['Packaged mango juice (1 glass)', '30–40g', 'Exceeds the WHO daily maximum in a single serving'],
        ['Cold drink (1 can/bottle)', '~35–40g', 'Similar order of magnitude to juice'],
        ['Chai (1 cup, typical sweetening)', '~8–12g per teaspoon added', 'Reducing by half a teaspoon per cup saves meaningful sugar over a year'],
      ],
    } },

    { type: 'stat-row', stats: [
      { label: 'WHO daily limit (2,000 kcal diet)', value: '<50g', color: 'amber' },
      { label: 'Reduce chai sugar by 0.5 tsp/cup', value: '≈18,000 kcal/year saved', color: 'teal' },
      { label: 'Equivalent body fat over a year', value: '≈2.5 kg', color: 'green' },
    ] },

    { type: 'h2', text: 'A practical approach' },
    { type: 'steps', steps: [
      { title: 'Identify your biggest sugar source first', detail: 'For most Indian diets, this is beverages — cold drinks, packaged juices, or heavily sweetened chai — not whole fruit.' },
      { title: 'Reduce gradually, not all at once', detail: 'Halving chai sugar over a few weeks is more sustainable than an abrupt cut.' },
      { title: 'Do not restrict whole fruit', detail: 'The fibre and nutrient content make it a different food from added sugar, even though both contain sugar.' },
      { title: 'Read labels on packaged foods', detail: 'Added sugar is frequently present in foods that do not taste obviously sweet, like sauces and bread.' },
    ] },

    { type: 'quote', text: 'The science on added sugar is genuinely concerning. The science on whole fruit is genuinely reassuring. Treating both the same way is where most sugar advice goes wrong.' },

    { type: 'callout', text: 'Track your sugar intake as part of your daily calorie and macro targets.' },
  ],
};

export default post;
