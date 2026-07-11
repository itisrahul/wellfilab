import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'work-life-balance-india',
  title: 'Work-Life Balance: The Evidence on Overwork in Indian Corporate Culture',
  excerpt: 'India has some of the longest average working hours in Asia. The evidence on overwork, productivity, and health paints a stark picture.',
  category: 'lifestyle',
  tag: 'Lifestyle',
  icon: '⚖️',
  readTime: 9,
  date: '2024-10-15',
  tags: ['work life balance', 'overwork', 'burnout', 'productivity'],
  hwtCalc: { label: 'Calories Burned Calculator', url: `${H}/health/calories-burned` },
  body: [
    { type: 'intro', text: 'A 2021 joint study by the World Health Organization and the International Labour Organization found that working 55 or more hours per week is associated with a 35% higher risk of stroke and a 17% higher risk of dying from ischemic heart disease, compared to working 35 to 40 hours a week. India, where 50 to 60-hour weeks are normalised across IT, finance, and consulting, faces a significant occupational health exposure rarely discussed openly in these terms.' },

    { type: 'stat-row', stats: [
      { label: 'Stroke risk increase at 55+ hrs/week', value: '+35%', color: 'red' },
      { label: 'Heart disease death risk increase', value: '+17%', color: 'red' },
      { label: 'Global deaths attributed (2016)', value: '745,000', color: 'red' },
    ] },
    { type: 'p', text: 'The same study estimated that 745,000 deaths from stroke and ischemic heart disease in 2016 were attributable to long working hours globally, with the burden disproportionately affecting men and people in the Western Pacific and South-East Asia regions specifically.' },

    { type: 'h2', text: 'The productivity paradox of overwork' },
    { type: 'p', text: 'Research from organizations including Microsoft and several university labor economics groups consistently finds that productivity per hour falls sharply after roughly 50 hours per week and approaches very low marginal output past 55 hours. A person working 60 hours a week often produces less total useful output than they would working 50 genuinely focused hours, since sleep deprivation alone has been shown to reduce cognitive performance by a substantial margin, commonly cited in the range of 20 to 40% depending on the specific task and degree of deprivation.' },

    { type: 'h2', text: 'Recognising burnout before it becomes illness' },
    { type: 'table', table: {
      headers: ['Symptom category', 'What it looks like'],
      rows: [
        ['Emotional exhaustion', 'Profound emptying of emotional resources — difficulty caring about things that previously mattered'],
        ['Depersonalisation', 'Cynicism about work or colleagues that is out of character'],
        ['Reduced personal accomplishment', 'Feeling incompetent despite evidence of competence'],
        ['Physical symptoms', 'Recurrent illness, insomnia despite fatigue, tension headaches'],
      ],
    } },

    { type: 'h2', text: 'What actually helps' },
    { type: 'p', text: 'Of the available interventions, regular physical exercise has consistently shown some of the strongest evidence for reducing work-related stress specifically, partly through its effect on cortisol regulation and partly through providing a clear boundary that separates work time from recovery time — something that becomes harder to maintain without a deliberate, scheduled activity occupying that boundary.' },

    { type: 'quote', text: 'Long hours feel productive in the moment. The data on stroke risk and falling output past 50 hours suggests that feeling is frequently wrong.' },

    { type: 'callout', text: 'Regular exercise is one of the most effective interventions for work-related stress. Track your activity with the Calories Burned Calculator.' },
  ],
};

export default post;
