import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'gut-health-microbiome-guide',
  title: 'Your Gut Microbiome: What It Is, Why It Matters, and How to Improve It',
  excerpt: 'The gut microbiome — tens of trillions of bacteria living in your digestive tract — influences your immunity, mood, metabolism, and brain function.',
  category: 'nutrition',
  tag: 'Nutrition',
  icon: '🦠',
  readTime: 10,
  date: '2024-08-10',
  tags: ['gut health', 'microbiome', 'probiotics', 'prebiotics', 'gut bacteria'],
  hwtCalc: { label: 'Macro Calculator', url: `${H}/health/macros` },
  body: [
    { type: 'intro', text: 'Your gut contains approximately 38 trillion microbial cells, a figure revised in 2016 by researchers at the Weizmann Institute from earlier, much higher estimates — the ratio of bacterial to human cells in the body is now understood to be roughly 1.3 to 1, not the 10-to-1 figure long repeated in textbooks. Even at this corrected, more conservative estimate, the sheer mass of this community, roughly 1.5 kilograms in a typical adult, makes it one of the most metabolically active tissues in the body.' },

    { type: 'stat-row', stats: [
      { label: 'Gut microbial cells', value: '~38 trillion', color: 'teal' },
      { label: 'Bacterial-to-human cell ratio', value: '~1.3 : 1', color: 'amber' },
      { label: 'Approx. mass', value: '~1.5 kg', color: 'green' },
      { label: 'Body\u2019s serotonin made in gut', value: '90–95%', color: 'teal' },
    ] },

    { type: 'h2', text: 'What the microbiome does' },
    { type: 'table', table: {
      headers: ['Function', 'Mechanism'],
      rows: [
        ['Short-chain fatty acid production', 'Gut bacteria ferment dietary fibre into butyrate and propionate, which fuel gut lining cells and reduce inflammation'],
        ['Immune education', 'A large share of immune cells are located in the gut; the microbiome trains them to distinguish pathogens from harmless substances'],
        ['Neurotransmitter influence', 'Gut bacteria are involved in producing an estimated 90–95% of the body\u2019s serotonin, primarily via enterochromaffin cells in the gut lining'],
        ['Vitamin synthesis', 'Certain gut bacteria synthesise vitamin K2 and several B vitamins'],
      ],
    } },
    { type: 'p', text: 'It is worth being precise about the serotonin claim: the gut-produced serotonin acts locally on gut motility and signaling, and is largely separate from the serotonin synthesized in the brain that more directly affects mood — the two pools do not simply mix, even though gut bacteria can influence brain chemistry indirectly through other signaling pathways.' },

    { type: 'h2', text: 'Evidence-based ways to improve gut health' },
    { type: 'steps', steps: [
      { title: 'Eat 30 or more different plant foods per week', detail: 'The American Gut Project found people eating 30 or more plant varieties had significantly more diverse microbiomes than those eating fewer than 10.' },
      { title: 'Include fermented foods daily', detail: 'Dahi/yogurt, idli, dosa — all contain live cultures that add to microbial diversity.' },
      { title: 'Prioritise prebiotic foods', detail: 'Garlic, onions, leeks, oats, bananas — these feed beneficial bacteria directly rather than introducing new ones.' },
      { title: 'Limit antibiotics to when genuinely necessary', detail: 'A single course can measurably alter microbiome composition for 6 to 12 months afterward.' },
    ] },

    { type: 'h2', text: 'Why diversity matters more than any single "superfood"' },
    { type: 'p', text: 'A common misconception is searching for one ideal probiotic food or supplement that will "fix" gut health. The research consistently points instead to dietary diversity as the stronger lever — a wide variety of plant fibres feeds a wider variety of bacterial species, and that diversity itself is associated with better metabolic and immune outcomes, more so than any single fermented food or supplement consumed in isolation.' },

    { type: 'quote', text: 'Your gut bacteria are not a passive passenger. They are an active, metabolically significant tissue that responds directly to what you feed it.' },

    { type: 'callout', text: 'Track your diet and ensure you are meeting fibre and protein targets for gut health.' },
  ],
};

export default post;
