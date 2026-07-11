import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'how-to-lose-weight-without-starving',
  title: 'How to Lose Weight Without Starving: The Science of Sustainable Fat Loss',
  excerpt: 'Most diets fail within 6 months. This explains the metabolic science behind why — and what actually works for permanent fat loss.',
  category: 'health',
  tag: 'Weight Loss',
  icon: '🏃',
  readTime: 11,
  date: '2024-12-01',
  tags: ['weight loss', 'calorie deficit', 'metabolism', 'fat loss', 'TDEE'],
  hwtCalc: { label: 'Weight Loss Calculator', url: `${H}/health/weight-loss` },
  body: [
    { type: 'intro', text: 'Around 80% of people who lose weight on a diet regain it within 2 years. That is not a willpower failure — it is biology. When you cut calories too aggressively, your body activates survival mechanisms that work directly against further fat loss, and understanding exactly what those mechanisms are changes how you should approach the entire process.' },

    { type: 'h2', text: 'Why crash diets backfire: metabolic adaptation' },
    { type: 'p', text: 'Your Basal Metabolic Rate adapts when you eat far below your needs for an extended period. The body responds in three ways: it slows metabolism beyond what would be predicted just from reduced body weight; it begins breaking down muscle tissue for energy when fat stores alone cannot meet the shortfall; and it dramatically increases hunger-signaling hormones like ghrelin while suppressing satiety hormones like leptin.' },

    { type: 'h2', text: 'The right deficit size' },
    { type: 'table', table: {
      headers: ['Deficit size', 'Weekly loss (approx.)', 'Muscle preservation', 'Sustainability'],
      rows: [
        ['Gentle (300–400 kcal)', '0.25–0.35 kg', 'Best', 'Easiest to maintain'],
        ['Moderate (500–600 kcal)', '0.4–0.5 kg', 'Good', 'Sweet spot for most people'],
        ['Aggressive (750–1,000 kcal)', '0.6–0.9 kg', 'At risk', 'Hard to sustain past a few weeks'],
      ],
    } },
    { type: 'p', text: 'Never go below 1,200 kcal/day for women or 1,500 kcal/day for men without direct medical supervision — deficits beyond this point risk nutrient deficiencies regardless of how the calories are otherwise structured.' },

    { type: 'h2', text: 'Protein: the most important lever in a deficit' },
    { type: 'p', text: 'Adequate protein, generally at least 1.6 grams per kilogram of bodyweight during a deficit, protects muscle mass that would otherwise be at risk when the body is in a calorie shortfall. Protein also has a notably higher thermic effect than carbohydrates or fat, and is consistently the most satiating macronutrient per calorie. People who deliberately increase protein intake have been shown in multiple studies to spontaneously eat 400 to 500 fewer calories per day without any explicit calorie counting at all.' },

    { type: 'h2', text: 'Sleep: the overlooked variable' },
    { type: 'p', text: 'A 2022 randomized clinical trial published in JAMA Internal Medicine, led by researchers at the University of Chicago, found that extending sleep duration from under 6.5 hours toward 8.5 hours reduced daily caloric intake by an average of 270 calories — without participants making any other deliberate changes to diet or exercise.' },

    { type: 'stat-row', stats: [
      { label: 'Sleep <6.5hrs → 8.5hrs', value: '−270 kcal/day', color: 'teal' },
      { label: 'High-protein spontaneous reduction', value: '−400 to 500 kcal/day', color: 'teal' },
      { label: 'Min. safe deficit floor (women)', value: '1,200 kcal/day', color: 'amber' },
      { label: 'Min. safe deficit floor (men)', value: '1,500 kcal/day', color: 'amber' },
    ] },

    { type: 'h2', text: 'Why the "starvation mode" myth is half right and half wrong' },
    { type: 'p', text: 'It is not true that any calorie deficit immediately triggers metabolic shutdown — moderate, well-structured deficits with adequate protein and resistance training produce steady, sustainable fat loss for the vast majority of people without triggering the extreme adaptive responses associated with very aggressive restriction. The real risk threshold is specifically very large deficits sustained for long periods, not deficits in general.' },

    { type: 'h2', text: 'Resistance training during a deficit' },
    { type: 'p', text: 'Strength training while in a calorie deficit sends a strong signal to the body to preserve, rather than break down, muscle tissue. This is a major reason why "weight loss" framed purely around the number on a scale is a less useful goal than body composition change — two people losing the same total weight can end up with very different proportions of fat loss versus muscle loss depending on whether resistance training was part of the process.' },

    { type: 'quote', text: 'The goal is not to be on a diet. The goal is to build a version of yourself that eats correctly by default — where the healthy choice requires no willpower because it is simply what you do.' },

    { type: 'h2', text: 'A realistic 12-week plan' },
    { type: 'steps', steps: [
      { title: 'Weeks 1–2: Set the foundation', detail: 'Calculate your TDEE accurately, reduce by 400–500 kcal, and hit your protein target consistently.' },
      { title: 'Weeks 3–8: Add resistance training', detail: '2–3 sessions per week to preserve muscle. Expect roughly 0.4–0.6 kg/week of loss.' },
      { title: 'Weeks 9–12: Address any plateau', detail: 'If progress has stalled despite consistent adherence, take a 1-week diet break at maintenance calories before resuming.' },
      { title: 'Beyond week 12: Taper the deficit', detail: 'Reduce to around 300 kcal/day once within roughly 5kg of target, since the remaining margin for restriction shrinks.' },
    ] },

    { type: 'h2', text: 'What to do when progress stalls' },
    { type: 'p', text: 'A genuine plateau lasting several weeks despite consistent adherence usually has one of three causes: body weight has decreased enough that the original TDEE estimate is now too generous, tracking accuracy has quietly drifted, or the body is retaining water masking real fat loss happening underneath. Re-measuring TDEE and tightening tracking accuracy resolves the great majority of apparent plateaus.' },

    { type: 'callout', text: 'Calculate your exact TDEE and get a personalised calorie target for your goal weight and timeline.' },
  ],
};

export default post;
