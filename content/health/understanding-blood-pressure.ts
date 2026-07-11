import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'understanding-blood-pressure',
  title: 'Blood Pressure: What the Numbers Mean and How to Lower It Without Medication',
  excerpt: 'Hypertension affects roughly 1 in 3 to 1 in 4 Indian adults depending on the survey. Most have no symptoms. Here is a complete guide to understanding and managing blood pressure.',
  category: 'health',
  tag: 'Health',
  icon: '❤️',
  readTime: 9,
  date: '2024-08-20',
  tags: ['blood pressure', 'hypertension', 'heart health India'],
  hwtCalc: { label: 'Heart Rate Calculator', url: `${H}/health/heart-rate` },
  body: [
    { type: 'intro', text: 'Hypertension is called the silent killer because it has no symptoms until it causes a heart attack, stroke, or kidney failure. Indian prevalence estimates vary by survey and region — the ICMR-INDIAB study found an age-standardized prevalence of 26.3%, while a separate systematic review by Anchala and colleagues estimated 29.8%, and some regional surveys report figures above 30%. Across all of these, the consistent finding is that awareness and control rates remain low — frequently below 50% awareness and well below that for actual control.' },

    { type: 'h2', text: 'Understanding your numbers' },
    { type: 'table', table: {
      headers: ['Category', 'Systolic (mmHg)', 'Diastolic (mmHg)'],
      rows: [
        ['Normal', 'Below 120', 'Below 80'],
        ['Elevated', '120–129', 'Below 80'],
        ['Stage 1 hypertension', '130–139', '80–89'],
        ['Stage 2 hypertension', '140+', '90+'],
        ['Hypertensive crisis', 'Above 180', 'Above 120 — seek emergency care immediately'],
      ],
    } },

    { type: 'h2', text: 'Lifestyle interventions with proven efficacy' },
    { type: 'table', table: {
      headers: ['Intervention', 'Typical systolic BP reduction'],
      rows: [
        ['Sodium reduction (toward WHO\u2019s 2,300mg/day target)', '5–6 mmHg'],
        ['30 min moderate aerobic exercise, 5 days/week', '4–8 mmHg'],
        ['Weight loss', '~1 mmHg per kg lost'],
        ['Reducing alcohol intake', '1–2 mmHg per unit/day reduced'],
      ],
    } },
    { type: 'p', text: 'The average Indian diet is estimated to contain roughly 8,000 to 10,000 mg of sodium per day, well above the WHO-recommended 2,300 mg — making sodium reduction one of the highest-leverage, lowest-cost interventions available for most people.' },

    { type: 'h2', text: 'Why these interventions work together, not in isolation' },
    { type: 'p', text: 'None of these interventions alone typically brings Stage 2 hypertension down to normal range — they are cumulative. Someone combining moderate sodium reduction, regular exercise, and modest weight loss can plausibly see a combined systolic reduction in the range of 10 to 15 mmHg, which is often enough to shift someone from Stage 1 hypertension into the elevated or even normal range, though individual response varies and medical supervision remains important, especially for Stage 2 or higher.' },

    { type: 'quote', text: 'Hypertension rarely announces itself. The only way to know your numbers is to actually measure them.' },

    { type: 'callout', text: 'Monitor your resting heart rate and track cardiovascular health trends.' },
  ],
};

export default post;
