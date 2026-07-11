import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'money-mental-health',
  title: 'Money and Mental Health: The Research on Financial Stress',
  excerpt: 'Financial stress is one of the most common forms of chronic stress in India. Its mental health consequences are significant, measurable, and largely preventable.',
  category: 'lifestyle',
  tag: 'Lifestyle',
  icon: '💙',
  readTime: 9,
  date: '2024-09-25',
  tags: ['financial stress', 'money anxiety', 'mental health finances', 'financial wellbeing'],
  hwtCalc: { label: 'Net Worth Calculator', url: `${H}/finance/net-worth` },
  body: [
    { type: 'intro', text: 'Financial stress is reported by people at every income level, because spending and lifestyle expectations typically rise with income. The relationship between income and financial anxiety is weaker than most people expect — what predicts distress more reliably is the gap between resources and obligations, not the absolute size of either.' },

    { type: 'h2', text: 'How financial stress affects cognitive function' },
    { type: 'p', text: 'A 2013 study published in Science by researchers Anandi Mani, Sendhil Mullainathan, Eldar Shafir, and Jiaying Zhao, conducted across Princeton, Harvard, the University of British Columbia, and University of Warwick, found that confronting people with a significant financial worry, such as imagining an unexpected large repair bill, produced a measurable drop in performance on cognitive tasks. The effect, observed specifically in lower-income participants facing the larger hypothetical bill, was comparable to a 13-point reduction in IQ — similar in scale to the cognitive impairment seen after a full night of missed sleep.' },

    { type: 'stat-row', stats: [
      { label: 'Cognitive impact of acute financial worry', value: '≈ −13 IQ points', color: 'red' },
      { label: 'Comparable to', value: 'one missed night of sleep', color: 'amber' },
      { label: 'Indian farmers, post-harvest cognition', value: '+25% test scores', color: 'green' },
    ] },
    { type: 'p', text: 'The same research team also studied sugarcane farmers in India, testing the same individuals before and after harvest payment. Cognitive test performance improved meaningfully once the farmers were paid and their immediate financial pressure eased — strong evidence that the effect is genuinely caused by financial scarcity itself, not by some pre-existing difference between people who are financially stressed and those who are not.' },

    { type: 'h2', text: 'The certainty effect: why uncertainty is often worse than bad news' },
    { type: 'p', text: 'Financial uncertainty — not knowing what your actual financial situation is — tends to produce more sustained stress than a clear, even negative, picture. People with a clear debt repayment plan often report lower anxiety than people with smaller but completely undefined financial situations. Getting a clear picture, however uncomfortable in the moment, tends to reduce anxiety more than continued avoidance.' },

    { type: 'h2', text: 'Evidence-based strategies' },
    { type: 'steps', steps: [
      { title: 'Calculate your exact financial picture', detail: 'Uncertainty is more psychologically costly than an uncomfortable but clear reality.' },
      { title: 'Create a written plan', detail: 'Having an explicit plan reduces the rumination that drives ongoing anxiety.' },
      { title: 'Separate money-thinking time from the rest of the day', detail: 'Reviewing finances late at night reliably produces more anxiety than doing it during a set daytime window.' },
      { title: 'Address the most pressing problem first', detail: 'Rather than spreading limited attention thin across every financial concern simultaneously.' },
    ] },

    { type: 'quote', text: 'The cost of financial stress is not just emotional. It is cognitive — it genuinely changes how well your brain can think while you are carrying it.' },

    { type: 'callout', text: 'Calculating your net worth is a powerful first step to financial clarity and reduced money anxiety.' },
  ],
};

export default post;
