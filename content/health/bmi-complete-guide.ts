import type { Post } from '@/lib/types';
const H = '/tools';

const post: Post = {
  slug: 'bmi-complete-guide',
  title: 'BMI: What It Measures, Where It Fails, and What to Use Instead',
  excerpt: 'BMI has been the global standard for 200 years. Here is what it actually tells you, what it misses, and which metrics give a more complete picture.',
  category: 'health',
  tag: 'Body & Weight',
  icon: '⚖️',
  readTime: 10,
  date: '2024-11-28',
  tags: ['BMI', 'body fat', 'waist circumference', 'health metrics'],
  hwtCalc: { label: 'BMI Calculator', url: `${H}/health/bmi` },
  body: [
    { type: 'intro', text: 'Body Mass Index was invented by Belgian statistician Adolphe Quetelet in the 1830s as a mathematical description of the average man — not as a medical tool. It was never designed to diagnose individual health. Yet it became the global standard, and billions of decisions, from insurance premiums to eligibility for surgery, are made using it every year.' },

    { type: 'h2', text: 'How BMI is calculated, and the standard categories' },
    { type: 'p', text: 'BMI equals weight in kilograms divided by height in metres squared. Quetelet chose the height-squared relationship empirically, fitting a curve to population weight and height data of his era — not from any underlying physiological model of how body composition actually scales with height.' },

    { type: 'table', table: {
      headers: ['BMI range', 'Category', 'What it actually tells you'],
      rows: [
        ['Below 18.5', 'Underweight', 'Worth investigating, but can be normal for naturally lean body types'],
        ['18.5 – 24.9', 'Normal', 'Statistically lower average risk at a population level'],
        ['25 – 29.9', 'Overweight', 'Can include both genuinely higher-fat individuals and muscular athletes'],
        ['30 and above', 'Obese', 'Stronger correlation with risk, but still says nothing about fat distribution'],
      ],
    } },

    { type: 'h2', text: 'Where BMI systematically fails' },
    { type: 'p', text: 'BMI\u2019s blind spots are not edge cases — they affect large, identifiable groups of people in predictable ways.' },
    { type: 'ul', items: [
      'Athletes and muscular individuals: A 90 kg, 180 cm rugby player has a BMI of 27.8, classified overweight, despite carrying only around 10% body fat. The formula cannot distinguish muscle mass from fat mass.',
      'Sarcopenic obesity: A normal BMI of 23 can coexist with 40% body fat in someone with low muscle mass, often older adults — a combination that carries meaningfully higher metabolic risk than the BMI number alone suggests.',
      'Ethnic and regional variation: South and East Asian populations tend to develop cardiovascular and metabolic risk at lower BMI thresholds, often around 23 to 24 rather than 25, because body fat distribution patterns differ from the European populations the original cutoffs were derived from.',
      'Height distortion: BMI tends to overestimate fatness in shorter individuals and underestimate it in taller individuals, a known mathematical artifact of the squared-height term not perfectly matching how body volume actually scales with height.',
    ] },

    { type: 'comparison', comparison: {
      title: 'Two people, identical BMI of 27.8 — very different reality',
      optionA: {
        label: 'Rugby player, 90kg, 180cm',
        points: ['Roughly 10% body fat', 'High lean muscle mass', 'Low cardiovascular risk markers'],
        verdict: 'BMI flags "overweight" — clinically misleading here',
      },
      optionB: {
        label: 'Sedentary office worker, 90kg, 180cm',
        points: ['Roughly 28% body fat', 'Lower muscle mass', 'Elevated metabolic risk markers'],
        verdict: 'BMI flags "overweight" — clinically accurate here',
      },
    } },

    { type: 'h2', text: 'Better metrics to use alongside BMI' },
    { type: 'h3', text: 'Waist circumference and waist-to-height ratio' },
    { type: 'p', text: 'Waist circumference measures visceral fat directly — the fat stored around internal organs most strongly linked to insulin resistance and cardiovascular disease. Commonly used risk thresholds are above 80cm for women and 94cm for men. An even simpler rule: divide waist circumference by height and aim to stay below 0.5.' },
    { type: 'h3', text: 'Waist-to-hip ratio' },
    { type: 'p', text: 'This captures body shape — abdominal storage ("apple" shape) versus hip and thigh storage ("pear" shape) — with abdominal storage carrying higher cardiovascular risk at the same total body weight. WHO considers below 0.90 for men and 0.80 for women as lower risk.' },
    { type: 'h3', text: 'Body fat percentage' },
    { type: 'p', text: 'Estimated through the US Navy circumference formula, skinfold calipers, or bioelectrical impedance, body fat percentage separates fat mass from lean mass directly — addressing BMI\u2019s core blind spot for athletic or muscular individuals.' },

    { type: 'h2', text: 'How to actually use BMI in practice' },
    { type: 'steps', steps: [
      { title: 'Calculate BMI as a starting point', detail: 'Treat the number as a reference, not a verdict — especially if it sits near a category boundary.' },
      { title: 'Cross-check with waist measurement', detail: 'If your BMI seems inconsistent with how you look and feel, measure waist circumference and waist-to-height ratio.' },
      { title: 'Weight body fat percentage more heavily if you train', detail: 'Anyone carrying visible muscle mass should treat BMI as the least informative of the available metrics.' },
      { title: 'Track trends over months', detail: 'A BMI moving consistently in one direction over time is more informative than any single snapshot.' },
      { title: 'Bring it to a doctor as one data point', detail: 'Not as a self-diagnosis tool used in isolation.' },
    ] },

    { type: 'quote', text: 'BMI is like a credit score — a useful summary that can be misleading in individual cases. Never make important decisions based on it alone.' },

    { type: 'callout', text: 'Check your BMI, ideal weight range, and see how your result compares to standard health thresholds.' },
  ],
};

export default post;
