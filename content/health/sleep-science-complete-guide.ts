import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'sleep-science-complete-guide',
  title: 'The Science of Sleep: Why 7 Hours Is Not Enough for Everyone',
  excerpt: 'Decades of research have transformed our understanding of sleep. Here is what the science actually says about how much you need and why.',
  category: 'health',
  tag: 'Sleep',
  icon: '😴',
  readTime: 11,
  date: '2024-11-20',
  tags: ['sleep', 'sleep cycles', 'REM', 'sleep deprivation', 'circadian rhythm'],
  hwtCalc: { label: 'Sleep Calculator', url: `${H}/health/sleep` },
  body: [
    { type: 'intro', text: 'Matthew Walker, director of UC Berkeley\u2019s Center for Human Sleep Science and author of Why We Sleep, has popularised a striking comparison: after roughly 17 to 19 hours of continuous wakefulness, cognitive and motor performance declines to a level equivalent to a blood alcohol concentration around the legal driving limit in many countries. Separately, his research also found that a full week of sleeping only 6 hours per night produces cumulative cognitive impairment comparable to a full 24 hours of total sleep deprivation. Both findings point to the same conclusion: humans are remarkably bad at noticing their own accumulated sleep debt.' },

    { type: 'h2', text: 'Sleep stages: what happens each night' },
    { type: 'table', table: {
      headers: ['Stage', 'Duration / timing', 'What happens'],
      rows: [
        ['N1', '1–7 minutes', 'Light transition, easily awakened'],
        ['N2', 'Bulk of early cycles', 'True sleep — temperature drops, heart rate slows, sleep spindles form'],
        ['N3 (deep sleep)', 'Dominates early cycles', 'Growth hormone released, tissue repaired'],
        ['REM', 'Concentrated in later cycles', 'Brain near-waking activity, emotional memory processing, learning consolidation'],
      ],
    } },
    { type: 'p', text: 'Cutting total sleep by roughly 90 minutes can eliminate close to half of a night\u2019s REM sleep, since REM is concentrated in the later sleep cycles — meaning the last 90 minutes you cut from your night are disproportionately costly compared to the first 90.' },

    { type: 'h2', text: 'The circadian rhythm and the role of light' },
    { type: 'p', text: 'Your circadian rhythm, the internal roughly-24-hour clock governing sleepiness and alertness, is regulated substantially by light exposure. In the hour or so before natural sunset, the pineal gland begins producing melatonin, the hormone that signals the body toward sleep. Blue light from phone and laptop screens in the evening interferes with this signal, effectively delaying the body\u2019s own melatonin release.' },

    { type: 'h2', text: 'What sustained sleep deprivation actually does to the body' },
    { type: 'stat-row', stats: [
      { label: 'NK cell activity drop, 1 night of 4–5hrs', value: '−70%', color: 'red' },
      { label: 'Cognitive impairment, 1 week of 6hrs', value: '= 24hr total deprivation', color: 'red' },
      { label: 'Recommended adult sleep range', value: '7–9 hrs', color: 'teal' },
    ] },

    { type: 'h2', text: 'Evidence-based ways to improve sleep quality' },
    { type: 'steps', steps: [
      { title: 'Fix your wake time, all 7 days', detail: 'This single change is one of the most effective ways to anchor and stabilise your circadian rhythm.' },
      { title: 'Keep the bedroom cool', detail: 'Generally 18–19°C, since core body temperature naturally needs to drop for sleep onset to occur smoothly.' },
      { title: 'Manage light exposure', detail: 'Bright light within 30 minutes of waking; reduce blue light 60–90 minutes before bed.' },
      { title: 'Be mindful of caffeine timing', detail: 'Caffeine\u2019s half-life is roughly 5–7 hours, so a 3pm coffee still has meaningful effect by 8pm.' },
      { title: 'Limit alcohol close to bedtime', detail: 'Even modest amounts measurably reduce REM sleep, fragmenting the night\u2019s architecture.' },
    ] },

    { type: 'h2', text: 'Why subjective feeling is an unreliable guide to sleep need' },
    { type: 'p', text: 'One of the more consistent findings across sleep research is that people who are chronically sleep-restricted tend to underestimate how impaired they actually are — performance on cognitive and reaction-time tasks declines steadily, while self-reported alertness plateaus as the body adapts to the *feeling* of being tired without the underlying impairment actually resolving.' },

    { type: 'quote', text: 'You cannot train your way out of needing sleep. You can only train yourself to stop noticing how impaired you have become.' },

    { type: 'callout', text: 'Use the Sleep Calculator to find the exact times to set your alarm for complete sleep cycles.' },
  ],
};

export default post;
