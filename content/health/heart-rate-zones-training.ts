import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'heart-rate-zones-training',
  title: 'Heart Rate Zones: How to Train Smarter, Not Just Harder',
  excerpt: 'Training at the wrong intensity wastes time. Heart rate zones let you target exactly the right physiological adaptation for your goal.',
  category: 'health',
  tag: 'Fitness',
  icon: '❤️',
  readTime: 10,
  date: '2024-11-15',
  tags: ['heart rate', 'training zones', 'cardio', 'VO2 max', 'Zone 2'],
  hwtCalc: { label: 'Heart Rate Calculator', url: `${H}/health/heart-rate` },
  body: [
    { type: 'intro', text: 'Most recreational exercisers train at the same moderate intensity in nearly every session — too hard to build a genuine aerobic base efficiently, and too easy to drive meaningful fitness gains either. Heart rate zones solve this by giving a concrete, measurable way to target the specific physiological adaptation a particular session is actually meant to produce.' },

    { type: 'h2', text: 'The five zones and what each one trains' },
    { type: 'table', table: {
      headers: ['Zone', '% of max HR', 'Purpose', 'Conversation test'],
      rows: [
        ['Zone 1', '50–60%', 'Recovery, clears metabolic byproducts', 'Easy, full conversation'],
        ['Zone 2', '60–70%', 'Aerobic base, mitochondrial density', 'Full conversation, comfortable'],
        ['Zone 3', '70–80%', 'Aerobic threshold', 'Conversation becomes difficult'],
        ['Zone 4', '80–90%', 'Lactate threshold (4–10 min intervals)', 'Cannot hold a conversation'],
        ['Zone 5', '90–100%', 'VO2 max (30sec–3min efforts)', 'No conversation possible'],
      ],
    } },

    { type: 'h2', text: 'Zone 2: a genuinely underused training tool for most recreational exercisers' },
    { type: 'p', text: 'Sustained, easy-paced aerobic training at this intensity is specifically effective at building mitochondrial density — more mitochondria translate to a higher capacity to use oxygen efficiently for energy, which improves aerobic capacity and metabolic health broadly. The appeal of Zone 2 work is that it produces this adaptation while remaining genuinely easy and sustainable for long durations, with low injury risk and minimal recovery cost.' },

    { type: 'h2', text: 'How elite endurance athletes actually distribute training intensity' },
    { type: 'p', text: 'Research on elite endurance athletes across sports — distance running, cycling, cross-country skiing, rowing — consistently shows that roughly 75 to 80% of total training volume happens at low intensity, broadly corresponding to Zone 1 and Zone 2 combined in a recreational 5-zone framework, with most of the remaining volume concentrated at high intensity rather than spread across the middle zones.' },
    { type: 'p', text: 'It is worth noting that some research distinguishes between strictly "polarized" distributions, which minimize moderate-intensity work almost entirely, and "pyramidal" distributions, which still emphasize low intensity most heavily but include more moderate-intensity work than a strict polarized model — both patterns appear across different elite endurance athletes and sports.' },

    { type: 'comparison', comparison: {
      title: 'Polarized vs pyramidal intensity distribution',
      optionA: {
        label: 'Polarized',
        points: ['~80% low intensity (Zone 1)', '~0–10% moderate (Zone 2/3)', '~15–20% high intensity'],
      },
      optionB: {
        label: 'Pyramidal',
        points: ['~75–80% low intensity (Zone 1)', 'Noticeably more moderate-intensity volume than polarized', 'Smaller high-intensity share than polarized'],
      },
    } },

    { type: 'h2', text: 'A practical structure for recreational training' },
    { type: 'p', text: 'For someone training for general fitness or recreational endurance goals rather than elite competition, a reasonable adaptation of this research suggests building a base of 2 to 3 easy, Zone 2 sessions of 40-plus minutes per week, complemented by one higher-intensity interval session targeting Zone 4 or Zone 5, rather than defaulting to the same moderate-intensity pace in every single session.' },

    { type: 'h2', text: 'Calculating your own zones' },
    { type: 'p', text: 'The most common starting estimate for maximum heart rate is 220 minus your age, though this population-level formula has meaningful individual variation and is less precise than a directly measured maximum from a maximal effort test. The Karvonen method refines this further by incorporating resting heart rate, calculating heart rate reserve (max minus resting) and applying zone percentages to that reserve rather than to max heart rate alone — this tends to produce more individually accurate zone boundaries.' },

    { type: 'quote', text: 'Most of your training should feel embarrassingly easy. The hard sessions only work because the easy ones let you recover enough to do them properly.' },

    { type: 'callout', text: 'Calculate your exact heart rate zones based on your age and resting heart rate.' },
  ],
};

export default post;
