export type Category = 'health' | 'finance';

export interface Calculator {
  slug: string; title: string; short: string; desc: string;
  metaDesc: string; category: Category; group: string; icon: string;
  popular?: boolean; tags: string[];
  tips: string[]; faq: { q: string; a: string }[];
  wflTopics?: { title: string; slug: string }[];
  recommendations?: { label: string; url: string; icon: string }[];
  /** Rich, original long-form content for SEO — explanation, formula, examples, use cases. */
  content?: {
    /** 2–4 sentence unique intro paragraph (not the same as metaDesc). */
    intro: string;
    /** "How it works" — explanation broken into labelled sections (rendered as H3s under an H2). */
    howItWorks: { title: string; body: string }[];
    /** Optional formula shown in a styled mono block. */
    formula?: { label: string; expr: string; note?: string };
    /** Worked examples with concrete numbers — great for featured snippets. */
    examples: { title: string; scenario: string; result: string }[];
    /** In-depth, original use-case insights — each becomes its own paragraph/heading. */
    useCases: { title: string; body: string }[];
  };
  /** Cross-category "pair with" links — the Health↔Wealth angle unique to this site. */
  pairWith?: { slug: string; reason: string }[];
  /** Real, specific errors people make using/reading this calculator, each with a concrete fix. */
  commonMistakes?: { mistake: string; fix: string }[];
  /** How to actually read the result — what a "good" vs "concerning" number means in plain language. */
  interpretation?: string;
}

export const CALCULATORS: Calculator[] = [
  // HEALTH — Body & Weight
  { slug:'bmi',category:'health',group:'Body & Weight',icon:'⚖️',popular:true,title:'BMI Calculator',short:'BMI',desc:'Find your Body Mass Index and see which weight category you fall into.',metaDesc:'Free BMI calculator. Metric and imperial. Healthy weight range included.',tags:['bmi','body mass index','weight'],tips:['BMI 18.5–24.9 is the normal range for most adults.','Athletes may score high from muscle, not fat.','Asian adults face higher health risk above BMI 23.','Pair BMI with waist measurement for a fuller picture.'],faq:[{q:'What is a healthy BMI?',a:'For most adults: under 18.5 is underweight, 18.5–24.9 is healthy, 25–29.9 is overweight, and 30+ is obese. Asian populations are generally considered at higher health risk at lower BMI values (above 23).'},{q:'Is BMI always accurate?',a:'No — it ignores muscle mass. Athletes can have a high BMI but be very healthy. Treat it as one screening indicator, not a definitive health measure.'},{q:'How do I lower my BMI?',a:'BMI decreases when you lose body fat. A calorie deficit of 500–750 calories/day typically leads to 0.5–0.75kg loss per week. Use our Calorie Calculator to find your specific target.'}],interpretation:'A single BMI reading is a snapshot, not a verdict. Under 18.5 with low energy or hair/skin changes is worth a doctor visit, not just "eat more." 18.5-24.9 with poor energy or strength can still hide a bad diet or high body fat — BMI alone won’t show that. 25-29.9 is a signal to act before it compounds, not a crisis. 30+ paired with high waist circumference is the combination that most strongly predicts real health risk — check the Waist-Hip Ratio and Body Fat calculators alongside this one before drawing conclusions.',commonMistakes:[{mistake:'Treating BMI as a fitness or body-composition score.',fix:'BMI cannot see muscle vs fat. A muscular athlete and a sedentary person can share the same BMI with completely different health profiles — pair it with the Body Fat calculator for the fuller picture.'},{mistake:'Panicking over a single point difference (e.g. 24.9 vs 25.1).',fix:'The category boundaries are population-level guidelines, not hard health cliffs. Track the trend over months, not a single day’s number — weight fluctuates 1-2kg daily from water and food alone.'},{mistake:'Using the same thresholds regardless of ethnicity.',fix:'Asian populations face measurably higher health risk at lower BMI values (above 23, not 25) — if you’re of Asian descent, treat 23+ as the point to start paying attention, not 25.'}],
    wflTopics:[{title:'What your BMI really means for your health',slug:'bmi-complete-guide'},{title:'Healthy weight loss: the science-backed approach',slug:'how-to-lose-weight-without-starving'}],
    content:{
      intro:'Body Mass Index (BMI) is a quick screening number that compares your weight to your height. Doctors, insurers and fitness apps all use it as a first checkpoint — not because it is perfect, but because it is fast, free, and correlates reasonably well with health risk across large populations. This calculator gives you your exact BMI instantly, tells you which official category you fall into, and shows the healthy weight range for your height so you know exactly how many kilograms separate you from the normal range.',
      howItWorks:[
        {title:'The BMI formula', body:'BMI is calculated as weight in kilograms divided by height in metres squared (BMI = kg ÷ m²). For imperial units, the formula becomes weight in pounds × 703, divided by height in inches squared. This calculator handles both unit systems automatically — just toggle between metric and imperial and the conversion happens instantly.'},
        {title:'Why height is squared', body:'Body weight tends to scale with the square of height because volume (and therefore mass) scales roughly with the square of a linear dimension for similarly-shaped bodies. Squaring height in the denominator removes most of the natural size advantage that taller people would otherwise have, making BMI a fairer comparison across different heights.'},
        {title:'The five BMI categories', body:'The World Health Organization defines five bands: under 18.5 is underweight, 18.5–24.9 is normal weight, 25–29.9 is overweight, 30–34.9 is Obese Class I, and 35 and above is Obese Class II or higher. Each band carries a different general health-risk profile, which this calculator highlights with colour-coded results.'},
      ],
      formula:{ label:'BMI formula (metric)', expr:'BMI = weight (kg) ÷ height (m)²', note:'Imperial: BMI = weight (lb) × 703 ÷ height (in)²' },
      examples:[
        { title:'Example 1 — Metric', scenario:'A person weighing 70 kg with a height of 175 cm (1.75 m).', result:'BMI = 70 ÷ (1.75 × 1.75) = 70 ÷ 3.0625 ≈ 22.9 — Normal weight' },
        { title:'Example 2 — Imperial', scenario:'A person weighing 180 lbs with a height of 5 ft 10 in (70 inches).', result:'BMI = 180 × 703 ÷ (70 × 70) = 126,540 ÷ 4,900 ≈ 25.8 — Overweight' },
        { title:'Example 3 — Healthy range for a fixed height', scenario:'For someone 165 cm tall, the normal BMI range (18.5–24.9) maps to a weight range.', result:'Healthy weight ≈ 50.4 kg to 67.8 kg for 165 cm height' },
      ],
      useCases:[
        { title:'Tracking progress during a weight-loss programme', body:'BMI is most useful as a trend, not a single snapshot. Recalculating it every 2–4 weeks during a weight-loss programme shows whether your changes in diet and exercise are moving you toward the normal range — and the calculator\'s goal-weight section shows exactly how many kilograms remain.'},
        { title:'A starting point before a medical check-up', body:'Many people use this calculator before a doctor visit to understand where they stand. While your doctor will look at additional factors (waist circumference, blood pressure, family history), arriving with your BMI already calculated makes that conversation more productive.'},
        { title:'Why athletes and very muscular people should look beyond BMI', body:'Because BMI cannot distinguish muscle from fat, a muscular athlete can show a BMI in the "overweight" band while having very low body fat. If your BMI seems high but you train regularly, pair this result with our Body Fat Percentage Calculator for a more complete picture.'},
        { title:'BMI and health risk in Asian populations', body:'Research shows that health risks linked to excess weight begin at lower BMI values for many Asian populations. Some health bodies recommend using 23 (rather than 25) as the overweight threshold for these groups — keep this in mind when interpreting borderline results.'},
      ],
    },
    pairWith:[
      { slug:'budget', reason:'Health and finances follow the same discipline — track one, and the other often improves too.' },
      { slug:'income-tax', reason:'A clear financial picture reduces stress, one of the hidden drivers of weight gain.' },
    ],
  },
  { slug:'ideal-weight',category:'health',group:'Body & Weight',icon:'🎯',title:'Ideal Weight Calculator',short:'Ideal Weight',desc:'See your ideal body weight from four medical formulas and the healthy BMI range.',metaDesc:'Free ideal weight calculator. Four medical formulas compared.',tags:['ideal weight','healthy weight'],tips:['No formula fits everyone — use as a guide.','The BMI range 18.5–24.9 is most widely accepted.'],faq:[{q:'Which formula is best?',a:'The BMI-based healthy range is most widely used. Each formula was derived from different populations.'}],wflTopics:[{title:'What is your ideal weight really?',slug:'bmi-complete-guide'}] ,
    content:{
      intro:'Ideal weight calculators give you a target range rather than a single number, because "ideal" genuinely depends on which formula you use, your frame size, and your fitness level. This calculator runs your height through four established medical formulas side by side, so you see the actual range clinicians have used historically rather than one arbitrary figure.',
      howItWorks:[
        {title:'Why four different formulas', body:'The Robinson, Miller, Devine, and Hamwi formulas were each developed in different decades (1950s–1980s) for different clinical purposes, mostly medication dosing. They agree broadly but not exactly, which is itself useful information — if all four cluster closely, that range is a more reliable target than any single formula in isolation.'},
        {title:'The Devine formula and why it still matters', body:'Devine\'s 1974 formula, originally created to standardise drug dosing calculations, remains the most widely cited "ideal body weight" formula in clinical literature today. It uses a base weight (50kg for men, 45.5kg for women) plus 2.3kg for every inch over 5 feet.'},
        {title:'BMI range as a cross-check', body:'Alongside the four named formulas, this calculator also shows the weight range corresponding to a BMI of 18.5–24.9 for your height — a useful sanity check since BMI is the most commonly referenced standard, even though it has its own well-documented limitations for muscular or very tall individuals.'},
      ],
      formula:{ label:'Robinson formula (1983)', expr:'Ideal weight (kg) = 52 + 1.9 × (height in inches − 60) [men]', note:'Women: 49 + 1.7 × (height in inches − 60)' },
      examples:[
        { title:'Example — 175cm male', scenario:'A man who is 175 cm tall (about 5 ft 9 in).', result:'Robinson formula gives an ideal weight of approximately 68.9 kg' },
        { title:'Example — BMI range cross-check', scenario:'Same person, using the BMI 18.5–24.9 normal range instead.', result:'Healthy weight range ≈ 56.7 kg to 76.2 kg — a wider band than any single formula alone' },
      ],
      useCases:[
        { title:'Why your "ideal" weight is a range, not one number', body:'No single formula is correct for everyone — frame size, muscle mass, and ethnicity all shift where a genuinely healthy weight sits for a given height. Use the spread across all four formulas as your real target range, not the single narrowest number.'},
        { title:'Setting a realistic weight goal', body:'If your current weight is meaningfully above every formula\'s estimate, treat the highest of the four estimates as a more achievable first milestone rather than the lowest — psychologically, hitting an early milestone matters more than chasing the most aggressive number first.'},
        { title:'When to ignore this calculator entirely', body:'Athletes, bodybuilders, and anyone with significant muscle mass should weight body fat percentage far more heavily than any ideal-weight formula, since none of these formulas can distinguish muscle from fat.'},
      ],
    },
  },
  { slug:'body-fat',category:'health',group:'Body & Weight',icon:'💪',title:'Body Fat Calculator',short:'Body Fat %',desc:'Estimate body fat percentage using the US Navy method. Shows fat and lean mass.',metaDesc:'Free body fat calculator. US Navy circumference method.',tags:['body fat','navy method'],tips:['Measure at the same time each day.','Body fat % is more useful than scale weight alone.'],faq:[{q:'How accurate is this?',a:'The US Navy method is within 3–4% of clinical DEXA scans when measured carefully.'}],wflTopics:[{title:'Body fat percentage: what the numbers mean',slug:'body-fat-percentage-guide'}],
    content:{
      intro:'Body fat percentage tells you what proportion of your total body weight is fat versus lean mass (muscle, bone, organs, water) — a more meaningful health indicator than weight alone, since two people at the same weight and height can have very different body compositions. This calculator uses the US Navy circumference method, which estimates body fat from simple tape-measure measurements without specialized equipment.',
      howItWorks:[
        {title:'The US Navy circumference method', body:'This method uses neck, waist, and (for women) hip circumference measurements, combined with height, in a formula derived from correlation studies against more precise body-composition measurement methods. It is widely used because it requires only a tape measure, making it accessible and repeatable at home.'},
        {title:'Why measurement consistency matters more than precision', body:'The circumference method has a margin of error of roughly 3-4% compared to clinical methods (like DEXA scans) when measurements are taken carefully — but this error becomes far less important if you measure the SAME way every time. Measure at the same time of day (ideally morning, before eating), in the same state of hydration, with the tape at the same anatomical landmarks.'},
        {title:'Fat mass vs lean mass — both numbers matter', body:'This calculator shows both your estimated fat mass (body fat % × total weight) and lean mass (the remainder) in absolute units, not just the percentage. Tracking lean mass over time is especially useful during weight loss — the goal is typically to preserve or even increase lean mass while fat mass decreases, rather than losing weight indiscriminately.'},
        {title:'How body fat ranges relate to health categories', body:'Generally accepted healthy ranges differ by sex (due to essential fat differences) and shift somewhat with age. Ranges are typically presented as bands (e.g., "athletic," "fitness," "average," "above average") rather than a single target number, because individual variation in where fat is healthily distributed is considerable.'},
      ],
      examples:[
        { title:'Example 1 — Tracking during a cut', scenario:'A person starts at 82 kg with an estimated 24% body fat (≈ 19.7 kg fat, ≈ 62.3 kg lean mass). After 3 months they weigh 76 kg with an estimated 19% body fat.', result:'New fat mass ≈ 14.4 kg (a loss of ≈ 5.3 kg fat) · New lean mass ≈ 61.6 kg (a loss of only ≈ 0.7 kg) — indicating the weight loss was overwhelmingly fat, not muscle' },
        { title:'Example 2 — Same weight, different composition', scenario:'Two people both weigh 75 kg and are both 175 cm tall. Person A has 15% body fat; Person B has 28% body fat.', result:'Person A: ≈ 11.25 kg fat, ≈ 63.75 kg lean mass. Person B: ≈ 21 kg fat, ≈ 54 kg lean mass — identical weight, but nearly double the fat mass and almost 10 kg less lean mass for Person B' },
        { title:'Example 3 — Why a small waist-measurement error matters', scenario:'A 2 cm measurement error on waist circumference for someone with a 85 cm true waist.', result:'Because waist circumference has an outsized effect in the formula, a 2 cm error can shift the estimated body fat percentage by roughly 1-2 percentage points — reinforcing why consistent measurement technique matters more than any single reading' },
      ],
      useCases:[
        { title:'Pairing with BMI for a fuller picture', body:'BMI alone cannot distinguish muscle from fat. If your BMI suggests "overweight" but your body fat percentage falls in a healthy range for your sex and age, body composition — not BMI — is the more accurate indicator. Use this calculator alongside the BMI Calculator whenever BMI results seem inconsistent with how you look or feel.'},
        { title:'Setting realistic body fat targets', body:'Very low body fat percentages (associated with visible muscle striations) are difficult to sustain long-term and are typically only maintained temporarily by competitive athletes. For general health, targeting the "fitness" or "average" range for your sex and age is realistic and sustainable for most people — extremely low targets often require restrictive practices that aren\'t suitable as a permanent lifestyle.'},
        { title:'Tracking trend, not single readings', body:'Day-to-day body fat estimates can fluctuate due to hydration, recent meals, and measurement variation. Take measurements weekly or every two weeks at the same time of day, and look at the TREND over 4-8 weeks rather than reacting to any single reading.'},
        { title:'Using lean mass to set protein targets', body:'A common guideline for protein intake during fat loss is based on lean body mass rather than total body weight (e.g., roughly 1.6-2.2g of protein per kg of lean mass for those doing resistance training). Once you have an estimated lean mass from this calculator, it can inform a more individualized protein target than total-weight-based rules of thumb.'},
      ],
    },
    pairWith:[
      { slug:'net-worth', reason:'Body composition and net worth are both "what\'s underneath the headline number" — total weight and total assets both hide the more useful breakdown.' },
      { slug:'savings-goal', reason:'Both body recomposition and savings goals are won through small consistent inputs sustained over months, not large one-time efforts.' },
    ],
  },
  { slug:'weight-loss',category:'health',group:'Body & Weight',icon:'🏃',popular:true,title:'Weight Loss Calculator',short:'Weight Loss',desc:'Find daily calorie targets and how long to reach your goal weight — 3 plan options.',metaDesc:'Free weight loss calculator. Daily calories and weeks to goal weight.',tags:['weight loss','calorie deficit','diet'],tips:['0.5–1 kg/week is the safe sustainable range.','Never eat below 1200 kcal (women) or 1500 kcal (men).','Add strength training to preserve muscle while losing fat.'],faq:[{q:'How fast can I safely lose weight?',a:'0.5–1 kg per week. Faster usually means losing muscle, not just fat.'}],interpretation:'The weekly loss rate matters more than the headline timeline. 0.5-1kg/week is the generally sustainable range for most adults — a plan that projects faster than that isn\'t necessarily wrong, but it usually means a larger deficit that\'s harder to stick to and more likely to cost muscle along with fat. If your target date implies faster than 1kg/week for more than the first couple of weeks (which are often water weight), treat the plan as aggressive rather than realistic.',commonMistakes:[{mistake:'Choosing a target date that implies an unsustainable weekly loss rate.',fix:'Work backward: divide your total kg to lose by weeks available. If that\'s over ~1kg/week for a non-obese starting point, either extend the timeline or expect the plan to slow down partway through.'},{mistake:'Not accounting for the fact that the first 1-2kg of loss is often water weight, not fat.',fix:'Expect faster loss in week 1-2, then a slower, more consistent rate after — don\'t panic when the rate "slows down," that\'s the plan working normally, not stalling.'},{mistake:'Treating the calculator\'s calorie deficit as exact rather than a starting estimate.',fix:'Individual metabolic variation means your real deficit could differ by 10-15% from the estimate. Track actual weight change for 2-3 weeks and adjust the plan based on what really happens.'}],
    wflTopics:[{title:'How to lose weight without starving yourself',slug:'how-to-lose-weight-without-starving'},{title:'The calorie deficit guide for beginners',slug:'understanding-tdee'}],recommendations:[{label:'Get a personalised diet plan',url:'https://wellfilab.com/plans/diet',icon:'🥗'}] ,
    content:{
      intro:'A weight-loss plan is really just a calorie deficit sustained over time, but the size of that deficit determines both how fast you lose weight and how likely you are to stick with the plan. This calculator shows three deficit sizes side by side so you can see the real tradeoff between speed and sustainability before committing to one.',
      howItWorks:[
        {title:'TDEE: your starting point', body:'Total Daily Energy Expenditure is calculated from your Basal Metabolic Rate (via the Mifflin-St Jeor equation) multiplied by an activity factor. This is the calorie level at which your weight would stay stable — every plan below is calculated as a deficit from this number.'},
        {title:'Why roughly 7,700 kcal equals 1kg of fat', body:'A kilogram of body fat stores approximately 7,700 kilocalories. A 500 kcal/day deficit therefore takes about 15.4 days to lose 1kg in theory — though real-world weight loss is rarely perfectly linear due to water retention and other factors.'},
        {title:'The 1,200 kcal safety floor', body:'This calculator never recommends a target below 1,200 kcal/day for women, regardless of how large a deficit the math suggests, since deficits below this floor risk nutrient deficiencies and are difficult to sustain regardless of motivation.'},
      ],
      formula:{ label:'Time to goal', expr:'Weeks = weight to lose (kg) ÷ (weekly deficit ÷ 7,700)', note:'500 kcal/day deficit ≈ 0.5 kg/week; 750 kcal/day ≈ 0.75 kg/week' },
      examples:[
        { title:'Example — moderate deficit', scenario:'Someone needing to lose 8 kg, using a 500 kcal/day deficit.', result:'Approximately 16 weeks (about 3.7 months) to reach the goal' },
        { title:'Example — aggressive deficit', scenario:'Same 8 kg goal, using a 750 kcal/day deficit instead.', result:'Approximately 11 weeks (about 2.5 months) — faster, but harder to sustain' },
      ],
      useCases:[
        { title:'Why slower is often genuinely faster', body:'Aggressive deficits are more likely to be abandoned partway through. A moderate, sustainable deficit that you actually complete beats an aggressive one you quit after three weeks — model both timelines here before choosing.'},
        { title:'Adjusting as you go', body:'Recalculate your TDEE every 4–5 kg lost, since a lighter body burns fewer calories at rest. Using your starting TDEE for the entire journey causes the plan to become inaccurate partway through.'},
        { title:'Pairing with resistance training', body:'A calorie deficit alone does not protect muscle mass. Pairing any of these plans with resistance training and adequate protein (see our Protein Intake Calculator) preserves more lean mass during the loss.'},
      ],
    },
  },
  // HEALTH — Nutrition
  { slug:'calories',category:'health',group:'Nutrition',icon:'🔥',popular:true,title:'Calorie & BMR Calculator',short:'Calories / BMR',desc:'Find your daily calorie needs based on size, age, activity and goal.',metaDesc:'Free TDEE and BMR calculator. Daily calorie needs for any goal.',tags:['calories','bmr','tdee','diet'],tips:['Recalculate every 5 kg of weight change.','500 kcal daily deficit ≈ 0.5 kg fat loss per week.'],faq:[{q:'What is BMR?',a:'Basal Metabolic Rate — calories burned at complete rest.'},{q:'What is TDEE?',a:'Total Daily Energy Expenditure — your actual daily calorie burn.'}],interpretation:'The calorie number this gives you (maintenance/TDEE) is a starting estimate, not a lab-measured fact — real energy expenditure varies person to person by 10-15% even with identical stats. Use the number as a starting point, track your actual weight for 2-3 weeks at that intake, then adjust up or down based on what really happens, not what the formula predicts.',commonMistakes:[{mistake:'Eating exactly the calculated number and expecting exact results.',fix:'Treat the estimate as a starting point. If your weight isn’t moving as expected after 2-3 weeks of consistent tracking, adjust by 100-150 calories rather than assuming the formula is wrong.'},{mistake:'Forgetting that a calorie deficit target lower than ~1200 (women) or ~1500 (men) is usually unsustainable and can backfire.',fix:'Very aggressive deficits often cause muscle loss and rebound weight gain. A 500-750 calorie/day deficit is typically both sustainable and effective for most people.'},{mistake:'Not re-calculating as your weight changes.',fix:'Your maintenance calories drop as you lose weight (a smaller body burns less energy). Recalculate every 5kg or so lost, not just once at the start.'}],
    wflTopics:[{title:'How to calculate and use your TDEE',slug:'understanding-tdee'},{title:'Calorie counting: helpful or harmful?',slug:'macro-counting-guide'}],
    content:{
      intro:'Every weight-management goal — losing fat, gaining muscle, or maintaining your current weight — ultimately comes down to the relationship between calories consumed and calories burned. This calculator estimates your Basal Metabolic Rate (BMR, the energy your body uses at complete rest) and your Total Daily Energy Expenditure (TDEE, your BMR plus activity), then shows the calorie target for your specific goal.',
      howItWorks:[
        {title:'BMR — your body\'s baseline energy use', body:'BMR represents the calories your body burns just to keep you alive — breathing, circulating blood, maintaining body temperature, cell repair — with zero physical activity. This calculator uses the Mifflin-St Jeor equation, widely considered one of the more accurate formulas for estimating BMR from weight, height, age, and sex.'},
        {title:'TDEE — adding your activity level', body:'TDEE = BMR × an activity multiplier (typically ranging from about 1.2 for sedentary lifestyles to 1.9+ for very active individuals with physical jobs or intense training). TDEE represents your actual daily calorie burn — the number that matters for weight management, since it accounts for everything BMR doesn\'t.'},
        {title:'Why a 500 kcal deficit ≈ 0.5 kg/week', body:'One kilogram of body fat represents roughly 7,700 kcal of stored energy. A consistent daily deficit of 500 kcal therefore creates a weekly deficit of approximately 3,500 kcal — close to 0.5 kg of fat loss per week. This is the basis for the commonly cited "500 kcal deficit for steady weight loss" guideline, though individual results vary due to water retention, metabolic adaptation, and measurement noise.'},
        {title:'Why this number needs to be recalculated periodically', body:'As you lose or gain weight, your BMR changes — a lighter body requires less energy at rest. This calculator\'s recommendation to recalculate every 5 kg of weight change exists because a calorie target set for your starting weight will gradually become inaccurate (too generous for weight loss, or insufficient for weight gain) as your weight changes.'},
      ],
      formula:{ label:'Mifflin-St Jeor BMR (metric)', expr:'Men: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5\nWomen: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161', note:'TDEE = BMR × activity multiplier (1.2–1.9+)' },
      examples:[
        { title:'Example 1 — Sedentary office worker', scenario:'30-year-old woman, 65 kg, 165 cm, sedentary lifestyle (activity multiplier 1.2), goal: maintain weight.', result:'BMR ≈ 1,365 kcal · TDEE ≈ 1,640 kcal · Maintenance target ≈ 1,640 kcal/day' },
        { title:'Example 2 — Active man aiming for fat loss', scenario:'35-year-old man, 85 kg, 178 cm, moderately active (multiplier 1.55), goal: lose 0.5 kg/week.', result:'BMR ≈ 1,790 kcal · TDEE ≈ 2,775 kcal · Target with 500 kcal deficit ≈ 2,275 kcal/day' },
        { title:'Example 3 — Recalculating after 5 kg loss', scenario:'Same man as Example 2, after losing 5 kg (now 80 kg), same activity level.', result:'New BMR ≈ 1,725 kcal · New TDEE ≈ 2,675 kcal — about 100 kcal/day lower than before, illustrating why targets need periodic recalculation' },
      ],
      useCases:[
        { title:'Choosing an honest activity multiplier', body:'The most common error in TDEE estimates is overestimating activity level — "moderately active" assumes structured exercise most days, not just an active job. If your weight tracking over 2-3 weeks doesn\'t match the predicted trend at your calculated target, your actual activity level (and therefore TDEE) is likely lower than selected — try the next level down.'},
        { title:'Why aggressive deficits often backfire', body:'A deficit much larger than 500-750 kcal/day (e.g., aiming to lose 1+ kg/week through diet alone for non-medical reasons) increases the risk of significant muscle loss alongside fat loss, and tends to be harder to sustain. This calculator deliberately frames its loss-rate suggestions around the 0.5 kg/week range as a sustainable default.'},
        { title:'Using TDEE for muscle gain, not just loss', body:'The same TDEE number works in reverse for muscle gain: a modest surplus of 200-300 kcal/day above TDEE, combined with resistance training, supports gradual muscle gain while limiting fat gain. Enter your TDEE here, then add this surplus manually for a gain-focused target.'},
        { title:'Calories are a tool, not a moral measurement', body:'This calculator provides a starting estimate, not a rigid prescription — actual energy needs vary by 10-15% even between people with identical stats due to individual metabolic differences. Use the number as a starting point, track real-world results for 2-3 weeks, and adjust based on what you observe rather than treating the initial estimate as exact.'},
      ],
    },
    pairWith:[
      { slug:'budget', reason:'Tracking calories and tracking spending use the same skill — noticing where the numbers actually go versus where you assume they go.' },
      { slug:'compound', reason:'A small daily calorie deficit compounds into significant fat loss over months, the same way small daily savings compound into significant wealth over years.' },
    ],
  },
  { slug:'water',category:'health',group:'Nutrition',icon:'💧',title:'Water Intake Calculator',short:'Water Intake',desc:'Find your daily water target based on weight, activity and climate.',metaDesc:'Free water intake calculator based on weight and activity.',tags:['water','hydration'],tips:['Drink a glass first thing in the morning.','Pale yellow urine = well hydrated.'],faq:[{q:'Is 8 glasses a day correct?',a:'Needs vary by weight, activity and climate — use this calculator for a personalised target.'}],wflTopics:[{title:'Why hydration matters more than you think',slug:'water-intake-science'}] ,
    content:{
      intro:'Daily water needs depend on more than just bodyweight — activity level and climate both shift the real number meaningfully. This calculator starts from a bodyweight-based baseline and adjusts it for both factors, rather than relying on the often-repeated but oversimplified "8 glasses a day" rule.',
      howItWorks:[
        {title:'The bodyweight baseline', body:'A widely used clinical guideline is roughly 33ml of water per kilogram of bodyweight per day from all sources, including food. This calculator uses that baseline as the starting point before any adjustment.'},
        {title:'Activity adjustment', body:'Each level of physical activity adds a fixed amount, from 0ml for sedentary up to 1,000ml for very active days, reflecting the additional fluid lost through sweat during exercise.'},
        {title:'Climate adjustment', body:'Hot climates add up to 500ml to account for increased perspiration, while cold climates subtract a modest amount, since thirst and fluid loss both decrease somewhat in cold weather.'},
      ],
      formula:{ label:'Daily water target', expr:'ml = (weight in kg × 33) + activity adjustment + climate adjustment' },
      examples:[
        { title:'Example — moderate activity, temperate climate', scenario:'A 70 kg person with moderate activity in a temperate climate.', result:'Target ≈ 2,810 ml (about 2.8 litres, or roughly 11 glasses)' },
        { title:'Example — sedentary, hot climate', scenario:'Same 70 kg person, but sedentary and in a hot climate.', result:'Target ≈ 2,810 ml as well — the hot-climate addition offsets the lack of activity addition in this case' },
      ],
      useCases:[
        { title:'Why "8 glasses a day" is an oversimplification', body:'That commonly cited figure traces back to a 1945 US recommendation of about 2.5 litres total — and the original guidance explicitly noted most of that comes from food, not deliberate drinking. It was never meant as a universal target ignoring bodyweight or climate.'},
        { title:'Using urine colour as a real-time check', body:'Pale straw to pale yellow generally indicates good hydration; dark yellow suggests you are behind. This is a free, immediate cross-check alongside the calculated target.'},
        { title:'When to drink more than this calculator suggests', body:'Pregnancy, breastfeeding, fever, and high-altitude travel all increase fluid needs beyond this baseline calculation — treat this number as a starting point, not an absolute ceiling, in those situations.'},
      ],
    },
  },
  { slug:'macros',category:'health',group:'Nutrition',icon:'🥗',title:'Macro Calculator',short:'Macros',desc:'Get protein, carbs and fat targets for your daily calories and goal.',metaDesc:'Free macro calculator. Protein, carbs and fat targets.',tags:['macros','protein','nutrition'],tips:['Hit protein first — it is the most important macro.','Time carbs around workouts for better energy.'],faq:[{q:'Do I need to count macros forever?',a:'Track for 4 weeks to build food awareness, then most people eat by feel.'}],wflTopics:[{title:'Macro counting: the beginner guide',slug:'macro-counting-guide'}],recommendations:[{label:'Get a custom nutrition plan',url:'https://wellfilab.com/plans/nutrition',icon:'📋'}] ,
    content:{
      intro:'Counting calories alone tells you about quantity, but macronutrient ratios, the split between protein, carbohydrates, and fat, determine how those calories actually support your specific goal, whether that is fat loss, muscle gain, or general health maintenance. This calculator translates a calorie target into concrete gram amounts for each macronutrient, based on your goal.',
      howItWorks:[
        {title:'What macronutrients actually do', body:'Protein supports muscle repair and growth and tends to be the most satiating macronutrient per calorie. Carbohydrates are the body\u2019s primary fuel source, particularly for higher-intensity exercise. Fat supports hormone production and the absorption of certain vitamins. All three matter, but their ideal ratio shifts depending on your goal.'},
        {title:'Why protein needs scale with goal, not just weight', body:'Protein targets are typically set higher during a calorie deficit, since adequate protein helps preserve muscle mass while losing fat, and higher still when actively building muscle through resistance training. A flat protein recommendation that ignores your specific goal tends to undershoot what is actually useful.'},
        {title:'Converting grams to calories', body:'Protein and carbohydrates each provide roughly 4 calories per gram, while fat provides roughly 9 calories per gram, more than double. This is why a small increase in fat grams has a larger calorie impact than the same gram increase in protein or carbs, and why fat is often the macronutrient adjusted to fine-tune a final calorie target.'},
        {title:'Macros are a target, not a rule to obsess over', body:'Hitting macro targets within a reasonable range, generally within a small margin either way, supports the underlying goal just as effectively as hitting them with exact precision. Treating macros as a flexible guide rather than a rigid daily requirement tends to be more sustainable long-term.'},
      ],
      examples:[
        { title:'Example 1 — Fat loss with muscle preservation', scenario:'A 2,200 calorie target for someone in a deficit aiming to preserve muscle.', result:'A typical split might allocate roughly 165-175g protein, 220g carbohydrates, and 60g fat, prioritizing higher protein specifically to protect lean mass during the deficit' },
        { title:'Example 2 — Muscle gain with a calorie surplus', scenario:'A 2,800 calorie target for someone in a modest surplus aiming to build muscle.', result:'Protein might be set similarly high in absolute terms, around 175-185g, with carbohydrates increased to roughly 320g to fuel training, and fat around 75g' },
        { title:'Example 3 — General maintenance', scenario:'A 2,400 calorie target for someone maintaining their current weight with moderate activity.', result:'A more balanced split, perhaps 150g protein, 270g carbohydrates, and 80g fat, without the goal-specific emphasis a deficit or surplus would require' },
      ],
      useCases:[
        { title:'Adjusting macros without changing total calories', body:'If a calorie target is working for weight management but the macro split feels wrong, for example feeling low energy during workouts, the carbohydrate-to-fat ratio can often be adjusted within the same total calorie figure rather than changing the calorie target itself.'},
        { title:'Macros for specific training styles', body:'Endurance athletes often benefit from a higher carbohydrate proportion to fuel longer training sessions, while strength-focused training may tolerate a somewhat lower carbohydrate share in favor of higher protein, though individual response varies and experimentation within a reasonable range is normal.'},
        { title:'Tracking macros without obsessive precision', body:'Many people find success tracking macros loosely, hitting protein targets consistently since it is the macronutrient most linked to specific outcomes like muscle preservation, while treating carbohydrate and fat splits more flexibly day to day.'},
        { title:'Macros change as your calorie target changes', body:'If your TDEE or calorie target shifts due to weight change or activity level change, recalculate macros alongside it rather than keeping old gram targets fixed against a new calorie baseline, since the ratios were originally set relative to that specific calorie number.'},
      ],
    },
    pairWith:[
      { slug:'protein-intake', reason:'This calculator splits all three macronutrients by percentage — the Protein Intake Calculator gives a more activity-specific gram target if protein is your main focus.' },
      { slug:'budget', reason:'Macro tracking and budget tracking share the same underlying skill: noticing exactly where your resources go, calories or rupees, rather than assuming.' },
    ]},
  // HEALTH — Fitness
  { slug:'heart-rate',category:'health',group:'Fitness',icon:'❤️',title:'Heart Rate Zone Calculator',short:'Heart Rate Zones',desc:'Find your 5 training zones for fat burning, cardio and peak performance.',metaDesc:'Free heart rate zone calculator by age and resting heart rate.',tags:['heart rate','cardio','training zones'],tips:['Zone 2 burns the most fat per calorie.','A resting HR below 60 bpm indicates good cardiovascular fitness.'],faq:[{q:'What is max heart rate?',a:'220 minus your age is the standard estimate. Individual variation is ±10–20 bpm.'}],wflTopics:[{title:'Heart rate training zones explained simply',slug:'heart-rate-zones-training'}] ,
    content:{
      intro:'Training at the wrong heart rate intensity wastes effort — too easy and you barely stimulate adaptation, too hard and you cannot sustain it long enough to build real fitness. This calculator gives you all five training zones, calculated from your actual resting heart rate, not just a generic age-based estimate.',
      howItWorks:[
        {title:'Maximum heart rate estimate', body:'This calculator uses the widely used 220 minus age formula for estimated maximum heart rate. It is a population-level estimate with real individual variation, so treat it as a reasonable starting point rather than a lab-tested exact figure.'},
        {title:'Heart rate reserve (the Karvonen method)', body:'Rather than applying zone percentages directly to your max heart rate, this calculator uses heart rate reserve — the gap between your max and resting heart rate — which produces more individually accurate zones, especially if your resting heart rate is notably low or high.'},
        {title:'The five zones explained', body:'Zone 1 (50–60%) is recovery pace. Zone 2 (60–70%) builds aerobic base. Zone 3 (70–80%) is comfortably hard cardio. Zone 4 (80–90%) is lactate threshold work. Zone 5 (90–100%) is maximum effort, sustainable only briefly.'},
      ],
      formula:{ label:'Karvonen method', expr:'Target HR = resting HR + (zone % × heart rate reserve)', note:'Heart rate reserve = max HR − resting HR' },
      examples:[
        { title:'Example — 30-year-old, resting HR 65', scenario:'Max HR = 220 − 30 = 190. Heart rate reserve = 190 − 65 = 125.', result:'Zone 2 (fat burn, 60–70%) = 140–152 bpm' },
        { title:'Example — same age, lower resting HR of 55', scenario:'A fitter individual with a resting HR of 55 instead of 65.', result:'Zone 2 shifts down slightly to about 136–149 bpm — fitness level changes your personal zones' },
      ],
      useCases:[
        { title:'Why most training should happen in Zone 2', body:'Research on elite endurance athletes consistently shows roughly 75–80% of total training volume happens at low intensity (Zone 1–2). For recreational exercisers, building a base of mostly Zone 2 work with one higher-intensity session per week tends to outperform constant moderate-intensity training.'},
        { title:'Using zones for fat loss vs performance goals', body:'Zone 2 is generally most efficient for sustainable fat-burning sessions, while Zone 4–5 intervals drive the largest cardiovascular fitness gains in the least total time — choose based on your specific goal, not just "more is better."'},
        { title:'Recalculating as fitness improves', body:'Resting heart rate typically drops as cardiovascular fitness improves, which shifts your zones lower over time. Recalculate every few months rather than training to zones calculated when you were less fit.'},
      ],
    },
  },
  { slug:'calories-burned',category:'health',group:'Fitness',icon:'🏋️',title:'Calories Burned Calculator',short:'Calories Burned',desc:'Estimate calories burned during 18+ exercises and daily activities.',metaDesc:'Free calories burned calculator. MET-based estimates for 18+ activities.',tags:['calories burned','exercise'],tips:['Non-exercise movement adds 15–30% to your daily burn.'],faq:[{q:'How accurate are these?',a:'Within 20–30% of actual — good for planning trends.'}],wflTopics:[{title:'The best exercises to burn calories fast',slug:'heart-rate-zones-training'}] ,
    content:{
      intro:'Calories burned during exercise depend on your bodyweight, the activity itself, and duration — not a flat number per minute that applies to everyone equally. This calculator uses MET (Metabolic Equivalent of Task) values, the same standard used in exercise physiology research, for accurate activity-specific estimates.',
      howItWorks:[
        {title:'What a MET value actually means', body:'One MET represents the energy cost of sitting quietly — roughly 1 kcal per kg of bodyweight per hour. An activity with a MET of 8 (like running) burns roughly 8 times that resting rate, which is why heavier individuals burn more calories doing the identical activity for the identical duration.'},
        {title:'Why duration matters more than intensity for total burn', body:'A 30-minute run and a 60-minute brisk walk can burn a similar total number of calories despite very different intensities, because total burn is intensity (MET) multiplied by time. This is genuinely useful for choosing an activity that fits your available time and joint tolerance.'},
        {title:'Why fitness trackers often overestimate', body:'Most consumer fitness trackers overestimate calorie burn by 20–40% on average compared to lab-measured values, because wrist-based heart rate sensors and motion algorithms are imperfect proxies. MET-based calculations like this one tend to be more conservative and research-grounded.'},
      ],
      formula:{ label:'MET formula', expr:'Calories = MET × weight (kg) × (minutes ÷ 60)' },
      examples:[
        { title:'Example — running, 70kg, 30 minutes', scenario:'Running has a MET value of 8. 70 kg person runs for 30 minutes.', result:'Calories burned ≈ 280 kcal' },
        { title:'Example — walking vs running, same duration', scenario:'Same 70kg person, 30 minutes of brisk walking (MET 3.5) instead.', result:'Calories burned ≈ 123 kcal — less than half of running for the same time' },
      ],
      useCases:[
        { title:'Choosing activities by calorie efficiency per minute', body:'If time is your limiting factor, compare MET values directly — running, swimming, and HIIT all sit around MET 7–9, roughly double the burn rate of walking or yoga for the same duration.'},
        { title:'Why this should not dictate how much you eat back', body:'Eating back 100% of estimated exercise calories frequently undermines a calorie deficit, since both trackers and MET estimates carry real margins of error. Many practitioners suggest eating back only 50% of estimated exercise calories as a more conservative approach.'},
        { title:'Combining with a weekly target rather than a daily one', body:'Total weekly calories burned through exercise is a more stable, meaningful number than any single day\'s estimate, since daily variation in duration and intensity is normal and expected.'},
      ],
    },
  },
  { slug:'steps',category:'health',group:'Fitness',icon:'👟',title:'Steps to Calories Calculator',short:'Steps → Calories',desc:'Convert your step count to calories burned and distance.',metaDesc:'Free steps to calories calculator.',tags:['steps','walking'],tips:['10,000 steps ≈ 5 km ≈ 300–500 calories for most people.'],faq:[{q:'How many steps to lose weight?',a:'10,000+ daily combined with healthy eating supports gradual weight loss.'}],wflTopics:[{title:'Why walking is one of the best exercises',slug:'heart-rate-zones-training'}] ,
    content:{
      intro:'Step count converts directly into distance and calories burned once your stride length and bodyweight are factored in — two 10,000-step days are not equal for a 150cm person and a 190cm person. This calculator personalises the conversion using your actual height and weight.',
      howItWorks:[
        {title:'Stride length from height', body:'This calculator estimates stride length as roughly 41.3% of height — a standard approximation used in pedometer research. Taller people cover more distance per step, which is why raw step counts alone do not tell the full distance story.'},
        {title:'Calories from steps', body:'Calorie burn from walking is estimated using bodyweight and total steps together, since heavier individuals expend more energy moving the same distance — consistent with the MET-based approach used in the Calories Burned Calculator.'},
        {title:'Why 10,000 steps became the standard target', body:'The 10,000-step target originated from a 1960s Japanese marketing campaign for a pedometer, not from a specific clinical trial. Later research has found meaningful health benefits even from 7,000–8,000 steps, with diminishing additional benefit somewhere past 10,000–12,000 for most health outcomes.'},
      ],
      formula:{ label:'Distance from steps', expr:'Distance (km) = steps × stride length (m) ÷ 1000', note:'Stride length ≈ height (cm) × 0.413 ÷ 100' },
      examples:[
        { title:'Example — 10,000 steps, 175cm, 70kg', scenario:'A person 175cm tall, weighing 70kg, walking 10,000 steps in a day.', result:'Distance ≈ 7.23 km, calories burned ≈ 350 kcal' },
        { title:'Example — same steps, shorter height', scenario:'A person 155cm tall walking the same 10,000 steps.', result:'Distance ≈ 6.4 km — meaningfully less than the taller person for the identical step count' },
      ],
      useCases:[
        { title:'Why step count alone is an incomplete picture', body:'Distance and calorie burn from steps depend on your specific height and weight, which is why comparing raw step counts between two people of different builds is somewhat misleading — compare distance or calories instead for a fairer comparison.'},
        { title:'Setting a realistic target if you are currently sedentary', body:'Research suggests meaningful mortality risk reduction begins well below 10,000 steps — even reaching 7,000 steps consistently captures much of the benefit. A lower, sustainable target beaten consistently outperforms an ambitious target abandoned after a week.'},
        { title:'Steps as NEAT — the most underrated lever in weight management', body:'Non-Exercise Activity Thermogenesis (everyday movement like walking) varies by 300–500 calories/day between otherwise similar people. Increasing daily steps is one of the lowest-effort ways to raise this without structured exercise.'},
      ],
    },
  },
  // HEALTH — Life
  { slug:'sleep',category:'health',group:'Life',icon:'😴',title:'Sleep Cycle Calculator',short:'Sleep Cycles',desc:'Find the best wake times based on 90-minute sleep cycles.',metaDesc:'Free sleep calculator. Best wake times from sleep cycles.',tags:['sleep','wake time'],tips:['5–6 complete cycles (7.5–9 hours) is ideal.','Consistent wake times regulate your body clock.'],faq:[{q:'What is a sleep cycle?',a:'About 90 minutes of NREM and REM sleep. Waking mid-cycle causes grogginess.'}],wflTopics:[{title:'How to improve sleep quality naturally',slug:'sleep-science-complete-guide'},{title:'Sleep and weight loss: the surprising link',slug:'sleep-science-complete-guide'}] ,
    content:{
      intro:'Waking up groggy often has less to do with total sleep duration and more to do with which point in your sleep cycle you wake up during. This calculator works backward from a wake time, or forward from a bedtime, using the well-documented 90-minute sleep cycle to suggest times that align with the end of a cycle rather than the middle of one.',
      howItWorks:[
        {title:'What a sleep cycle actually is', body:'Sleep moves through stages, light sleep, deep sleep, and REM sleep, in a repeating pattern that takes roughly 90 minutes to complete. Waking up near the end of a cycle, when sleep is naturally lighter, tends to feel easier than waking up during deep sleep in the middle of a cycle.'},
        {title:'Why this calculator uses 90-minute increments', body:'Suggested bed times or wake times are calculated in multiples of roughly 90 minutes from your target time, plus a buffer to account for the time it typically takes to fall asleep. This is why the suggestions appear in a specific pattern rather than as a single recommended time.'},
        {title:'Individual variation in cycle length', body:'The 90-minute figure is a population average — actual cycle length varies somewhat by individual and even night to night for the same person. The suggested times are a useful starting estimate to experiment with, not a precise guarantee for every person on every night.'},
        {title:'Sleep cycles vs total sleep need', body:'This calculator helps with timing within a night, but total sleep duration across multiple nights still matters enormously for health — most adults need somewhere in the range of 7-9 hours per night, and optimizing wake timing does not substitute for adequate total sleep over time.'},
      ],
      examples:[
        { title:'Example 1 — Working backward from a wake time', scenario:'Needing to wake up at 6:30 AM.', result:'Suggested bed times might include roughly 9:00 PM, 10:30 PM, and midnight, each representing a different number of full 90-minute cycles before the wake time, plus a buffer to fall asleep' },
        { title:'Example 2 — Working forward from a bedtime', scenario:'Going to bed at 11:00 PM.', result:'Suggested wake times might include roughly 5:30 AM, 7:00 AM, and 8:30 AM, again representing different numbers of complete cycles from that bedtime' },
        { title:'Example 3 — Comparing two wake options 90 minutes apart', scenario:'Choosing between waking at 6:00 AM versus 7:30 AM, both aligned with cycle ends from the same bedtime.', result:'Both times are positioned at the end of a cycle and may feel similarly easy to wake from, despite the 90-minute difference in total sleep, since the cycle-alignment matters more for grogginess than the small duration difference in this case' },
      ],
      useCases:[
        { title:'Using this for an important early morning', body:'Before a day that requires being especially alert, such as an exam or important meeting, planning bedtime around a cycle-aligned wake time can reduce the chance of waking up during deep sleep and feeling disoriented, on top of simply getting adequate total sleep.'},
        { title:'Adjusting gradually rather than all at once', body:'If a suggested bedtime is much earlier or later than your current routine, shifting by 15-30 minutes every few days tends to be easier to sustain than an abrupt change, since your body\u2019s internal clock adapts gradually rather than instantly.'},
        { title:'This is a starting point, not a substitute for consistency', body:'The biggest lever for sleep quality is usually a consistent sleep and wake schedule maintained across most days, including weekends, rather than precisely timing one particular night using cycle calculations.'},
        { title:'When grogginess persists despite cycle-aligned timing', body:'If waking up still feels difficult even at cycle-aligned times across multiple attempts, the underlying issue may be total sleep debt, sleep quality disrupted by factors like screen exposure or caffeine timing, or an underlying sleep disorder worth discussing with a doctor rather than continuing to adjust timing alone.'},
      ],
    },
    pairWith:[
      { slug:'heart-rate', reason:'Both sleep quality and cardiovascular fitness compound over weeks, not single nights or single workouts — track both for the fuller picture.' },
      { slug:'calories', reason:'Sleep and calorie balance interact more than most people expect — poor sleep is linked to disrupted hunger hormones and harder-to-sustain calorie targets.' },
    ]},
  { slug:'age',category:'health',group:'Life',icon:'🎂',title:'Age Calculator',short:'Age',desc:'Find your exact age in years, months and days. Days until next birthday.',metaDesc:'Free age calculator. Exact age and next birthday countdown.',tags:['age','birthday'],tips:['Healthy habits can lower your biological age below your real age.'],faq:[{q:'How is age calculated?',a:'From date of birth to today, counting exact years, months and days.'}] ,
    content:{
      intro:'This calculator gives you your exact age down to the day, plus the total number of days and hours you have been alive, and counts down to your next birthday — small numbers that are surprisingly satisfying to see laid out precisely rather than rounded to the nearest year.',
      howItWorks:[
        {title:'Exact year/month/day calculation', body:'Rather than simply subtracting years, this calculator accounts for whether your birth month and day have occurred yet this year, and correctly handles month-length differences (28–31 days) when calculating the day component.'},
        {title:'Total days and hours alive', body:'Calculated as the precise difference in milliseconds between your date of birth and right now, converted to days and then hours — accounting for leap years automatically since it works from actual calendar dates rather than an approximate 365.25-day-per-year estimate.'},
        {title:'Days until your next birthday', body:'Finds the next occurrence of your birth month and day from today\'s date, rolling forward to next year if this year\'s birthday has already passed.'},
      ],
      formula:{ label:'Age in years/months/days', expr:'Years = current year − birth year (adjusted for whether the birthday has occurred yet this year)' },
      examples:[
        { title:'Example — born 15 March 1995, today is 18 June 2026', scenario:'Birthday has already occurred this year (March before June).', result:'Age = 31 years, 3 months, 3 days — roughly 11,419 days alive' },
        { title:'Example — born 20 December 1995, today is 18 June 2026', scenario:'Birthday has not yet occurred this year (December after June).', result:'Age = 30 years, 5 months, 29 days — the year count is one less since the birthday is still upcoming' },
      ],
      useCases:[
        { title:'Why total days alive is a fun, occasionally useful number', body:'Some people mark milestones like their 10,000th day alive (about 27.4 years) as a small personal celebration — this calculator surfaces that number automatically without needing to do the maths yourself.'},
        { title:'Planning around an upcoming birthday', body:'The days-until-next-birthday figure is useful for gift planning, scheduling celebrations, or simply satisfying curiosity about how soon the count resets.'},
        { title:'Age calculations for forms and eligibility checks', body:'Many official forms require an exact age in years as of a specific date — this calculator gives you that precisely, removing any manual subtraction error around birthday timing.'},
      ],
    },
  },
  { slug:'due-date',category:'health',group:'Life',icon:'🤰',title:'Pregnancy Due Date Calculator',short:'Due Date',desc:'Calculate estimated due date from last period. See trimester and days remaining.',metaDesc:'Free pregnancy due date calculator. EDD and trimester.',tags:['pregnancy','due date'],tips:['Only 5% of babies arrive exactly on the due date.'],faq:[{q:'How is EDD calculated?',a:"Add 280 days to the first day of your last period (Naegele's Rule)."}],wflTopics:[{title:'Pregnancy nutrition: what to eat each trimester',slug:'macro-counting-guide'}] ,
    content:{
      intro:'This calculator estimates your due date using the standard obstetric method based on your last menstrual period (LMP), the same approach used by most doctors and midwives at an initial visit before an ultrasound provides a more precise estimate. It also shows your current week, trimester, and days remaining.',
      howItWorks:[
        {title:"Naegele's Rule — the 280-day standard", body:'The standard estimate adds 280 days (40 weeks) to the first day of your last menstrual period. This assumes a 28-day cycle with ovulation around day 14, which is why it is an estimate rather than a guaranteed date — actual cycle length varies between individuals.'},
        {title:'Why pregnancy is measured in weeks from LMP, not conception', body:'Medically, pregnancy is dated from the first day of the last period, not the (harder to know precisely) date of conception, which typically occurs about two weeks later. This is why a pregnancy described as "6 weeks" usually means roughly 4 weeks since actual conception.'},
        {title:'Trimester boundaries', body:'The first trimester runs through week 13, the second trimester through week 27, and the third trimester from week 28 until birth — this calculator automatically flags which trimester you are currently in based on the date entered.'},
      ],
      formula:{ label:"Naegele's Rule", expr:'Due date = LMP date + 280 days' },
      examples:[
        { title:'Example — early pregnancy', scenario:'Last menstrual period began exactly 6 weeks (42 days) ago.', result:'Currently in week 6, first trimester, with approximately 238 days (34 weeks) remaining until the estimated due date' },
        { title:'Example — entering third trimester', scenario:'Last menstrual period began 28 weeks (196 days) ago.', result:'Currently in week 28, the start of the third trimester, with approximately 84 days (12 weeks) remaining' },
      ],
      useCases:[
        { title:'Why your due date may shift after an ultrasound', body:'An early ultrasound measuring fetal size often provides a more accurate estimate than LMP-based dating alone, particularly for people with irregular cycles. It is normal and expected for a doctor to adjust the due date by several days after this scan.'},
        { title:'Planning around the estimated date', body:'Only about 5% of babies are born on their exact estimated due date — treat this as the centre of a normal range (roughly 1–2 weeks before to 1–2 weeks after) rather than a precise prediction.'},
        { title:'Using trimester information for milestone planning', body:'Knowing your exact current week and trimester helps with timing common prenatal milestones — many anatomy scans, glucose screenings, and other check-ups are scheduled relative to specific weeks of pregnancy.'},
      ],
    },
  },
  // FINANCE — Grow Money
  { slug:'compound',category:'finance',group:'Grow Money',icon:'📈',popular:true,title:'Compound Interest Calculator',short:'Compound Interest',desc:'See how money grows with monthly contributions, annual step-up and yearly top-ups.',metaDesc:'Free compound interest calculator with step-up and yearly breakdown.',tags:['compound interest','investment','savings'],tips:['Starting 10 years earlier can double your final amount.','Rule of 72: divide 72 by return rate = years to double.'],faq:[{q:'What is compound interest?',a:'Earning interest on your original amount plus previously earned interest.'},{q:'What is a step-up?',a:'Increasing your monthly contribution by a fixed % each year.'}],interpretation:'Small rate differences matter more than they look. Over 20-30 years, a 2% difference in assumed annual return can change the final value by a huge margin — the effect compounds, it doesn\'t just add. Focus more on starting early and staying consistent than on chasing a slightly higher rate.',commonMistakes:[{mistake:'Underestimating how much starting a few years earlier matters.',fix:'Because compounding is exponential, money invested in your 20s can outgrow a much larger amount invested in your 30s. Time in the market matters more than the exact monthly amount for long horizons.'},{mistake:'Assuming compounding is smooth and guaranteed year to year.',fix:'This calculator shows the smoothed, average-return outcome. Real markets go up and down — some years negative — even if the long-run average matches the assumption you entered.'},{mistake:'Comparing pre-tax figures across different investment types.',fix:'A 7% FD and a 7% equity fund do not leave you with the same after-tax money — FD interest is taxed annually at your slab rate, while equity gains are typically taxed only on withdrawal and at a lower rate. Compare post-tax figures for an apples-to-apples decision.'}],
    wflTopics:[{title:'Compound interest: the 8th wonder of the world',slug:'compound-interest-complete-guide'},{title:'How to start investing with small amounts',slug:'how-to-invest-first-salary'}],recommendations:[{label:'Best index funds',url:'https://wellfilab.com/recommend/index-funds',icon:'📊'},{label:'Start a SIP today',url:'https://wellfilab.com/recommend/sip',icon:'💰'}],
    content:{
      intro:'Compound interest is what turns modest, regular saving into significant wealth — Einstein reportedly called it the eighth wonder of the world because growth feeds on itself. This calculator projects your investment\'s future value with annual compounding, optional monthly contributions, an annual step-up percentage, and shows you the real (inflation-adjusted) value of your final corpus so you understand its true purchasing power, not just the headline number.',
      howItWorks:[
        {title:'The compounding formula', body:'The core formula is A = P × (1 + r/n)^(n×t), where P is your principal, r is the annual interest rate (as a decimal), n is the number of times interest compounds per year, and t is the number of years. Each compounding period, interest is calculated not just on your original principal but on the principal plus all interest accumulated so far.'},
        {title:'How monthly contributions change the maths', body:'When you add a fixed amount every month, each contribution starts compounding from the day it is invested. This calculator runs a month-by-month simulation rather than a simplified annual approximation, so the total reflects exactly how a real investment account would grow.'},
        {title:'What an annual step-up does', body:'A step-up increases your monthly contribution by a fixed percentage every year — for example, increasing a ₹5,000/month SIP by 10% annually means you contribute ₹5,500/month in year two, ₹6,050/month in year three, and so on. Because most people\'s incomes rise over time, a step-up that tracks salary growth can dramatically increase the final corpus without feeling like a bigger sacrifice.'},
        {title:'Why the "real value" number matters', body:'A future value of ₹1 crore sounds impressive, but if inflation runs at 6% for 20 years, that ₹1 crore will only buy what about ₹31 lakh buys today. This calculator shows both the nominal final value and the inflation-adjusted real value side by side, so your planning is grounded in actual purchasing power.'},
      ],
      formula:{ label:'Compound interest (with periodic compounding)', expr:'A = P × (1 + r/n)^(n×t)', note:'P = principal, r = annual rate, n = compounding periods per year, t = years' },
      examples:[
        { title:'Example 1 — Lump sum, no contributions', scenario:'₹1,00,000 invested at 10% annual return, compounded annually, for 10 years.', result:'A = 1,00,000 × (1.10)^10 ≈ ₹2,59,374 — more than 2.5× growth' },
        { title:'Example 2 — With monthly contributions', scenario:'₹1,00,000 initial + ₹5,000/month added, at 12% annual return, for 15 years.', result:'Final value ≈ ₹26–28 lakh, of which roughly ₹10 lakh is principal and the rest is growth' },
        { title:'Example 3 — Step-up impact', scenario:'Same as Example 2, but with a 10% annual step-up on the monthly contribution.', result:'Final value increases by roughly 30–40% over the no-step-up scenario, for the same starting contribution' },
      ],
      useCases:[
        { title:'Comparing "start now" vs "wait 5 years"', body:'Run this calculator twice — once with your current age and target retirement age, and once assuming you start 5 years later with the same monthly amount. The gap between the two final values is the true cost of delay, and it is almost always far larger than people expect because the lost years were the most valuable compounding years.'},
        { title:'Choosing between a lump sum and spreading it out', body:'If you receive a bonus or inheritance, this calculator helps you see the difference between investing it all immediately versus spreading it across 12 months. Generally, investing immediately wins on average because it spends more time compounding — but spreading it out reduces the risk of investing everything at a market peak.'},
        { title:'Setting a realistic step-up rate', body:'A step-up rate close to your expected annual salary growth (often 8–12% in early-career years in India) keeps your investment contribution at a roughly constant share of income. Try modelling 0%, 5%, and 10% step-ups to see how sensitive your final corpus is to this single assumption.'},
        { title:'Sanity-checking "double your money" claims', body:'The Rule of 72 (72 ÷ rate = years to double) is a quick mental check, but this calculator gives you the exact figure including contributions — useful for verifying whether a return rate someone is promising you is realistic over your investment horizon.'},
      ],
    },
    pairWith:[
      { slug:'fire', reason:'Compound growth is the engine behind your FIRE number — see how today\'s contributions map to financial independence.' },
      { slug:'calories', reason:'The "step-up" habit that grows your wealth works the same way for fitness — small consistent increases compound into big results.' },
    ],
  },
  { slug:'sip',category:'finance',group:'Grow Money',icon:'💹',popular:true,title:'SIP / Recurring Investment Calculator',short:'SIP / Recurring',desc:'Calculate returns from monthly investments with step-up and full yearly breakdown.',metaDesc:'Free SIP calculator with step-up and yearly breakdown.',tags:['sip','recurring investment','401k'],tips:['A 10% annual step-up dramatically increases final returns.','Stay invested through dips — time in market beats timing.'],faq:[{q:'What is SIP and how does it work?',a:'A Systematic Investment Plan means investing a fixed amount every month into a mutual fund. Rupee-cost averaging means you automatically buy more units when markets are low and fewer when high.'},{q:'What return can I expect from SIP?',a:'Nifty 50 index funds have historically returned roughly 11-13% CAGR over 10+ years; debt funds typically return 6-8%. Past returns do not guarantee future performance.'},{q:'Is SIP better than lump sum?',a:'SIP reduces timing risk through averaging, while a lump sum can outperform in a rising market. For most people SIP wins because it builds the savings habit automatically, regardless of market timing.'},{q:'What is a step-up SIP?',a:'Increasing your monthly contribution by a fixed % each year — usually 10-20%, in line with salary growth. Step-up SIP dramatically improves your final corpus versus a flat contribution.'}],interpretation:'The final corpus number is only as reliable as the return rate you assumed — a 12% assumption over 20 years and a 10% assumption over the same period can differ by lakhs, even though both are "reasonable" historical averages. Treat the output as a plausible range, not a guarantee, and re-check it yearly against your actual portfolio performance rather than trusting the original projection blindly.',commonMistakes:[{mistake:'Assuming a flat, unrealistically high return rate (15%+) for the entire period.',fix:'Nifty 50 index funds have historically returned roughly 11-13% CAGR over 10+ year periods — use a conservative 10-12% for planning, not the best few years you\'ve seen quoted.'},{mistake:'Stopping the SIP during a market downturn.',fix:'Downturns are when rupee-cost averaging buys you the most units per rupee. Stopping contributions specifically when prices are low undermines the entire mechanism that makes SIP work.'},{mistake:'Ignoring step-up and assuming the same monthly amount forever.',fix:'A flat SIP loses real value to inflation and ignores rising income. Even a 10%/year step-up dramatically changes the final corpus — model it explicitly rather than assuming a static number for 20 years.'}],
    wflTopics:[{title:'SIP vs lump sum: which is better?',slug:'sip-vs-lump-sum'},{title:'Best mutual funds for beginners',slug:'sip-vs-lump-sum'}],recommendations:[{label:'Compare mutual funds',url:'https://wellfilab.com/recommend/mutual-funds',icon:'📈'}],
    content:{
      intro:'A Systematic Investment Plan (SIP), or recurring investment, lets you invest a fixed amount every month into mutual funds, index funds or retirement accounts — turning a habit into a sizeable corpus through rupee-cost averaging and compounding. This calculator projects your SIP\'s maturity value, total invested amount, and total gains, with optional step-up and an initial lump sum, plus a full yearly breakdown table.',
      howItWorks:[
        {title:'How SIP maturity is calculated', body:'Each monthly instalment compounds from the month it is invested until the end of your tenure. Mathematically, the future value of a SIP is the sum of a series of compounding cash flows: FV = Σ [instalment × (1 + r)^n], where r is the monthly rate of return and n is the number of months that instalment has been invested.'},
        {title:'Rupee-cost averaging explained', body:'Because you invest the same amount every month regardless of market price, you automatically buy more units when prices are low and fewer when prices are high. Over time this averages your purchase cost and reduces the impact of trying (and failing) to time the market — though it does not guarantee profits.'},
        {title:'Step-up SIP mechanics', body:'A step-up SIP increases your monthly contribution by a fixed percentage each year. This calculator applies the step-up at each anniversary of your SIP and recalculates the contribution for the following 12 months, then continues compounding — matching how most mutual fund platforms implement step-up SIPs.'},
        {title:'Reading the yearly breakdown table', body:'The table shows, for each year of your SIP: the contribution made that year, the cumulative amount invested, and the portfolio value at year-end. This makes it easy to see the year-over-year acceleration — early years show contributions dominating the total, while later years show returns dominating.'},
      ],
      formula:{ label:'SIP future value (monthly compounding)', expr:'FV = Σ [instalment × (1 + r)ⁿ]  for each month n', note:'r = monthly return rate = annual rate ÷ 12' },
      examples:[
        { title:'Example 1 — Classic SIP', scenario:'₹5,000/month for 15 years at an expected 12% annual return, no step-up.', result:'Total invested ≈ ₹9,00,000 · Maturity value ≈ ₹25–26 lakh' },
        { title:'Example 2 — With 10% annual step-up', scenario:'Same as Example 1, but the monthly amount increases by 10% every year.', result:'Total invested ≈ ₹17.5 lakh · Maturity value ≈ ₹38–40 lakh — roughly 50% higher' },
        { title:'Example 3 — SIP + lump sum', scenario:'₹2,00,000 lump sum invested upfront, plus ₹3,000/month for 20 years at 12%.', result:'The lump sum alone grows to roughly ₹19–20 lakh; combined with the SIP, total maturity exceeds ₹50 lakh' },
      ],
      useCases:[
        { title:'Matching SIP amount to a future goal', body:'Use this calculator alongside the Goal-Based Savings Calculator: first find out how much monthly investment a target (like a ₹50 lakh house down payment in 10 years) requires, then come back here to see how a step-up could let you start with a smaller, more comfortable amount.'},
        { title:'Why "time in market" beats "timing the market"', body:'Run the calculator with the same monthly amount but different start dates 5 years apart. The difference in final value — driven purely by those extra 5 years of compounding — is usually far larger than any gain from trying to pick the "perfect" entry point.'},
        { title:'Stress-testing your assumptions', body:'Equity mutual funds do not return a steady 12% every year — returns are volatile. Try the calculator at 8%, 12%, and 15% to build a realistic range of outcomes rather than anchoring on a single optimistic number.'},
        { title:'SIP vs lump sum for a windfall', body:'If you receive a large one-time amount, this calculator (with the lump-sum field) shows how it compares to investing the same total amount as a SIP over the same period — useful context before deciding how to deploy a bonus, gift, or inheritance.'},
      ],
    },
    pairWith:[
      { slug:'fire', reason:'Your SIP is the engine of your FIRE number — model how a step-up SIP shortens your path to financial independence.' },
      { slug:'water', reason:'Small, consistent daily habits compound for your body the same way SIPs compound for your money.' },
    ],
  },
  { slug:'savings-goal',category:'finance',group:'Grow Money',icon:'🏦',title:'Savings Goal Calculator',short:'Savings Goal',desc:'How long to reach a savings goal — or how much to save monthly to hit it by a date.',metaDesc:'Free savings goal calculator. Time or monthly amount needed.',tags:['savings','savings goal'],tips:['Automate savings on payday — save first, spend what is left.'],faq:[{q:'What savings rate should I aim for?',a:'20% of income is the standard target.'}],wflTopics:[{title:'How to save your first big goal',slug:'how-to-invest-first-salary'}] ,
    content:{
      intro:'This calculator answers the question every savings goal eventually raises: given what you can realistically save each month and a reasonable expected return, how long will it actually take to reach your target? It accounts for compound growth on your balance, not just the raw sum of your monthly contributions.',
      howItWorks:[
        {title:'Why compounding shortens the timeline', body:'Every month, your existing balance earns a return before the new contribution is added, so later months require less new money to keep growing the balance at the same pace. This is why the projected payoff is faster than simply dividing your goal by your monthly contribution.'},
        {title:'The role of your starting balance', body:'Any amount you already have saved compounds alongside your future contributions for the entire period, which is why even a modest existing balance can meaningfully shorten your time to goal.'},
        {title:'Choosing a realistic rate assumption', body:'This calculator lets you set the expected annual return — use a conservative rate (around 6–7%) for safer instruments like FDs or PPF, or a higher rate (10–12%) only if the money will genuinely be invested in equity for the full duration.'},
      ],
      formula:{ label:'Monthly compounding', expr:'Balance next month = (current balance × (1 + monthly rate)) + monthly contribution' },
      examples:[
        { title:'Example — 10 lakh goal, starting from zero', scenario:'Goal of ₹10,00,000, saving ₹10,000/month, expected 8% annual return.', result:'Reaches the goal in approximately 77 months (about 6.4 years)' },
        { title:'Example — same goal, higher contribution', scenario:'Same ₹10,00,000 goal, but saving ₹15,000/month instead at the same 8% return.', result:'Reaches the goal noticeably faster — illustrating how sensitive the timeline is to the monthly contribution amount' },
      ],
      useCases:[
        { title:'Stress-testing your timeline against a lower return', body:'Run the same goal at a more conservative rate (say 6% instead of 10%) to see how much longer it would take if your investments underperform expectations — this helps you build in a realistic buffer rather than assuming the best case.'},
        { title:'Deciding between increasing contributions or extending the timeline', body:'If the calculated time-to-goal feels too long, compare the effect of increasing your monthly contribution by a fixed amount versus accepting a longer timeline — often a modest contribution increase shortens the timeline more than expected, due to compounding.'},
        { title:'Setting goals for specific life events', body:'This calculator works well for any fixed-amount goal with a flexible timeline — a wedding fund, a down payment, or a large purchase — where you want to know "how long," not "how much per month" (use the related Investment Goal calculator for that direction instead).'},
      ],
    },
  },
  { slug:'investment-goal',category:'finance',group:'Grow Money',icon:'🎯',title:'Investment Goal Calculator',short:'Investment Goal',desc:'Find how much to invest monthly to reach any target by a specific date.',metaDesc:'Free investment goal calculator. Monthly investment needed.',tags:['investment goal'],tips:['The earlier you start, the less you need each month.'],faq:[{q:'What if I cannot afford the monthly amount?',a:'Extend the timeline, lower the target, or increase income.'}],wflTopics:[{title:'Goal-based investing: a step-by-step guide',slug:'how-to-invest-first-salary'}],recommendations:[{label:'Best investment options',url:'https://wellfilab.com/recommend/investments',icon:'💎'}] ,
    content:{
      intro:'This calculator works in the opposite direction from a typical savings goal — instead of asking how long a fixed contribution takes to reach a target, it tells you exactly how much you need to invest each month to hit a specific goal by a specific date, which is usually the more practical question when you have a fixed deadline.',
      howItWorks:[
        {title:'Solving for the monthly contribution', body:'Given your goal amount, current savings, number of months remaining, and expected return, this calculator solves directly for the required monthly contribution — the reverse calculation from a standard SIP or savings projection.'},
        {title:'Why a longer timeline dramatically reduces the required monthly amount', body:'Because compounding does more of the work over a longer period, extending your timeline by even a few years can reduce the required monthly contribution substantially — small timeline changes often matter more than they first appear to.'},
        {title:'Why existing savings reduce the required contribution', body:'Any current balance compounds for the full remaining period, directly reducing how much new monthly money is needed — this calculator factors that starting balance in rather than ignoring it.'},
      ],
      formula:{ label:'Required monthly contribution', expr:'Monthly = (goal − current × (1+r)^months) × r ÷ ((1+r)^months − 1)', note:'r = monthly rate; if r = 0, simply (goal − current) ÷ months' },
      examples:[
        { title:'Example — child education fund', scenario:'Goal of ₹25,00,000 in 15 years (180 months), starting from ₹2,00,000 already saved, expecting 10% annual return.', result:'Required monthly investment is meaningfully lower than the naive (goal ÷ months) calculation would suggest, due to 15 years of compounding on both the starting balance and ongoing contributions' },
        { title:'Example — shorter timeline comparison', scenario:'Same ₹25,00,000 goal, but only 8 years (96 months) remaining instead of 15.', result:'Required monthly contribution increases substantially — illustrating why starting earlier matters more than the goal amount itself' },
      ],
      useCases:[
        { title:'Reverse-engineering a goal-based investment plan', body:'Rather than investing an arbitrary amount and hoping it adds up, this calculator lets you start from the goal and work backward to the exact contribution needed — useful for any deadline-driven target like a wedding, a down payment, or a child\'s education fund.'},
        { title:'Comparing the cost of delaying the start', body:'Run the same goal with your intended start date versus starting one year later — the increase in required monthly contribution is a concrete way to see the real cost of procrastination.'},
        { title:'Choosing between a higher contribution and a riskier asset class', body:'If the required monthly amount feels unaffordable at a conservative return assumption, compare it against the required amount at a higher (equity-level) return — this clarifies the actual tradeoff between contribution size and investment risk.'},
      ],
    },
  },
  // FINANCE — Borrow Money
  { slug:'loan',category:'finance',group:'Borrow Money',icon:'🏛️',popular:true,title:'Loan & EMI Calculator',short:'Loan / EMI',desc:'Calculate monthly payments, total interest and full amortization. Compare extra payment impact.',metaDesc:'Free loan EMI calculator with amortization and extra payment analysis.',tags:['emi','loan','interest'],tips:['Even one extra payment per year cuts your loan significantly.','A 0.5% lower rate on a large loan saves thousands.'],faq:[{q:'How is EMI calculated?',a:'EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is principal, r is the monthly interest rate, and n is the number of months. This calculator does it instantly.'},{q:'Does paying extra EMI help?',a:'Yes, significantly. Even ₹5,000 extra per month on a ₹50L home loan at 8.5% over 20 years can save roughly ₹15L in interest and cut 4-5 years off the loan — try it in the extra payment field above.'},{q:'What is the maximum EMI I can afford?',a:'A common rule of thumb is that EMI should not exceed 40% of your net monthly income. Banks typically approve loans where the EMI-to-income ratio stays under 50%.'}],interpretation:'The EMI number is fixed and predictable, but "total interest payable" is where the real cost lives — for a typical 20-year home loan, total interest can exceed the principal itself. Look at the total-payable figure, not just whether the EMI fits your monthly budget, before deciding a loan is affordable.',commonMistakes:[{mistake:'Judging affordability purely by whether the EMI fits this month\'s budget.',fix:'A loan that "fits" today can break under a job loss, rate hike, or income dip over a 20-year term. Keep total EMI (all loans combined) under roughly 40% of net income, not the maximum the bank approves.'},{mistake:'Not accounting for rate hikes on a floating-rate loan.',fix:'A 1-2% rate increase over a 20-year loan meaningfully raises either your EMI or your tenure. Stress-test the EMI at 2% higher than the current rate before committing.'},{mistake:'Ignoring how much extra payments actually save.',fix:'Even a modest extra payment early in the loan (when interest makes up most of each EMI) can cut years and lakhs off the total cost — use the extra-payment field above rather than assuming it\'s not worth the effort.'}],
    wflTopics:[{title:'How to get the best loan interest rate',slug:'home-loan-guide-india'},{title:'Should you prepay your loan?',slug:'home-loan-guide-india'}],
    content:{
      intro:'Whether it is a home loan, car loan or personal loan, the EMI (Equated Monthly Instalment) determines how much of your monthly budget is committed for years — sometimes decades. This calculator computes your exact EMI, total interest payable over the life of the loan, and the full month-by-month amortization schedule, plus shows exactly how much time and interest you save by making extra payments.',
      howItWorks:[
        {title:'The EMI formula', body:'EMI = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1], where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the total number of monthly instalments (loan tenure in months). This formula ensures every instalment is identical while the split between principal and interest changes each month.'},
        {title:'Why early EMIs are mostly interest', body:'In the early months of a loan, the outstanding principal is at its highest, so the interest portion of each EMI is largest and the principal portion is smallest. As the principal reduces month by month, the interest portion shrinks and the principal portion grows — even though the total EMI stays constant. This is why prepaying early in a loan saves dramatically more interest than prepaying near the end.'},
        {title:'How extra payments accelerate payoff', body:'Any extra amount you pay each month goes 100% toward reducing the principal (since the EMI has already covered that month\'s interest). A smaller principal means every subsequent month\'s interest is calculated on a smaller base — creating a snowball effect that can cut years off a 20-year loan with a relatively modest extra payment.'},
        {title:'Reading the amortization table', body:'Each row shows, for a given month or year: the EMI paid, how much went to interest, how much went to principal, and the remaining loan balance. The "total interest payable" figure is the sum of every interest portion across the entire schedule — for long-tenure loans, this can exceed the original loan amount.'},
      ],
      formula:{ label:'EMI formula', expr:'EMI = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1]', note:'P = principal, r = monthly rate, n = number of months' },
      examples:[
        { title:'Example 1 — Home loan', scenario:'₹40,00,000 loan at 8.5% annual interest for 20 years (240 months).', result:'EMI ≈ ₹34,700/month · Total interest over 20 years ≈ ₹43.3 lakh — more than the loan itself' },
        { title:'Example 2 — Car loan', scenario:'₹8,00,000 loan at 9% annual interest for 5 years (60 months).', result:'EMI ≈ ₹16,600/month · Total interest ≈ ₹1.97 lakh' },
        { title:'Example 3 — Impact of ₹5,000/month extra payment', scenario:'Same ₹40,00,000 / 8.5% / 20-year loan as Example 1, with an extra ₹5,000 paid every month.', result:'Loan paid off roughly 6–7 years early, saving approximately ₹15–18 lakh in interest' },
      ],
      useCases:[
        { title:'Deciding between a 15-year and 20-year tenure', body:'A longer tenure lowers your EMI but increases total interest substantially. Run this calculator at both 15 and 20 years for the same loan amount and rate — the EMI difference might be smaller than you expect, while the total-interest difference is often dramatic.'},
        { title:'Is a 0.25% rate difference worth refinancing for?', body:'On a large, long-tenure loan, even a small rate reduction compounds into significant savings. Enter your current rate, then re-run with a 0.25% or 0.5% lower rate to quantify exactly how much a refinance could save before factoring in processing fees.'},
        { title:'Building an annual prepayment habit', body:'Rather than a fixed monthly extra amount, many borrowers make one lump prepayment per year (e.g., from a bonus). While this calculator models monthly extra payments, you can approximate an annual lump sum by dividing it by 12 and entering that as your "extra monthly payment" for a close estimate.'},
        { title:'Understanding the real cost of "0% interest" offers', body:'Retail "0% interest" EMI offers on purchases often hide the cost in the product price itself. Use this calculator to see what the EMI would be at a realistic interest rate (say 14–18% for unsecured credit) on the same amount and tenure — if the advertised 0% EMI matches that number, the discount has likely been folded into the price.'},
      ],
    },
    pairWith:[
      { slug:'budget', reason:'Before taking on an EMI, see how it fits within your monthly budget using the 50/30/20 framework.' },
      { slug:'net-worth', reason:'A loan is a liability — track how it affects your overall net worth as you pay it down.' },
    ],
  },
  { slug:'mortgage',category:'finance',group:'Borrow Money',icon:'🏠',title:'Mortgage Calculator',short:'Mortgage',desc:'Full home loan EMI with property tax, insurance, and total cost of ownership.',metaDesc:'Free mortgage calculator. EMI, total interest, property tax, insurance and total cost of home ownership.',tags:['mortgage','home loan','emi','property tax','insurance'],tips:['A 20% down payment removes PMI costs.','Fixed rates are safer for long-term planning.','Total cost of home = price + total interest — often 2x the price.'],faq:[{q:'Fixed or variable rate?',a:'Fixed is predictable and safe. Variable may start lower but can rise.'},{q:'What is included in monthly mortgage payment?',a:'EMI + property tax + home insurance = total housing cost.'}],wflTopics:[{title:'First-time home buyer guide',slug:'home-loan-guide-india'}],
    content:{
      intro:'A mortgage is likely the single largest financial commitment most people ever make — often 15-30 years of monthly payments, with the total interest paid frequently exceeding the original loan amount. This calculator computes your exact monthly payment, shows the full amortization breakdown, and quantifies precisely how much faster you can be mortgage-free with extra payments.',
      howItWorks:[
        {title:'How the monthly payment is calculated', body:'The standard mortgage formula is the same as any amortizing loan: M = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1], where P is the loan principal (home price minus down payment), r is the monthly interest rate, and n is the total number of monthly payments. This produces a fixed payment that, over the full term, exactly pays off both principal and interest.'},
        {title:'Why your down payment matters more than it seems', body:'A larger down payment does two things simultaneously: it reduces the principal P in the formula above (lowering every future payment), and in many markets it can remove the requirement for private mortgage insurance (PMI) — an additional monthly cost charged when the loan-to-value ratio is high. Crossing the 20% down payment threshold often produces savings beyond the simple interest-rate math.'},
        {title:'Front-loaded interest, back-loaded principal', body:'In the early years of a 20-30 year mortgage, the overwhelming majority of each payment goes toward interest, not principal — because interest is calculated on the (still-large) outstanding balance. This is why making extra payments in the first 5-10 years has a dramatically larger effect on total interest than making the same extra payments near the end of the term.'},
        {title:'The true cost of "just a bit more per month"', body:'Because of how amortization compounds, a relatively small consistent extra payment — even 5-10% of your regular payment — can cut years off a 30-year mortgage and save a substantial fraction of total interest. This calculator\'s extra-payment field shows this effect directly, in both years saved and rupees/dollars saved.'},
      ],
      formula:{ label:'Monthly mortgage payment', expr:'M = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1]', note:'P = loan principal, r = monthly interest rate, n = total number of payments' },
      examples:[
        { title:'Example 1 — Standard 30-year mortgage', scenario:'₹50,00,000 loan at 8% annual interest for 30 years (360 months), no extra payments.', result:'Monthly payment ≈ ₹36,700 · Total interest over 30 years ≈ ₹82 lakh — more than 1.6× the loan amount' },
        { title:'Example 2 — Same loan, 15-year term', scenario:'Same ₹50,00,000 at 8%, but a 15-year term (180 months).', result:'Monthly payment ≈ ₹47,800 (about 30% higher) · Total interest drops to ≈ ₹36 lakh — less than half of the 30-year scenario' },
        { title:'Example 3 — Extra payments on the 30-year loan', scenario:'Example 1\'s loan, with an extra ₹5,000 paid every month from day one.', result:'Loan paid off roughly 8-10 years early, saving approximately ₹25-30 lakh in total interest' },
      ],
      useCases:[
        { title:'Choosing between 15-year and 30-year terms', body:'A 15-year mortgage has a higher monthly payment but dramatically lower total interest — often less than half. Run both scenarios through this calculator with your actual numbers: if the 15-year payment fits comfortably in your budget, the long-term savings are substantial. If it would strain your finances, the 30-year term with optional extra payments offers similar flexibility with a lower mandatory minimum.'},
        { title:'Is it worth buying points to lower your rate?', body:'Lenders sometimes offer to lower your rate in exchange for an upfront fee ("points"). Run this calculator at both your quoted rate and the reduced rate — the difference in total interest over the time you expect to hold the mortgage tells you whether the upfront cost is worth it.'},
        { title:'Refinancing math: when does it pay off?', body:'If rates have dropped since you took your mortgage, refinancing resets your amortization schedule. Compare your current remaining balance and rate against a new loan at the lower rate (including any refinancing fees) — this calculator helps quantify the interest savings to weigh against those costs.'},
        { title:'Building extra payments into your budget gradually', body:'Rather than committing to a large extra payment immediately, try modelling smaller amounts first — even an extra ₹2,000-3,000/month. Because of how amortization compounds, even modest extra payments made consistently over many years produce meaningful reductions in both loan term and total interest.'},
      ],
    },
    pairWith:[
      { slug:'budget', reason:'A mortgage is usually your largest fixed expense — see how it fits in a 50/30/20 budget before signing.' },
      { slug:'net-worth', reason:'A mortgage is both a large liability and the path to home equity — track how it shifts your net worth over time.' },
    ],
  },
  { slug:'debt-payoff',category:'finance',group:'Borrow Money',icon:'🧹',title:'Debt Payoff Calculator',short:'Debt Payoff',desc:'How long to clear all debts. Compare avalanche (saves most money) vs snowball (builds momentum).',metaDesc:'Free debt payoff calculator. Avalanche vs snowball comparison.',tags:['debt payoff','avalanche','snowball'],tips:['Avalanche saves money. Snowball builds motivation. Pick one you will stick to.'],faq:[{q:'Avalanche or snowball?',a:'Avalanche wins mathematically. Snowball wins psychologically.'}],wflTopics:[{title:'How to get out of debt in 2 years',slug:'debt-payoff-complete-guide'}],
    content:{
      intro:'When you have multiple debts — credit cards, personal loans, store cards — the ORDER in which you pay them off changes both how much total interest you pay and how quickly you feel progress. This calculator compares the two most common strategies, avalanche and snowball, showing the exact payoff timeline and total interest for each so you can choose with full information rather than a generic recommendation.',
      howItWorks:[
        {title:'The avalanche method', body:'Avalanche order: pay minimums on all debts, then direct every extra rupee toward the debt with the HIGHEST interest rate first. Once that debt is cleared, roll its entire payment (minimum + extra) into the next-highest-rate debt, and so on. This mathematically minimizes total interest paid across all debts.'},
        {title:'The snowball method', body:'Snowball order: pay minimums on all debts, then direct every extra rupee toward the debt with the SMALLEST BALANCE first, regardless of interest rate. Once cleared, roll that payment into the next-smallest balance. This typically pays slightly more total interest than avalanche, but produces "wins" (fully paid-off debts) faster — which research on financial behaviour suggests helps many people stay motivated.'},
        {title:'Why the "roll-over" effect accelerates both methods', body:'In both methods, once a debt is paid off, its ENTIRE payment (not just the extra portion) gets redirected to the next debt. This means your effective extra payment grows with each debt eliminated — early payoffs in either method create a snowball/avalanche effect on the remaining debts, which is where both methods get their names.'},
        {title:'How much extra payment changes the picture', body:'Even a modest extra payment beyond minimums dramatically shortens debt-free timelines, because minimum payments on high-interest debt are often structured to barely cover interest — meaning the principal barely decreases without extra payments. This calculator shows the payoff date with and without your specified extra payment.'},
      ],
      examples:[
        { title:'Example 1 — Two debts, avalanche', scenario:'Credit card: ₹2,00,000 at 36% APR (min ₹6,000); Personal loan: ₹3,00,000 at 14% APR (min ₹8,000). Extra payment: ₹5,000/month.', result:'Avalanche directs the ₹5,000 extra to the 36% credit card first — typically clears in 12-15 months, then the freed-up payment accelerates the personal loan' },
        { title:'Example 2 — Same debts, snowball', scenario:'Same two debts and extra payment as Example 1, but snowball prioritizes the smaller ₹2,00,000 balance regardless of its rate.', result:'In this case avalanche and snowball happen to agree (the smaller balance also has the higher rate) — but with three or more debts they often diverge, and avalanche typically saves several thousand rupees more in total interest' },
        { title:'Example 3 — Impact of doubling the extra payment', scenario:'Same debts as Example 1, but extra payment increased from ₹5,000 to ₹10,000/month.', result:'Total payoff time typically drops by roughly 30-40% (not 50%, due to the non-linear way interest compounds) — and total interest paid drops by a larger percentage than the time does' },
      ],
      useCases:[
        { title:'When snowball is the better choice despite costing more', body:'If you have struggled to stick with a debt payoff plan before, the psychological wins from snowball\'s faster "debt eliminated" milestones may be worth the (usually modest) extra interest cost. Compare both totals in this calculator — if the difference is small relative to your total debt, the motivational benefit of snowball may outweigh it.'},
        { title:'Consolidation as a third option', body:'If one of your debts carries a very high rate (common with credit cards), consider whether a consolidation loan at a lower blended rate is available. Run this calculator with your current debts, then again with a single consolidated debt at the new rate and combined balance, to compare total interest and payoff time.'},
        { title:'The "debt-free date" as a planning anchor', body:'Once you have a concrete debt-free date from this calculator, you can plan what happens to that monthly payment afterward — redirecting it to an emergency fund, then investments, continues the same "roll-over" momentum that accelerated your debt payoff into building wealth.'},
        { title:'Why minimum-payments-only is the worst-case baseline', body:'Run the calculator with ₹0 extra payment first to see your "do nothing extra" baseline — for high-interest debt, this can show payoff timelines of a decade or more, with total interest exceeding the original balance. This baseline makes the impact of any extra payment, however small, immediately visible.'},
      ],
    },
    pairWith:[
      { slug:'sleep', reason:'Debt stress is strongly linked to poor sleep — a concrete payoff date can reduce the open-ended anxiety that disrupts rest.' },
      { slug:'budget', reason:'Your extra debt payment has to come from somewhere — a 50/30/20 budget shows you exactly how much room you have.' },
    ],
  },
  // FINANCE — Plan Ahead
  { slug:'retirement',category:'finance',group:'Plan Ahead',icon:'🌅',popular:true,title:'Retirement Calculator',short:'Retirement',desc:'Find corpus needed, monthly savings required and your FIRE number. Inflation-adjusted.',metaDesc:'Free retirement calculator. Corpus and monthly savings, inflation-adjusted.',tags:['retirement','pension'],tips:['4% rule: withdraw 4%/year — sustainable for 30+ years.','Starting at 25 vs 35 can halve the monthly savings needed.'],faq:[{q:'How much corpus do I need to retire?',a:'A common formula: monthly expense at retirement × 12 × 25. For ₹50,000/month today, inflation-adjusted to roughly ₹1.34L/month at 60, that works out to about ₹4Cr — this calculator does the inflation adjustment for your own numbers.'},{q:'What is a safe withdrawal rate?',a:'4% annually is widely considered safe — historically it means a well-invested portfolio lasts 30+ years. A ₹2Cr corpus at 4% gives ₹8L/year, or about ₹66,700/month to spend.'},{q:'Should I include EPF in retirement planning?',a:'Yes. EPF at retirement can contribute significantly to your corpus — enter your expected EPF amount as part of your current savings in this calculator.'},{q:'What if I want to retire at 50 instead of 60?',a:'You will need a larger corpus (a longer retirement to fund) built in less time. This calculator accepts any retirement age — try changing it to 50 to see the required monthly savings.'}],interpretation:'The corpus number is inflation-adjusted, which means it will look large — that\'s intentional, not an error. A ₹4Cr number for someone retiring in 30 years reflects what that money will actually be worth then, not today\'s prices. Compare the "monthly savings required" figure against your real current income, not the intimidating headline corpus number, to judge whether the plan is actually achievable.',commonMistakes:[{mistake:'Comparing the future corpus number to today\'s salary and concluding it\'s impossible.',fix:'The corpus is inflation-adjusted to your retirement year — a ₹4Cr target in 30 years is not the same as needing ₹4Cr worth of today\'s purchasing power. Focus on the monthly savings figure instead.'},{mistake:'Not including EPF, existing PPF, or other retirement accounts as current savings.',fix:'Leaving out EPF/PPF understates how far along you already are. Add your expected EPF corpus at retirement as part of "current savings" for a realistic monthly-savings-required number.'},{mistake:'Using a single flat withdrawal rate assumption without a safety margin.',fix:'4% is a widely-cited historical guideline, not a guarantee — some retirees using 4% ran short in worst-case historical sequences. Consider 3.5% for extra safety if you\'re retiring earlier than 60.'}],
    wflTopics:[{title:'Retirement planning in your 30s',slug:'retirement-planning-india'},{title:'NPS vs PPF: which is better?',slug:'retirement-planning-india'}],recommendations:[{label:'Best retirement plans',url:'https://wellfilab.com/recommend/retirement',icon:'🌅'},{label:'Compare NPS and PPF',url:'https://wellfilab.com/recommend/nps-ppf',icon:'📋'}],
    content:{
      intro:'Retirement planning answers two deceptively simple questions: how much money will you need, and how much should you save each month to get there? This calculator projects your retirement corpus requirement based on your current expenses, expected inflation, years to retirement, and post-retirement life expectancy — then works backward to tell you the monthly savings required, all in inflation-adjusted terms.',
      howItWorks:[
        {title:'Why future expenses are higher than today\'s', body:'If your monthly expenses today are ₹50,000 and inflation runs at 6% per year, those same expenses will cost roughly ₹1,60,000/month in 20 years — more than 3× today\'s figure. This calculator inflates your current expenses forward to your retirement date before calculating the corpus you will need, rather than using today\'s rupee value (a common mistake in simple retirement calculators).'},
        {title:'The 4% rule and corpus sizing', body:'A widely cited guideline (the "4% rule") suggests that withdrawing 4% of your retirement corpus in the first year, then adjusting for inflation each subsequent year, has historically lasted 30+ years across most market conditions. Working backward, this implies a target corpus of roughly 25× your annual expenses at retirement (since 1 ÷ 4% = 25).'},
        {title:'How "years in retirement" changes the required corpus', body:'A corpus sized for a 25-year retirement is meaningfully smaller than one sized for a 35-year retirement, even with identical expenses and returns — because the corpus must keep generating inflation-adjusted withdrawals for longer. This calculator lets you adjust life expectancy to see this sensitivity directly.'},
        {title:'Reverse-engineering the monthly SIP needed', body:'Once the target corpus is known, the calculator uses the standard future-value-of-annuity formula in reverse to determine the constant monthly investment (at your assumed rate of return) that would reach that corpus by your retirement date.'},
      ],
      formula:{ label:'Corpus required (4% rule approximation)', expr:'Corpus ≈ Annual expenses at retirement × 25', note:'Annual expenses at retirement = current annual expenses × (1 + inflation)^years to retirement' },
      examples:[
        { title:'Example 1 — Early starter', scenario:'Age 25, retiring at 60 (35 years to save), current monthly expenses ₹40,000, inflation 6%, expected return 11%.', result:'Required corpus ≈ ₹6–7 crore · Monthly SIP needed ≈ ₹8,000–10,000' },
        { title:'Example 2 — Late starter', scenario:'Same expenses and assumptions, but starting at age 40 (only 20 years to save).', result:'Required corpus is similar in real terms, but the monthly SIP needed roughly triples to ₹30,000–35,000 due to fewer compounding years' },
        { title:'Example 3 — Early retirement (FIRE-style)', scenario:'Age 30, targeting retirement at 45 (15 years), monthly expenses ₹60,000, inflation 6%, expected return 10%.', result:'Required corpus ≈ ₹5–6 crore · Monthly SIP needed is substantially higher, illustrating the trade-off between an earlier retirement date and a larger required monthly commitment' },
      ],
      useCases:[
        { title:'Comparing the cost of starting at 25 vs 35', body:'This is the single highest-impact comparison in retirement planning. Run the calculator twice with a 10-year difference in starting age — the monthly savings required typically increases by 2–3× for the later starter, for an identical retirement outcome, purely due to lost compounding years.'},
        { title:'Stress-testing your inflation assumption', body:'India has historically seen inflation in the 5–7% range, but healthcare and education costs — major retirement expense categories — have often risen faster. Try the calculator at both 6% and 8% inflation to see how sensitive your required corpus is to this single assumption.'},
        { title:'Bridging the gap with a step-up SIP', body:'If the monthly savings figure feels out of reach today, pair this calculator with the SIP Calculator\'s step-up feature: a smaller starting SIP that increases 8–10% annually (in line with typical salary growth) can reach the same corpus as a flat, larger SIP.'},
        { title:'Why "FIRE" numbers and retirement corpus are the same maths', body:'Financial Independence, Retire Early (FIRE) calculations use exactly the same 25× annual-expenses logic as traditional retirement planning — the only difference is the retirement age input. Try entering a much earlier retirement age here to see your personal "FIRE number".'},
      ],
    },
    pairWith:[
      { slug:'fire', reason:'Retirement and FIRE use the same 25× expenses formula — see your number for an earlier retirement age.' },
      { slug:'macros', reason:'A long, healthy retirement needs a body that lasts — your nutrition plan today affects your healthcare costs tomorrow.' },
    ],
  },
  { slug:'fire',category:'finance',group:'Plan Ahead',icon:'🔥',title:'FIRE — Financial Independence Calculator',short:'FIRE',desc:'Find your financial independence number and years until you can retire early.',metaDesc:'Free FIRE calculator. Financial independence number and timeline.',tags:['fire','financial independence','retire early'],tips:['FIRE number = annual expenses × 25.','Every 1% cut in spending removes years from your FIRE date.'],faq:[{q:'What is FIRE?',a:'Financial Independence, Retire Early — enough invested so returns cover living costs indefinitely.'},{q:'What is the 4% rule for FIRE?',a:'The 4% rule says you can withdraw 4% of your portfolio annually without running out of money for 30+ years. Your FIRE number is simply 25 × annual expenses.'},{q:'How much do I need to retire early at 40?',a:'Multiply your annual expenses by 25. If you spend ₹6L/year, you need roughly ₹1.5Cr. At ₹10L/year spend, you need about ₹2.5Cr — enter your own expenses above for an exact number.'},{q:'What is Lean FIRE vs Fat FIRE?',a:'Lean FIRE means retiring on about 70% of your current lifestyle spend. Fat FIRE means retiring with 150% of it. Standard FIRE targets the same lifestyle as today.'},{q:'How long does it take to reach FIRE?',a:'It depends entirely on your savings rate. At a 50% savings rate it takes roughly 17 years from zero. At a 70% savings rate, closer to 8 years.'}],interpretation:'Your FIRE number is 25× your CURRENT annual expenses — if your spending changes meaningfully (kids, a home upgrade, healthcare needs), the number changes too. Treat it as a moving target you revisit yearly, not a number you calculate once and chase blindly for a decade.',commonMistakes:[{mistake:'Calculating FIRE number from an unrealistically lean current budget, then finding real retired life costs more.',fix:'Base your annual expense figure on your ACTUAL current spending (check a few months of bank statements), not an aspirational minimal budget you don\'t actually live on today.'},{mistake:'Ignoring healthcare costs, which usually rise sharply after leaving employer-provided insurance.',fix:'Add a realistic health insurance premium (often ₹15,000-40,000+/year for a family, and rising with age) to your post-FIRE annual expense estimate — don\'t use your current employer-subsidized cost.'},{mistake:'Treating the 4% rule as risk-free for very early retirement (30s-40s).',fix:'The 4% rule was studied primarily for ~30-year retirement horizons. Retiring at 35-40 means a 50+ year horizon — consider a more conservative 3-3.5% withdrawal rate for that much extra time.'}],
    wflTopics:[{title:'The complete FIRE guide',slug:'fire-movement-india'},{title:'How to live on a lean budget',slug:'fire-movement-india'}],
    content:{
      intro:'Financial Independence, Retire Early (FIRE) is the idea of building an investment portfolio large enough that its returns alone cover your living expenses indefinitely — at which point working becomes optional, regardless of your age. This calculator computes your personal FIRE number from your annual expenses, projects how long it will take to reach it at your current savings rate, and shows exactly how much a higher savings rate or lower expenses would shorten that timeline.',
      howItWorks:[
        {title:'The FIRE number formula', body:'The standard FIRE number is your annual expenses multiplied by 25 — derived from the same "4% rule" used in traditional retirement planning (1 ÷ 4% = 25). If you spend ₹6,00,000 per year, your FIRE number is approximately ₹1.5 crore. Once your portfolio reaches this size, withdrawing 4% annually (adjusted for inflation) has historically been sustainable for 30+ years across most market conditions.'},
        {title:'Why your savings rate matters more than your income', body:'FIRE timelines are driven primarily by your savings rate — the percentage of income you invest — not your absolute income. Someone earning ₹1,00,000/month and saving 50% reaches FIRE faster than someone earning ₹2,00,000/month and saving 10%, because the second person\'s expenses (and therefore FIRE number) are also proportionally larger.'},
        {title:'The maths of cutting expenses (it counts double)', body:'Reducing your annual expenses by ₹1,00,000 has a compounding effect on your FIRE timeline: it directly lowers your FIRE number by ₹25,00,000 (25× the reduction), AND it likely frees up that ₹1,00,000 to be invested instead — increasing your savings rate at the same time. This is why frugality-focused FIRE strategies can produce surprisingly short timelines.'},
        {title:'Lean FIRE, Fat FIRE, and Coast FIRE', body:'"Lean FIRE" targets a minimal expense base (and therefore a smaller FIRE number). "Fat FIRE" targets a more comfortable lifestyle with a correspondingly larger number. "Coast FIRE" is the point at which your existing investments will grow to your full FIRE number by traditional retirement age without any further contributions — useful for people who want to switch to lower-stress, lower-paying work without abandoning long-term financial security entirely.'},
      ],
      formula:{ label:'FIRE number (4% rule)', expr:'FIRE number = Annual expenses × 25', note:'Equivalent to a 4% annual safe withdrawal rate' },
      examples:[
        { title:'Example 1 — Standard FIRE', scenario:'Annual expenses of ₹6,00,000, current investments of ₹10,00,000, investing ₹40,000/month at 11% expected return.', result:'FIRE number = ₹1.5 crore · Estimated time to FIRE ≈ 13-15 years' },
        { title:'Example 2 — Lean FIRE via expense reduction', scenario:'Same scenario as Example 1, but annual expenses reduced to ₹4,50,000 by cutting discretionary spending.', result:'FIRE number drops to ₹1.125 crore — roughly 25% smaller, shortening the timeline by several years even before accounting for any increase in savings rate' },
        { title:'Example 3 — Doubling the savings rate', scenario:'Same as Example 1, but monthly investment increased from ₹40,000 to ₹80,000.', result:'Time to FIRE typically drops by roughly 40-50% — savings rate has an outsized effect compared to return-rate assumptions' },
      ],
      useCases:[
        { title:'Stress-testing the 4% rule for your situation', body:'The 4% rule was derived from historical US market data over 30-year retirement periods. If you expect to be retired for 40+ years (common for early retirees in their 30s or 40s), consider using a more conservative 3.0-3.5% withdrawal rate — equivalent to a FIRE number of 28-33× annual expenses rather than 25×. Re-run the calculator with your adjusted multiple.'},
        { title:'The "one more year" trap', body:'As your portfolio approaches your FIRE number, it\'s common to feel the pull to work "just one more year" for additional safety margin. Use this calculator to quantify exactly how much an extra year of contributions changes your number — sometimes the gain is smaller than expected once you\'re already close, which can help with the decision.'},
        { title:'Geographic arbitrage and FIRE numbers', body:'Your FIRE number is entirely a function of your annual expenses — which can vary enormously by location. Many FIRE planners model multiple expense scenarios (current city vs a lower-cost city or country) to see how relocation, even temporarily, would change their required portfolio size and timeline.'},
        { title:'FIRE is not all-or-nothing', body:'Even if full FIRE feels distant, the "Coast FIRE" framing — the point where your current investments alone will compound to your full retirement number by a traditional retirement age — is often reachable much sooner. Try entering a much later target date with zero further contributions to see your effective Coast FIRE point.'},
      ],
    },
    pairWith:[
      { slug:'compound', reason:'Compound growth is the engine behind your FIRE number — see exactly how today\'s contributions compound toward it.' },
      { slug:'calories', reason:'FIRE and sustainable nutrition share the same principle: small daily deficits or surpluses compound into large outcomes over years.' },
    ],
  },
  { slug:'budget',category:'finance',group:'Plan Ahead',icon:'📋',title:'Budget Planner — 50/30/20',short:'Budget Planner',desc:'Plan monthly spending with the 50/30/20 rule. Customise the split.',metaDesc:'Free budget planner. 50/30/20 rule with custom split.',tags:['budget','50 30 20'],tips:['Automate savings on payday — save first, spend what is left.'],faq:[{q:'Does 50/30/20 suit everyone?',a:'It is a starting point. Adjust for your cost of living and income.'}],wflTopics:[{title:'How to create a budget that actually works',slug:'budgeting-50-30-20-india'},{title:'Apps to track your spending',slug:'budgeting-50-30-20-india'}] ,
    content:{
      intro:'This calculator applies the well-known 50/30/20 budgeting framework to your specific income — 50% toward needs, 30% toward wants, and 20% toward savings — along with two emergency fund targets (3 and 6 months of income) so you have concrete rupee figures to plan against, not just percentages.',
      howItWorks:[
        {title:'The 50/30/20 split explained', body:'Needs (50%) covers non-negotiable expenses like rent, groceries, utilities, and loan EMIs. Wants (30%) covers discretionary spending like dining out and entertainment. Savings (20%) covers everything building your future — investments, debt payoff beyond minimums, and emergency fund contributions.'},
        {title:'Why this split may need adjusting for Indian metro costs', body:'In expensive cities, housing alone can consume 35–50% of income, making the strict 50% needs ceiling unrealistic. Many people adapt this to a 60/20/20 split instead, treating the original framework as a flexible starting template rather than a fixed law.'},
        {title:'Emergency fund sizing', body:'This calculator shows both a 3-month and 6-month emergency fund target based on your income — a reasonable range depending on job stability, with less stable income (freelance, commission-based) generally warranting the larger 6-month target.'},
      ],
      formula:{ label:'50/30/20 split', expr:'Needs = income × 50%, Wants = income × 30%, Savings = income × 20%' },
      examples:[
        { title:'Example — ₹60,000 monthly income', scenario:'A standard 50/30/20 split applied to a ₹60,000 monthly income.', result:'Needs ≈ ₹30,000, Wants ≈ ₹18,000, Savings ≈ ₹12,000. Emergency fund target: ₹1,80,000 (3 months) to ₹3,60,000 (6 months)' },
        { title:'Example — adjusting for high rent', scenario:'Same ₹60,000 income, but rent alone is ₹25,000 (over 40% of income).', result:'The needs category alone may already exceed the standard 50% target — signalling that a 60/20/20 adaptation may fit better than the original framework' },
      ],
      useCases:[
        { title:'Using this as a starting template, not a strict rule', body:'If your needs genuinely exceed 50% of income due to high local housing costs, adjust the wants percentage downward to compensate, while protecting the savings percentage — the order of priority matters more than hitting the exact original percentages.'},
        { title:'Automating the savings portion first', body:'Many people find success treating the savings figure from this calculator as a fixed automatic transfer on salary day, rather than waiting to see what is "left over" at month end — removing the decision tends to produce more consistent results.'},
        { title:'Revisiting the split as income changes', body:'Recalculate after any significant raise, and consider directing a larger share of the increase toward savings rather than letting wants and needs both expand proportionally — this is one of the most effective ways to raise your savings rate over time.'},
      ],
    },
  },
  { slug:'net-worth',category:'finance',group:'Plan Ahead',icon:'💎',title:'Net Worth Calculator',short:'Net Worth',desc:'Add assets and liabilities to find your net worth. Track financial progress over time.',metaDesc:'Free net worth calculator. Assets minus liabilities.',tags:['net worth','assets','liabilities'],tips:['Track net worth monthly to see clear financial progress.'],faq:[{q:'Should I include my home?',a:'Yes — home value minus outstanding mortgage. Remember it is not liquid.'}],wflTopics:[{title:'How to grow your net worth 10× in 10 years',slug:'net-worth-guide'}] ,
    content:{
      intro:'Net worth is the single number that captures your entire financial position — everything you own minus everything you owe — and tracking it over time tends to be a far better gauge of financial progress than focusing on income alone. Two people earning the same salary can have wildly different net worth trajectories depending on spending habits, debt levels, and how consistently they invest the difference.',
      howItWorks:[
        {title:'The basic net worth equation', body:'Net worth is calculated as total assets minus total liabilities. Assets include cash, investments, retirement accounts, property, and other valuables, while liabilities include any outstanding loans, credit card balances, or other debts. The result can be positive or negative depending on which side is larger.'},
        {title:'Why net worth matters more than income', body:'Income measures cash flow in a given period, but net worth measures accumulated wealth over time, including the effect of saving, investing, debt repayment, and asset appreciation. A high earner who spends everything can have a lower net worth than a moderate earner who saves and invests consistently.'},
        {title:'Liquid vs illiquid assets', body:'Not all assets are equally accessible — cash and investments can typically be converted to spendable money quickly, while property or retirement accounts with withdrawal restrictions are far less liquid. A complete net worth picture distinguishes between these, since liquidity matters as much as the total figure during an actual financial need.'},
        {title:'Tracking net worth as a trend, not a single snapshot', body:'A single net worth calculation is useful, but tracking it every few months reveals the trend that actually reflects financial behavior — whether debt is shrinking, investments are growing, and overall wealth is moving in the right direction over time.'},
      ],
      examples:[
        { title:'Example 1 — Early career, net worth still negative', scenario:'25,00,000 rupees in education loan debt, 2,00,000 rupees in savings and investments, no other major assets or liabilities.', result:'Net worth is negative 23,00,000 rupees — common and not unusual early in a career, particularly after education loans, and expected to improve steadily as the loan is repaid and savings grow' },
        { title:'Example 2 — Mid-career with a home', scenario:'A home worth 80,00,000 rupees with 40,00,000 rupees remaining on the mortgage, plus 15,00,000 rupees in investments and 3,00,000 rupees in cash.', result:'Net worth comes out to roughly 58,00,000 rupees, illustrating how home equity, the portion of a property\u2019s value not offset by remaining loan, contributes meaningfully alongside liquid investments' },
        { title:'Example 3 — Net worth after debt payoff', scenario:'The same person from Example 1, five years later, having paid off the education loan entirely and grown investments to 15,00,000 rupees.', result:'Net worth shifts from negative 23,00,000 rupees to a positive 15,00,000 rupees, a swing of 38,00,000 rupees achieved through consistent debt repayment and saving rather than any single large windfall' },
      ],
      useCases:[
        { title:'Setting net worth milestones by age', body:'Some financial planning frameworks suggest target net worth multiples of annual income at different ages, useful as a rough benchmark, though personal circumstances like education debt, location, and career stage matter more than rigid age-based targets.'},
        { title:'Net worth as a debt-payoff motivator', body:'Watching a negative net worth figure climb toward zero, and eventually turn positive, can be a more motivating way to track debt payoff progress than focusing on the remaining balance alone, since it captures the full picture including any savings being built simultaneously.'},
        { title:'Including or excluding your primary home', body:'Some people exclude their primary residence from net worth calculations since it is not typically sold to fund living expenses, focusing instead on "investable net worth." Both approaches are valid — the key is choosing one and tracking it consistently over time.'},
        { title:'Net worth and life insurance needs', body:'A lower net worth, especially with significant debt, generally increases the importance of adequate life insurance cover, since there are fewer existing assets to fall back on if income is lost. See the Term Insurance Calculator to translate this into a concrete cover recommendation.'},
      ],
    },
    pairWith:[
      { slug:'term-insurance', reason:'A lower net worth means less of a financial cushion if income is lost — see how much life insurance cover that gap implies.' },
      { slug:'fire', reason:'Your net worth trajectory today is the foundation your FIRE number is built from — see how far it is from your target.' },
    ]},
  { slug:'money-last',category:'finance',group:'Plan Ahead',icon:'⏰',popular:true,title:'How Long Will Money Last?',short:'Money Last',desc:'Enter savings, monthly withdrawal and return rate — find exactly how long money will last.',metaDesc:'Free retirement drawdown calculator. How long will savings last?',tags:['retirement drawdown','money last'],tips:['4% withdrawal rate: portfolio lasts indefinitely in most scenarios.'],faq:[{q:'What withdrawal rate is safe?',a:'3.5–4%/year for a 30-year retirement, based on historical data.'}],interpretation:'The "years your money lasts" figure is extremely sensitive to the withdrawal amount in the early years — a sequence of poor returns right after you start withdrawing does far more damage than the same poor returns happening later, because you\'re selling more of your portfolio at a low price early on. Treat the output as a plausibility check on your withdrawal rate, not a fixed countdown — the real number will move as markets do.',commonMistakes:[{mistake:'Assuming a smooth, constant return every year rather than the volatile sequence markets actually deliver.',fix:'This calculator (like most) shows the average-case outcome. A retirement that starts with a market downturn can run out of money significantly earlier than the same average return spread evenly — build in a buffer, don\'t withdraw right at the edge of what the calculator says survives.'},{mistake:'Not adjusting withdrawals for inflation, or adjusting by more than the return assumption accounts for.',fix:'If you plan to increase withdrawals with inflation each year, make sure the return assumption you\'re comparing against is a real (inflation-adjusted) rate, not a nominal one — mixing the two overstates how long the money lasts.'},{mistake:'Ignoring healthcare costs, which tend to rise faster than general inflation later in life.',fix:'Consider modelling a higher withdrawal rate for the later years specifically, rather than a flat withdrawal for the entire retirement period.'}],
    wflTopics:[{title:'Retirement withdrawal strategies explained',slug:'retirement-planning-india'}],recommendations:[{label:'Annuity options',url:'https://wellfilab.com/recommend/annuities',icon:'🛡️'}] ,
    content:{
      intro:'This calculator answers a critical retirement question: given a lump sum, a fixed monthly withdrawal, an expected investment return, and an inflation rate that increases your withdrawal over time, how long will the money actually last? The answer is often surprisingly different from a simple division of savings by withdrawal amount.',
      howItWorks:[
        {title:'Why a simple division understates the real picture', body:'Dividing your savings by your monthly withdrawal ignores that the remaining balance keeps earning a return throughout the withdrawal period — but it also ignores that withdrawals typically need to increase with inflation to maintain the same purchasing power, which works in the opposite direction.'},
        {title:'The interaction between return rate and inflation', body:'If your investment return meaningfully exceeds your withdrawal\'s inflation adjustment, the corpus can last far longer than a naive calculation suggests — sometimes effectively indefinitely. If inflation outpaces returns, the corpus depletes faster than expected, even though each individual year looks manageable.'},
        {title:'The "forever" threshold', body:'This calculator caps its calculation at 100 years — if your corpus has not depleted by then, it is effectively sustainable indefinitely at the given assumptions, since your return rate is outpacing your inflation-adjusted withdrawals over the very long run.'},
      ],
      formula:{ label:'Monthly depletion model', expr:'Balance next month = (balance × (1 + monthly return)) − withdrawal', note:'Withdrawal itself grows each month by the monthly inflation rate' },
      examples:[
        { title:'Example — with inflation-adjusted withdrawals', scenario:'₹50,00,000 corpus, withdrawing ₹30,000/month, 6% annual return, 5% annual inflation on withdrawals.', result:'Corpus lasts approximately 15.1 years — inflation increasing the withdrawal amount over time depletes the corpus faster than a flat-withdrawal model would suggest' },
        { title:'Example — same corpus, no inflation adjustment, higher return', scenario:'Same ₹50,00,000 corpus and ₹30,000/month withdrawal, but 8% return with withdrawals held flat (no inflation increase).', result:'Corpus effectively lasts indefinitely (100+ years) at these assumptions, since the return rate alone outpaces the flat withdrawal amount' },
      ],
      useCases:[
        { title:'Why this calculator matters more than a simple retirement corpus target', body:'A large corpus calculated using the common 25x-expenses rule can still deplete faster than expected if withdrawals are not inflation-adjusted realistically — this calculator stress-tests that assumption directly with your actual numbers.'},
        { title:'Comparing a fixed withdrawal vs an inflation-adjusted one', body:'Run the same corpus and return rate with 0% inflation versus a realistic 5–6%, to see how much faster a corpus depletes once withdrawals are allowed to rise with the cost of living — this is the scenario that actually matters for long retirements.'},
        { title:'Adjusting your withdrawal rate if the corpus depletes too soon', body:'If your result shows depletion sooner than your expected retirement length, reducing the monthly withdrawal amount even modestly often extends the corpus\'s life by years, due to the compounding effect working in your favour for longer.'},
      ],
    },
  },
  // FINANCE — Tax & Pay
  { slug:'income-tax',category:'finance',group:'Tax & Pay',icon:'📋',title:'Income Tax Estimator',short:'Income Tax',desc:'Estimate annual tax with full bracket breakdown. Enter income and deductions.',metaDesc:'Free income tax estimator with full bracket breakdown.',tags:['income tax','tax'],tips:['Pre-tax pension contributions reduce taxable income directly.'],faq:[{q:'How accurate is this?',a:'A useful estimate based on progressive brackets. Confirm with a tax professional.'}],wflTopics:[{title:'How to save tax legally',slug:'tax-saving-guide-india'}],
    content:{
      intro:'Income tax in most progressive systems is calculated using slabs (brackets) — different portions of your income are taxed at different rates, and the rate that applies to your top slice of income (your "marginal rate") is usually much higher than the rate you pay on average across your whole income. This calculator breaks down exactly how your tax is computed slab by slab, so you can see precisely where your money goes and how deductions change the outcome.',
      howItWorks:[
        {title:'How progressive tax slabs actually work', body:'A common misconception is that moving into a higher tax bracket means ALL your income is taxed at the higher rate — this is not how progressive taxation works. Instead, only the portion of income that falls within each slab is taxed at that slab\'s rate. Your total tax is the sum of tax owed across every slab your income passes through.'},
        {title:'Marginal rate vs effective rate', body:'Your "marginal rate" is the rate applied to your last (highest) slice of income — this is the rate that matters when deciding whether an extra ₹10,000 of income or deduction is worth pursuing. Your "effective rate" is your total tax divided by your total income — almost always meaningfully lower than your marginal rate, because lower slabs are taxed at lower rates regardless of your top bracket.'},
        {title:'How deductions reduce taxable income (not tax directly)', body:'Deductions (such as retirement contributions, insurance premiums, or home loan interest, depending on jurisdiction) reduce your TAXABLE income, not your tax bill directly. The value of a deduction therefore depends on your marginal rate: a ₹1,50,000 deduction saves more in absolute tax for someone in a 30% bracket than for someone in a 10% bracket, because it removes ₹1,50,000 from the highest (most expensive) slab first.'},
        {title:'Why this calculator shows the full slab breakdown', body:'Rather than just showing a final number, this calculator displays exactly how much tax is owed within each individual slab — this transparency helps you understand precisely how a salary increase, bonus, or additional deduction would change your tax, since you can see which slab the change falls into.'},
      ],
      examples:[
        { title:'Example 1 — Income near a slab boundary', scenario:'Annual income of ₹8,00,000, with the relevant slabs taxed at 0%, 5%, 10%, and 15% for different portions.', result:'Total tax is the SUM of tax owed in each slab — e.g., 0% on the first portion, 5% on the next, and so on — producing an effective rate noticeably below the 15% marginal rate' },
        { title:'Example 2 — Effect of a ₹1,50,000 deduction', scenario:'Same ₹8,00,000 income as Example 1, with a ₹1,50,000 deduction (e.g., retirement contribution) applied.', result:'Taxable income drops to ₹6,50,000 — the deduction removes income from the TOP slab first, so the tax saved equals ₹1,50,000 × (marginal rate), which is typically the largest possible saving per rupee of deduction' },
        { title:'Example 3 — Comparing a ₹50,000 raise before and after tax', scenario:'A ₹50,000 annual raise for someone already in a higher slab.', result:'The take-home increase from the raise is roughly (1 − marginal rate) × ₹50,000 — for a 20% marginal rate, about ₹40,000 of the raise is retained after tax on that portion' },
      ],
      useCases:[
        { title:'Deciding whether to maximize tax-saving investments', body:'Because deductions save tax at your MARGINAL rate, the value of fully utilizing available deduction limits is highest for people in higher brackets. Run the calculator with and without your planned deduction to see the exact rupee impact — this is often a clearer decision-making tool than generic "save tax" advice.'},
        { title:'Understanding a bonus or freelance income tax hit', body:'Lump-sum income (bonuses, freelance payments) gets taxed at your marginal rate on top of your regular income — often surprising people who expect it to be taxed at their effective rate. Add the lump sum to your regular income in this calculator to see the REAL tax impact, then subtract your normal tax to isolate just the bonus\'s tax cost.'},
        { title:'Negotiating salary: gross vs net', body:'When comparing job offers or negotiating a raise, the gross number alone is misleading once you cross slab boundaries. Run both your current and proposed income through this calculator to compare actual take-home (net) figures — not just the headline gross numbers.'},
        { title:'Year-end planning: timing income and deductions', body:'If you have some control over when income is received or deductible expenses are paid (common for freelancers and business owners), this calculator can help compare scenarios — e.g., receiving a payment in one tax year vs the next — to see which produces a lower combined tax across both years.'},
      ],
    },
    pairWith:[
      { slug:'salary', reason:'Your take-home salary depends directly on this tax calculation — use both together for a complete pay picture.' },
      { slug:'macros', reason:'Just as tax slabs apply different rates to different income bands, macro targets apply different priorities to different goals — both reward understanding the structure, not just the headline number.' },
    ],
  },
  { slug:'salary',category:'finance',group:'Tax & Pay',icon:'💼',title:'Take-Home Salary Calculator',short:'Take-Home Pay',desc:'Calculate actual take-home pay after tax, pension and other deductions.',metaDesc:'Free take-home salary calculator. Net pay after all deductions.',tags:['salary','take home pay','net pay'],tips:['Pre-tax pension cuts your tax bill and builds retirement savings simultaneously.'],faq:[{q:'Why is take-home much less than gross?',a:'Income tax, social security, pension and health insurance all reduce your gross pay.'}],wflTopics:[{title:'How to negotiate a higher salary',slug:'financial-independence-mindset'}] ,
    content:{
      intro:'A salary slip looks like a single number, but it is actually a small financial statement — gross pay, multiple deductions, and net pay all interacting in ways that are easy to misread when comparing job offers or negotiating a raise. This calculator breaks down exactly how gross salary becomes take-home pay, so the difference between two offers is clear in real rupee terms, not just headline numbers.',
      howItWorks:[
        {title:'Gross salary vs net salary', body:'Gross salary is your total earnings before any deductions — tax, provident fund, and other withholdings. Net salary, or take-home pay, is what actually reaches your bank account after every deduction is subtracted. Job offers are usually discussed in gross or CTC terms, which can make two offers look more similar than their actual take-home difference suggests.'},
        {title:'Where the deductions go', body:'The main deductions are typically income tax (withheld monthly as TDS based on your estimated annual tax), employee provident fund contribution, and sometimes professional tax depending on your state. Each of these reduces gross pay by a different mechanism, which is why a simple percentage estimate often misses the real number.'},
        {title:'Why two similar gross salaries can have different take-home pay', body:'Two offers with the same gross figure can produce different net pay if their basic-to-gross ratio differs, since provident fund contributions are calculated on basic salary, not gross. A higher basic percentage generally means a higher PF deduction and therefore slightly lower take-home pay, even with identical gross numbers.'},
        {title:'Annual vs monthly figures', body:'Salary calculations often mix annual CTC figures with monthly take-home figures, which is a common source of confusion when comparing offers. This calculator keeps the relationship between the two explicit, so a monthly comparison is always grounded in the correct annual basis.'},
      ],
      examples:[
        { title:'Example 1 — Comparing two job offers', scenario:'Offer A: 12,00,000 rupees CTC with a 40% basic component. Offer B: 12,50,000 rupees CTC with a 30% basic component.', result:'Despite Offer B having a higher gross CTC, its lower basic percentage can mean a similar or even lower monthly take-home than Offer A, once provident fund and other basic-linked deductions are accounted for' },
        { title:'Example 2 — Understanding a raise', scenario:'A 50,000 rupee annual raise on a salary already in a higher tax bracket.', result:'The actual increase in take-home pay is roughly the raise amount minus tax at your marginal rate — for someone in a 20% bracket, this means roughly 40,000 rupees of additional take-home, not the full 50,000' },
        { title:'Example 3 — The effect of bonus timing', scenario:'A lump-sum annual bonus added on top of regular monthly salary.', result:'The bonus is taxed at your marginal rate in the month it is paid, which can make a single month\u2019s take-home pay look unusually low due to the concentrated tax withholding, even though the annual tax liability is the same either way' },
      ],
      useCases:[
        { title:'Negotiating based on take-home, not headline CTC', body:'When negotiating a raise or comparing offers, asking specifically for the expected monthly take-home figure, not just the CTC, surfaces the real financial impact of any change and avoids the common trap of two offers looking equivalent on paper but differing meaningfully in practice.'},
        { title:'Planning fixed monthly commitments around net pay', body:'Recurring financial commitments like SIPs, EMIs, or rent should be planned against your actual net salary, not your gross figure, to avoid a budget that looks comfortable in CTC terms but is tight once real deductions are accounted for.'},
        { title:'Reviewing your payslip against the estimate', body:'If your actual payslip differs meaningfully from this calculator\u2019s estimate, the gap is usually in deductions specific to your employer or location, such as professional tax in certain states or additional voluntary deductions, worth checking directly with your payroll team.'},
        { title:'Using this alongside the Income Tax Calculator', body:'This calculator gives a salary-focused breakdown, while the Income Tax Calculator shows the full slab-by-slab tax computation — using both together gives a more complete picture than either alone, especially when planning deductions to optimize your tax outcome.'},
      ],
    },
    pairWith:[
      { slug:'income-tax', reason:'Your salary deductions are driven directly by the tax slabs — see the full slab breakdown behind your monthly withholding.' },
      { slug:'budget', reason:'Once you know your real take-home pay, a 50/30/20 budget shows exactly how far it stretches.' },
    ]},
  { slug:'gst',category:'finance',group:'Tax & Pay',icon:'🧾',title:'Tax / VAT / GST Calculator',short:'Tax / VAT',desc:'Add or remove VAT, GST or sales tax from any price. Works for any country and rate.',metaDesc:'Free VAT and GST calculator. Add or remove any tax rate instantly.',tags:['vat','gst','sales tax'],tips:['Check whether a quoted price includes or excludes tax before agreeing.'],faq:[{q:'What is VAT?',a:'Value Added Tax — charged at each stage of production, ultimately paid by the consumer.'}] ,
    content:{
      intro:'GST calculations go in two directions that are easy to confuse: adding GST onto a base price to find the final amount, or extracting the original pre-tax price from a GST-inclusive total. This calculator handles both directions correctly, since the formula for removing GST is not simply the reverse percentage of adding it.',
      howItWorks:[
        {title:'Adding GST — the straightforward direction', body:'When you know the base price and need the final price including tax, GST is calculated as a straightforward percentage of the base price, then added to it.'},
        {title:'Removing GST — the direction that trips people up', body:'When you know the final, tax-inclusive price and need to find the original base price, you cannot simply subtract the tax percentage from the total — you need to divide by (1 + tax rate) first, since the percentage was originally calculated on a smaller base.'},
        {title:'Common Indian GST slabs', body:'India uses multiple GST slabs depending on the category of goods or services — commonly 5%, 12%, 18%, and 28% — so always confirm the applicable rate for your specific item before calculating, since picking the wrong slab is the most common source of GST calculation errors.'},
      ],
      formula:{ label:'Removing GST from a final price', expr:'Original price = Final price × 100 ÷ (100 + GST rate)', note:'Adding GST: Tax = Base price × rate ÷ 100' },
      examples:[
        { title:'Example — adding 18% GST', scenario:'A product with a base price of ₹1,000, GST rate 18%.', result:'GST amount = ₹180, final price = ₹1,180' },
        { title:'Example — removing 18% GST from a final price', scenario:'An invoice shows a final price of ₹1,180 (GST inclusive) at the 18% rate.', result:'Original base price = ₹1,000, GST portion = ₹180 — note this correctly reverses the addition example above' },
      ],
      useCases:[
        { title:'Why a common mistake is using the wrong direction', body:'A frequent error is subtracting 18% directly from a GST-inclusive price (e.g. ₹1,180 × 0.82 = ₹967.60) instead of dividing by 1.18 — this gives a noticeably wrong base price. Always confirm whether your starting number already includes tax before choosing a direction.'},
        { title:'Checking vendor invoices', body:'If an invoice states a final price and a GST rate but not the breakdown, this calculator quickly verifies whether the implied base price and tax amount are correct, which is useful for catching billing errors.'},
        { title:'Quoting prices to customers', body:'Businesses can use the add-GST direction to quickly convert a base price list into customer-facing, tax-inclusive prices without manual recalculation for every item.'},
      ],
    },
  },
  // FINANCE — Tools
  { slug:'currency',category:'finance',group:'Tools',icon:'💱',popular:true,title:'Currency Converter',short:'Currency',desc:'Convert between 15 major world currencies with indicative rates.',metaDesc:'Free currency converter. USD, EUR, GBP, INR, JPY and 10 more.',tags:['currency','exchange rate','forex'],tips:['Bank transfers beat airport exchanges by 3–8%.'],faq:[{q:'Are these real rates?',a:'Indicative rates for reference only. Use your bank for actual transactions.'}] ,
    content:{
      intro:'This calculator converts between major world currencies using a built-in reference rate table for quick estimates — useful for rough budgeting, travel planning, or sanity-checking a quoted price, though it is not a substitute for live rates when the exact figure matters for an actual transaction or transfer.',
      howItWorks:[
        {title:'How the conversion rate is derived', body:'Each currency in the table is expressed relative to a common base, so converting between any two currencies (say EUR to INR) works by comparing both currencies\' rates relative to that base, rather than needing a separate stored rate for every possible currency pair.'},
        {title:'Why these are reference rates, not live market rates', body:'Currency markets move continuously throughout the trading day. The rates used here are illustrative reference points for estimation, not a live feed — for an actual money transfer or time-sensitive transaction, always check your bank or transfer provider\'s current quoted rate.'},
        {title:'The difference between mid-market rate and what you actually get', body:'Banks and exchange services typically apply a margin on top of the mid-market rate (the "real" rate this calculator approximates), plus sometimes a flat fee — meaning the rate you are quoted for an actual transaction is usually somewhat less favourable than the reference rate shown here.'},
      ],
      formula:{ label:'Cross-rate conversion', expr:'Result = amount × (target currency rate ÷ source currency rate)' },
      examples:[
        { title:'Example — USD to INR', scenario:'Converting 100 US Dollars to Indian Rupees at a reference rate of 83.5.', result:'Result ≈ ₹8,350' },
        { title:'Example — checking a quoted transfer rate', scenario:'A money transfer service quotes a rate 2% worse than the reference rate shown by this calculator.', result:'On a ₹1,00,000 equivalent transfer, that 2% margin represents roughly ₹2,000 in additional cost compared to the mid-market reference rate' },
      ],
      useCases:[
        { title:'Travel budgeting', body:'Get a rough sense of how far your home currency will go abroad before a trip, without needing to check live rates for a planning-stage estimate.'},
        { title:'Sanity-checking exchange counter or transfer rates', body:'Compare any quoted rate from a bank, exchange counter, or transfer app against this calculator\'s reference rate to estimate roughly how much margin is being applied — useful context before agreeing to a transaction.'},
        { title:'Understanding price differences across countries', body:'Convert a foreign price tag into your home currency to compare costs meaningfully, whether shopping online from international retailers or comparing salaries across countries.'},
      ],
    },
  },
  { slug:'inflation',category:'finance',group:'Tools',icon:'📉',title:'Inflation Calculator',short:'Inflation',desc:'See how inflation reduces purchasing power. Find what a past amount is worth today.',metaDesc:'Free inflation calculator. Purchasing power over time.',tags:['inflation','purchasing power'],tips:['3% inflation halves purchasing power in about 24 years.'],faq:[{q:'What is normal inflation?',a:'Most central banks target 2%. Above 5% is considered high.'}],interpretation:'The converted figure uses a fixed exchange rate table, not a live feed — treat it as a close approximation for planning, not the exact rate you\'ll get from a bank or card issuer. Real-world conversions (via a bank, card, or exchange counter) will differ, usually against you, because of the spread and fees layered on top of the mid-market rate this calculator shows.',commonMistakes:[{mistake:'Assuming the converted amount is what you\'ll actually receive or pay via a bank or card.',fix:'Banks and card networks add a margin (often 1-4%) on top of the mid-market rate, plus sometimes a flat fee. Use this calculator for planning and comparison, then check your actual provider\'s rate before a real transaction.'},{mistake:'Not checking how recently the rate was updated before making a decision based on it.',fix:'Exchange rates move throughout the trading day. For anything time-sensitive or large, check a live rate source immediately before acting, not just this calculator.'},{mistake:'Comparing two providers\' "no fee" conversions without checking their exchange rate margin.',fix:'A "zero fee" conversion with a poor exchange rate can cost more than a small flat fee with a rate close to mid-market — always compare the total amount you receive, not just the advertised fee.'}],
    wflTopics:[{title:'How to inflation-proof your savings',slug:'inflation-impact-savings'}],
    content:{
      intro:'Inflation quietly erodes the purchasing power of money sitting idle, even while the number on a bank statement keeps growing. This calculator runs the calculation in both directions — projecting a present amount forward to see its future cost, or discounting a future amount back to see what it is genuinely worth in today\'s money.',
      howItWorks:[
        {title:'Forward calculation — what will this cost in the future', body:'Given a present amount and an assumed annual inflation rate, this calculator compounds that rate forward over the chosen number of years to estimate the equivalent future cost of the same goods or services.'},
        {title:'Reverse calculation — what is a future amount worth today', body:'Given a future amount, this calculator divides by the same compounding factor to discount it back to today\'s purchasing power — useful for understanding what a fixed future payout, like an insurance maturity amount, will actually be worth when received.'},
        {title:'Why India-specific inflation assumptions matter', body:'India has historically averaged closer to 6–7% inflation over multi-decade periods, notably higher than the 2–3% commonly assumed in Western financial planning content — using a India-appropriate rate produces a meaningfully different, more realistic result.'},
      ],
      formula:{ label:'Future value (forward)', expr:'Future amount = present amount × (1 + rate)^years', note:'Reverse: present value = future amount ÷ (1 + rate)^years' },
      examples:[
        { title:'Example — forward projection', scenario:'₹1,00,000 today, projected forward 10 years at 6% inflation.', result:'Equivalent future cost ≈₹1,79,085 — the same goods and services will cost this much in 10 years at this inflation rate' },
        { title:'Example — reverse discounting', scenario:'₹1,00,000 expected 10 years from now, discounted back at 6% inflation.', result:'Worth only ≈₹55,839 in today\'s purchasing power — illustrating why a fixed future payout loses real value over time' },
      ],
      useCases:[
        { title:'Evaluating insurance maturity amounts and fixed future payouts', body:'A policy promising a fixed sum after 15–20 years often sounds larger than its real value once inflation is accounted for — use the reverse calculation to see the genuine purchasing power of any fixed future payout.'},
        { title:'Setting realistic long-term savings or retirement targets', body:'Any goal calculated in today\'s rupees needs to be inflated forward to the actual target date, since the real future cost will be meaningfully higher than today\'s figure for any goal more than a few years away.'},
        { title:'Comparing investment returns against inflation honestly', body:'An investment return that does not exceed the inflation rate is not actually growing your wealth in real terms, even though the nominal balance increases — this calculator makes that gap explicit rather than easy to overlook.'},
      ],
    },
  },
  { slug:'tip',category:'finance',group:'Tools',icon:'🍽️',title:'Tip Calculator & Bill Splitter',short:'Tip & Split',desc:'Calculate a tip and split the bill among any number of people in any currency.',metaDesc:'Free tip calculator with bill split.',tags:['tip','bill split','restaurant'],tips:['15% is standard, 20% generous, 25%+ exceptional.'],faq:[{q:'Is tipping required everywhere?',a:'No. In many countries it is optional. US/Canada standard is 15–20%.'}],
    content:{
      intro:'Splitting a bill and calculating a tip seems trivial until you are doing the maths in your head at a crowded table — this calculator handles both at once, showing the tip amount, the total, and the exact per-person share for any group size.',
      howItWorks:[
        {title:'Tip calculation', body:'The tip is calculated as a straightforward percentage of the pre-tip bill amount, then added to find the total payable.'},
        {title:'Splitting evenly across the group', body:'Both the total bill and the tip itself are divided evenly across the number of people specified, showing each person\'s exact share including their portion of the tip.'},
        {title:'Why tipping norms vary so much by country', body:'Tipping percentage expectations differ significantly by region — North America commonly expects 15–20%, many European and Asian countries have little to no tipping culture, and others fall somewhere in between. Always check local norms when traveling rather than assuming your home country\'s convention applies.'},
      ],
      formula:{ label:'Per-person total', expr:'Per person = (bill + tip) ÷ number of people' },
      examples:[
        { title:'Example — dinner for four', scenario:'Bill of ₹2,400, 10% tip, split among 4 people.', result:'Tip = ₹240, total = ₹2,640, per person = ₹660 (including ₹60 tip share each)' },
        { title:'Example — uneven group sizes', scenario:'Same ₹2,400 bill and 10% tip, but split among 6 people instead.', result:'Per person drops to ₹440 — useful for quickly checking how much a larger group changes each person\'s share' },
      ],
      useCases:[
        { title:'Settling a group bill quickly', body:'Rather than mentally calculating a percentage and dividing under time pressure, this gives an instant, accurate per-person figure including the tip share.'},
        { title:'Deciding on an appropriate tip percentage', body:'15% is generally considered standard, 20% generous, and 25%+ exceptional in tipping-culture countries — useful as a quick reference when unsure what to leave.'},
        { title:'Travel — adjusting to local tipping norms', body:'Since tipping conventions vary widely by country, recalculating with a locally appropriate percentage avoids both under-tipping and unnecessarily over-tipping in places where it is not customary.'},
      ],
    },
  },

  // ── New calculators ──────────────────────────────────────────────
  { slug:'one-rm', category:'health', group:'Fitness', icon:'🏋️', popular:false,
    title:'1RM Calculator — One Rep Max', short:'1RM / One Rep Max',
    desc:'Estimate your one rep max from any weight and rep count. Get your full training weight table by percentage.',
    metaDesc:'Free 1RM calculator. Five formulas — Epley, Brzycki, Lombardi, Mayhew, O\'Conner. Training weight table included.',
    tags:['1rm','one rep max','powerlifting','strength training','gym'],
    tips:['Use 3–8 reps for best accuracy — 1RM formulas are less reliable above 10 reps.','80% of 1RM for 8 reps is ideal for muscle growth.','Re-test 1RM every 4–6 weeks as strength improves.'],
    faq:[{q:'Which 1RM formula is most accurate?',a:'Epley and Brzycki are most widely used. Average all five for the best estimate.'},{q:'Should I test my actual 1RM?',a:'Only with a spotter and proper warm-up. For most people, a calculated estimate is safer.'}],
    wflTopics:[{title:'Heart rate training zones explained',slug:'heart-rate-zones-training'}],
    content:{
      intro:'Your one-rep max (1RM) is the heaviest weight you could lift for a single rep with good form — useful for programming training percentages, but risky to actually test directly for most lifters. This calculator estimates it from a safer, sub-maximal set using five established formulas, then shows training weights at each percentage of that estimate.',
      howItWorks:[
        {title:'Why estimate instead of testing directly', body:'Testing a true 1RM requires a near-maximal, high-risk single lift, ideally with a spotter and a coach present. Estimating from a moderate-weight set of 3–8 reps is far safer and, for most lifters, accurate within a few percent of the true value.'},
        {title:'Why this calculator averages five formulas', body:'Epley, Brzycki, Lombardi, Mayhew, and O\'Conner were each derived from different research samples and rep ranges. No single formula is consistently most accurate across all rep ranges and lifters, so averaging across all five smooths out the idiosyncrasies of any one formula.'},
        {title:'Why accuracy drops above 12 reps', body:'All rep-max formulas become less reliable as rep count rises, since high-rep sets are increasingly limited by muscular endurance and fatigue rather than pure strength.'},
      ],
      formula:{ label:'Epley formula', expr:'1RM = weight × (1 + reps ÷ 30)', note:'Brzycki: weight × 36 ÷ (37 − reps)' },
      examples:[
        { title:'Example — 80kg for 6 reps', scenario:'A lifter completes 80kg for 6 reps with good form on the final rep.', result:'Epley estimates ≈96.0kg; Brzycki estimates ≈92.9kg — both formulas cluster within about 3% of each other' },
        { title:'Example — using the result for programming', scenario:'Average estimated 1RM of 94kg. Programming a hypertrophy-focused session at 75–80% of 1RM.', result:'Target working weight ≈70.5–75.2kg, typically performed for 6–8 reps per set' },
      ],
      useCases:[
        { title:'Programming training percentages without testing a true max', body:'Strength programs are often written as percentages of 1RM. This calculator lets you derive that baseline from a safe, sub-maximal set rather than risking a true maximal test.'},
        { title:'Tracking strength progress over time', body:'Recalculating your estimated 1RM every few weeks from your current working sets shows whether your strength is genuinely progressing, even if you never test an actual single-rep max directly.'},
        { title:'Choosing the right rep range for your specific goal', body:'The percentage table shows roughly which rep range corresponds to each training goal — heavy, low-rep work for max strength, moderate weight and reps for hypertrophy, lighter weight and higher reps for muscular endurance.'},
      ],
    },

  },
  { slug:'blood-pressure', category:'health', group:'Life', icon:'🩺', popular:true,
    title:'Blood Pressure Checker & Tracker', short:'Blood Pressure',
    desc:'Check your blood pressure reading, see your classification, and log readings over time to track trends.',
    metaDesc:'Free blood pressure calculator. Classify your reading, track over time, see what your numbers mean.',
    tags:['blood pressure','hypertension','systolic','diastolic','bp tracker'],
    tips:['Measure at the same time daily — morning is most consistent.','Sit quietly for 5 minutes before measuring.','Avoid caffeine, exercise, and smoking 30 minutes before.','Take 3 readings, 1 minute apart, and average them.'],
    faq:[{q:'What is a normal blood pressure?',a:'Below 120/80 mmHg is normal. 120–129/<80 is elevated. 130–139/80–89 is Stage 1 hypertension.'},{q:'When is blood pressure an emergency?',a:'Above 180/120 mmHg is a hypertensive crisis. Seek emergency care immediately.'}],
    wflTopics:[{title:'Understanding blood pressure: what the numbers mean',slug:'understanding-blood-pressure'}],
    interpretation:'A single reading is a data point, not a diagnosis — blood pressure genuinely varies by 10-20 points across a normal day depending on stress, activity, posture, and even how recently you talked before measuring. One elevated reading is a reason to remeasure calmly, not to panic; a consistent pattern across many readings over days or weeks is what actually matters for a category classification you can trust.',
    commonMistakes:[{mistake:'Reacting to a single high reading as if it were a confirmed diagnosis.',fix:'Sit quietly for 5 minutes, remeasure, and take the average of 2-3 readings a minute apart. If it\'s still elevated on a different day too, that pattern is worth discussing with a doctor — one reading alone often isn\'t.'},{mistake:'Measuring right after coffee, exercise, or a stressful conversation.',fix:'All three can temporarily raise readings by 5-15 points. Wait at least 30 minutes after caffeine or exercise, and measure when reasonably calm for a reading that reflects your actual baseline.'},{mistake:'Only tracking the top (systolic) number and ignoring the bottom (diastolic) one.',fix:'A normal systolic reading with an elevated diastolic number still moves you into a higher category — this calculator classifies using whichever number is higher, so check both.'}],
    content:{
      intro:'This calculator classifies a blood pressure reading using the standard categories (Normal, Elevated, Stage 1, Stage 2) and also calculates two values rarely shown on a home BP monitor: pulse pressure and mean arterial pressure, both of which carry additional clinical meaning beyond the headline systolic/diastolic numbers.',
      howItWorks:[
        {title:'How the four categories are defined', body:'Normal is below 120/80. Elevated is systolic 120–129 with diastolic still below 80. Stage 1 hypertension is systolic 130–139 or diastolic 80–89. Stage 2 is 140/90 or higher. Crossing either threshold (systolic or diastolic) is enough to move into the higher category.'},
        {title:'Pulse pressure — the gap between the two numbers', body:'Pulse pressure is simply systolic minus diastolic. A persistently wide pulse pressure (over roughly 60mmHg) can indicate reduced arterial flexibility, and is increasingly used as an additional risk indicator alongside the standard category.'},
        {title:'Mean arterial pressure (MAP)', body:'MAP estimates the average pressure in the arteries across a full cardiac cycle, weighted toward diastolic since the heart spends more time in that phase.'},
      ],
      formula:{ label:'Mean arterial pressure', expr:'MAP = diastolic + (systolic − diastolic) ÷ 3' },
      examples:[
        { title:'Example — Stage 1 reading', scenario:'A reading of 135/85 mmHg.', result:'Classified as Stage 1 hypertension. Pulse pressure = 50 mmHg, MAP ≈102 mmHg' },
        { title:'Example — normal reading', scenario:'A reading of 115/75 mmHg.', result:'Classified as Normal. Pulse pressure = 40 mmHg, MAP ≈88 mmHg' },
      ],
      useCases:[
        { title:'Why a single reading is less useful than a tracked average', body:'Blood pressure fluctuates throughout the day and reacts to stress, caffeine, and recent activity. Tracking multiple readings over days or weeks and averaging them gives a far more reliable picture than reacting to any single number.'},
        { title:'Understanding why doctors care about the diastolic number too', body:'Many people focus only on the systolic (top) number, but a normal systolic reading with an elevated diastolic number still indicates a real category shift.'},
        { title:'When a single high reading warrants immediate attention', body:'A reading above 180/120 mmHg is considered a hypertensive crisis and warrants prompt medical attention regardless of how you feel.'},
      ],
    },

  },
  { slug:'fd-vs-mf', category:'finance', group:'Grow Money', icon:'🏦', popular:true,
    title:'FD vs Mutual Fund Calculator', short:'FD vs Mutual Fund',
    desc:'Compare fixed deposit and equity mutual fund returns after taxes over any investment period.',
    metaDesc:'Free FD vs mutual fund calculator India. Compare post-tax returns with LTCG and income tax.',
    tags:['fd vs mutual fund','fixed deposit','mutual fund returns','ltcg tax','investment comparison'],
    tips:['FD interest is taxed at your income slab every year — MF equity gains only at redemption.','For periods above 3 years, equity MF historically beats FD significantly.','The ₹1.25 lakh LTCG exemption on MF equity gains makes moderate MF gains tax-efficient too.'],
    faq:[{q:'Are FDs safer than mutual funds?',a:'Yes — FDs are insured up to ₹5 lakh per bank by DICGC. Equity mutual funds carry market risk but historically deliver higher returns.'},{q:'What is LTCG tax on mutual funds?',a:'Long-term capital gains above ₹1.25 lakh from equity funds held 1+ year are taxed at 12.5% (since the July 2024 Budget changes).'}],
    wflTopics:[{title:'Index funds vs active funds in India',slug:'sip-vs-lump-sum'},{title:'Compound interest: the force behind every fortune',slug:'compound-interest-complete-guide'}],
    interpretation:'The post-tax gap between FD and MF grows with both your tax bracket and your holding period — it isn\'t a fixed percentage difference. A 5-year comparison at a 10% tax slab will show a much smaller gap than a 20-year comparison at a 30% slab. Re-run this at your actual numbers rather than trusting a generic "MF always wins" rule of thumb.',
    commonMistakes:[{mistake:'Comparing the pre-tax FD rate directly against the pre-tax MF return without adjusting either for tax.',fix:'FD interest is taxed annually at your slab rate; equity MF gains are taxed only at redemption, and only above the ₹1.25L LTCG exemption. Compare the post-tax figures this calculator shows, not the headline rates.'},{mistake:'Assuming equity mutual fund returns are guaranteed like an FD rate.',fix:'The 10-12% used here is a long-run historical average, not a promised return. Equity MFs can and do have negative years — this comparison assumes a smoothed average, which understates real-world volatility.'},{mistake:'Using this comparison for money you need within 1-3 years.',fix:'Short time horizons don\'t give equity markets enough time to recover from a downturn. This comparison is most meaningful for money you genuinely don\'t need for 5+ years.'}],
    content:{
      intro:'Fixed Deposits and equity mutual funds are taxed completely differently in India, which means comparing their headline interest/return rates alone is misleading. This calculator runs both side by side with their actual respective tax treatments, so you see the real post-tax outcome, not just the pre-tax growth rate.',
      howItWorks:[
        {title:'FD taxation — taxed every year, regardless of withdrawal', body:'FD interest is added to your taxable income and taxed at your income tax slab rate every single year it is earned, whether or not you withdraw it. A 30% tax bracket investor effectively loses 30% of every year\'s FD interest immediately.'},
        {title:'Equity MF taxation — taxed only on redemption, at a lower rate', body:'Equity mutual fund gains are not taxed annually at all. Tax is only triggered when you actually sell, and the long-term capital gains rate (after the 2024 Budget changes) is 12.5%, with the first ₹1.25 lakh of gains in a financial year exempt entirely.'},
        {title:'Why this difference compounds significantly over time', body:'Because FD tax is deducted every year, the base available to compound shrinks annually. Equity MF gains, left untaxed until redemption, compound on the full pre-tax balance for the entire holding period.'},
      ],
      formula:{ label:'Equity LTCG tax (since 23 July 2024)', expr:'LTCG tax = max(0, gains − ₹1,25,000) × 12.5%', note:'FD: interest taxed annually at your income tax slab rate' },
      examples:[
        { title:'Example — ₹5,00,000 over 10 years, 30% tax bracket', scenario:'FD at 7% (taxed annually at 30% slab) vs equity MF at 12% (taxed only at redemption).', result:'FD grows to ≈₹8.07 lakh post-tax. MF grows to ≈₹15.53 lakh pre-tax, with LTCG tax of ≈₹1.16 lakh, netting ≈₹14.37 lakh post-tax' },
        { title:'Why the gap is larger than the rate difference alone suggests', scenario:'The pre-tax rate gap is 5 percentage points (7% vs 12%), but the post-tax outcome gap is far larger.', result:'Annual taxation on FD compounds the disadvantage every single year, on top of the lower starting rate' },
      ],
      useCases:[
        { title:'Why FDs still make sense for short-term or capital-protection goals', body:'Despite the post-tax disadvantage shown here, FDs remain appropriate for money needed within 1–3 years or where capital protection matters more than growth.'},
        { title:'Why high tax-bracket investors should weight this comparison most heavily', body:'The annual-taxation drag on FDs is proportional to your tax slab — a 30% bracket investor loses far more to annual FD taxation than someone in a 5% or 10% bracket.'},
        { title:'Using both instruments together, not as an either/or choice', body:'A common, reasonable approach uses FDs for near-term needs and emergency funds, while directing long-term goals (7+ years) toward equity mutual funds.'},
      ],
    },

  },
  // ── NEW CALCULATORS ──────────────────────────────────────────────────────
  { slug:'rent-buy', category:'finance', group:'Borrow Money', icon:'🏠', popular:true,
    title:'Rent vs Buy Calculator', short:'Rent vs Buy',
    desc:'Should you rent or buy a home? Compare total costs, equity, and investment returns over any timeline.',
    metaDesc:'Free rent vs buy calculator India. Compare buying vs renting over 10, 15, 20 years.',
    tags:['rent vs buy','home loan','property','real estate'],
    tips:['Break-even is typically 7–10 years in Indian metros.','Property appreciation rate matters more than EMI in the long run.','Factor in maintenance (1–2% p.a.) which most calculators ignore.'],
    faq:[{q:'Is it better to rent or buy in India?',a:'Depends on your city, timeline, and investment returns. Use this calculator — there is no universal answer.'},{q:'What is a good property appreciation rate?',a:'Historical metro average is 5–8% p.a. Tier-2 cities vary widely.'}],
    wflTopics:[{title:'Rent vs buy: the honest analysis for India',slug:'home-loan-guide-india'}],
    interpretation:'This is a financial-only comparison — a "buy wins" result doesn\'t mean buying is the right call for you, and a "rent wins" result doesn\'t mean renting is either. Treat the output as one input alongside stability, how long you realistically expect to stay in the city, and how much you value not being subject to a landlord\'s decisions — factors this calculator deliberately doesn\'t and can\'t price in.',
    commonMistakes:[{mistake:'Ignoring what the renter\'s saved down payment would earn if invested, and comparing raw EMI vs rent only.',fix:'A down payment not spent on a property is capital that could be invested. This calculator tracks that opportunity cost — check that you\'re comparing the full picture (equity + appreciation vs invested savings), not just monthly cash flow.'},{mistake:'Assuming property appreciation rates from a boom period will continue indefinitely.',fix:'Use a conservative, long-run appreciation assumption (5-8% in most Indian metros historically) rather than extrapolating a recent hot market — a few high-growth years followed by a flat decade is common.'},{mistake:'Forgetting maintenance, property tax, and society charges when modelling the cost of owning.',fix:'These typically run 1-2% of property value per year and are easy to leave out of a mental EMI-only comparison — make sure they\'re included in your buying-cost inputs.'}],
    content:{
      intro:'Renting versus buying is one of the most consequential financial decisions most people make, and the right answer depends heavily on local price-to-rent ratios, how long you plan to stay, and what your money would otherwise earn if invested instead of tied up in a down payment. This calculator models both paths with your actual numbers rather than a generic rule of thumb.',
      howItWorks:[
        {title:'The buying scenario', body:'This model calculates your EMI from the loan amount and rate, adds ongoing maintenance costs, and tracks how home equity builds as you pay down the loan while the property itself appreciates over time.'},
        {title:'The renting scenario and the often-overlooked opportunity cost', body:'The rent comparison also tracks what the down payment and the monthly EMI-minus-rent difference would grow to if invested instead, since a renter is not locking that capital into a single illiquid asset.'},
        {title:'Why this comparison is more nuanced than either side\'s common talking points', body:'Renting is not simply throwing money away, since buying also involves real ongoing costs that build no wealth. Buying is not always better long-term either, since it ignores the genuine opportunity cost of capital tied up in a down payment.'},
      ],
      formula:{ label:'Net buy position', expr:'Net Buy = Property Value + Equity Built − Total Cost of Buying', note:'Compared directly against the renter\'s invested-savings balance' },
      examples:[
        { title:'Example — favourable for buying', scenario:'A market with modest property appreciation (6–7%/year) and rent that is a high percentage of an equivalent EMI, held for 10+ years.', result:'Buying tends to build more net wealth, since equity and appreciation compound over a longer holding period that absorbs the upfront transaction costs' },
        { title:'Example — favourable for renting and investing', scenario:'A market with low rental yield relative to property price and a shorter expected holding period (3–5 years).', result:'Renting and investing the difference often outperforms buying, since transaction costs and a shorter appreciation runway favour liquidity and flexibility' },
      ],
      useCases:[
        { title:'Why holding period is usually the single biggest variable', body:'Transaction costs are front-loaded when buying, meaning a short holding period rarely allows enough time for appreciation and equity-building to offset them.'},
        { title:'Why your assumed investment return matters as much as your assumed property appreciation', body:'If you assume renters invest the difference at a realistic equity return (10–12%) rather than letting it sit idle, the renting scenario becomes considerably more competitive.'},
        { title:'Factoring in non-financial considerations', body:'This calculator only models the financial comparison — stability and not being subject to a landlord\'s decisions are real non-financial factors that may reasonably tip a decision even when the pure numbers favour the other option.'},
      ],
    },

  },
  { slug:'epf', category:'finance', group:'Plan Ahead', icon:'🏦', popular:true,
    title:'EPF Balance Estimator', short:'EPF Calculator',
    desc:'Project your EPF corpus at retirement based on salary, hike, and the current 8.25% interest rate.',
    metaDesc:'Free EPF calculator India. Project EPF balance at retirement with salary hike.',
    tags:['EPF','employee provident fund','retirement','PF balance'],
    tips:['EPF is one of India\'s best risk-free instruments — 8.25% p.a., tax-free at maturity.','Avoid withdrawing EPF mid-career — compounding loss is severe.','Check your UAN portal regularly for actual balance.'],
    faq:[{q:'What is the EPF interest rate?',a:'8.25% for FY 2025–26 (unchanged from FY 2024–25). The government declares this annually.'},{q:'Is EPF withdrawal taxable?',a:'Tax-free after 5+ years of continuous employment.'}],
    wflTopics:[{title:'Retirement planning in India',slug:'retirement-planning-india'}],
    interpretation:'The projected corpus is highly sensitive to your assumed years remaining and salary growth rate — small changes to either compound into large differences over a 20-30 year projection. Treat the number as a directional estimate that gets more accurate as you get closer to retirement, not a fixed target to plan your entire retirement around from day one.',
    commonMistakes:[{mistake:'Withdrawing EPF between jobs instead of transferring it via UAN.',fix:'Withdrawing resets compounding on that portion of your savings and can trigger tax if done before 5 years of continuous service. Transfer your EPF to the new employer\'s account through the UAN portal instead.'},{mistake:'Assuming the full 24% (12%+12%) goes into your EPF balance.',fix:'Only your 12% plus about 3.67% of the employer\'s share goes to EPF — the remaining ~8.33% is diverted to the Employee Pension Scheme (EPS), a separate pension benefit, not part of this calculator\'s projected corpus.'},{mistake:'Treating EPF as your entire retirement plan.',fix:'EPF\'s guaranteed ~8.25% is valuable but historically trails long-term equity returns. Most financial planners suggest pairing EPF\'s safety with equity investments (NPS, mutual funds) for the growth portion of a retirement corpus.'}],
    content:{
      intro:'The Employees\' Provident Fund is a mandatory, government-backed retirement savings scheme covering most salaried employees in India, with both employee and employer contributing every month. This calculator projects your EPF balance at retirement, accounting for compounding and your expected salary growth over your remaining working years.',
      howItWorks:[
        {title:'How the 12% contribution is actually split', body:'The well-known 12% employee contribution goes entirely into the EPF account. The employer\'s matching 12% is split — approximately 3.67% goes to EPF, while the remaining 8.33% is diverted to the Employee Pension Scheme (EPS), a separate scheme providing a monthly pension after retirement.'},
        {title:'How EPF interest compounds', body:'The EPF interest rate, set annually by the EPFO (currently 8.25% for FY 2025–26), is applied to your accumulated balance plus roughly half of the current year\'s contributions, since contributions arrive throughout the year rather than all at once.'},
        {title:'Why salary growth meaningfully changes the projection', body:'Since contributions are a percentage of salary, a higher assumed annual salary increment compounds the EPF growth on two fronts simultaneously — both the contribution amount and the balance itself grow each year.'},
      ],
      formula:{ label:'Annual EPF contribution', expr:'Contribution = annual salary × (12% employee + ~3.67% employer)', note:'The remaining ~8.33% employer share goes to EPS, a separate pension scheme' },
      examples:[
        { title:'Example — 30-year projection', scenario:'Starting salary ₹50,000/month, 8% annual salary growth, 8.25% EPF interest rate, 30 years to retirement.', result:'Projected EPF corpus ≈₹2.83 crore at retirement' },
        { title:'Why starting salary matters less than years invested', scenario:'Comparing the same scenario starting 10 years later (20 years to retirement instead of 30).', result:'The projected corpus falls dramatically despite an identical contribution rate, illustrating that EPF rewards time in the system more than starting salary level' },
      ],
      useCases:[
        { title:'Why EPF alone is rarely sufficient for retirement', body:'EPF is a reliable, guaranteed component of retirement savings, but its return is unlikely to be sufficient on its own for most people\'s retirement corpus targets — pairing it with equity investments for the growth portion of a retirement plan is standard practice.'},
        { title:'Understanding what happens to EPF when you change jobs', body:'EPF balances transfer between employers via the UAN system rather than being paid out — withdrawing and restarting an EPF account at each job interrupts compounding.'},
        { title:'Tax treatment of EPF withdrawals', body:'EPF withdrawals are tax-free if made after 5 years of continuous service, making it one of the most tax-efficient retirement instruments available to salaried employees.'},
      ],
    },

  },
  // ── New calculators (36 → 60 expansion) ───────────────────────────────────
  // Finance — Grow Money
  { slug:'fd',category:'finance',group:'Grow Money',icon:'🏦',title:'Fixed Deposit (FD) Calculator',short:'FD Calculator',desc:'Calculate FD maturity value with quarterly compounding — the standard Indian bank FD convention.',metaDesc:'Free Fixed Deposit calculator. See your FD maturity value, interest earned, and year-by-year growth.',tags:['fd','fixed deposit','bank fd'],tips:['Compare FD rates across banks — small-finance banks often offer 1-2% more than large banks for the same tenure.','Splitting one large FD into several smaller ones lets you access funds early without breaking the whole deposit.'],faq:[{q:'Is FD interest taxable?',a:'Yes, fully taxable at your income slab rate, with TDS deducted if interest exceeds ₹40,000/year.'},{q:'Can I withdraw an FD early?',a:'Yes, but most banks charge a penalty (typically 0.5-1% lower rate) for premature withdrawal.'}] ,
    content:{
      intro:'Fixed Deposits remain one of the most widely held savings instruments in India, valued for guaranteed returns and zero market risk — but the actual maturity amount depends heavily on compounding frequency, a detail many people overlook when comparing bank offers. This calculator uses the standard quarterly-compounding convention Indian banks actually apply, not a simplified annual estimate that can overstate or understate your real return.',
      howItWorks:[
        {title:'Why quarterly compounding matters', body:'Most Indian banks compound FD interest quarterly, not annually — meaning interest earned in each quarter starts earning its own interest from the next quarter onward. This produces a meaningfully higher maturity value than a simple annual-compounding estimate would suggest, especially for longer tenures.'},
        {title:'How the maturity formula works', body:'The standard FD maturity formula raises (1 + quarterly rate) to the power of the total number of quarters over the deposit term. That exponent is what produces the quarterly compounding effect described above, rather than a flat annual calculation.'},
        {title:'FD interest is taxable, unlike PPF', body:'Unlike instruments such as PPF, FD interest is fully taxable at your income slab rate in the year it accrues, not just when the FD matures. Banks deduct TDS at 10% if your annual interest exceeds 40,000 rupees (50,000 for senior citizens) — submit Form 15G/15H if your total income is below the taxable threshold to avoid this deduction.'},
        {title:'Laddering FDs for flexibility', body:'Rather than locking one large sum into a single FD, many savers split deposits across multiple FDs with staggered maturity dates, a practice called laddering. This provides periodic liquidity without breaking a large deposit early and losing the associated interest penalty.'},
      ],
      formula:{ label:'FD maturity value (quarterly compounding)', expr:'Maturity = P x (1 + r/4)^(4n)', note:'P = principal, r = annual rate as a decimal, n = years' },
      examples:[
        { title:'Example 1 — Standard 5-year FD', scenario:'100,000 rupees deposited at 7.1% for 5 years, quarterly compounding.', result:'Maturity is approximately 141,500 rupees — roughly 41,500 in interest over 5 years' },
        { title:'Example 2 — Comparing two rates', scenario:'The same 100,000 rupees at 7.1% versus a competing bank offering 7.5% for the same 5-year tenure.', result:'The 7.5% offer matures to roughly 1,500 rupees more — a small-seeming difference that grows larger with bigger principal amounts' },
        { title:'Example 3 — Senior citizen rate premium', scenario:'Many banks offer an additional 0.25-0.5% for senior citizens on the same FD product.', result:'On a 500,000 rupee deposit for 5 years, even a 0.5% premium adds several thousand rupees to the maturity value, worth checking explicitly when opening an FD for an eligible family member' },
      ],
      useCases:[
        { title:'FD vs other fixed-income options', body:'FDs compete directly with RDs, debt mutual funds, and PPF for the safe, guaranteed-return portion of a portfolio. FDs offer more flexible tenure choices than PPF, which has a 15-year lock-in, but lack PPF\u2019s tax-free interest — the right choice depends on your liquidity needs and tax situation.'},
        { title:'Using FDs for short-term goals', body:'Because FD returns are fixed and known in advance, they are well suited to money you will need on a specific date within the next 1-5 years, such as a wedding, a down payment, or a planned large purchase, where market volatility from equity investments would be an unacceptable risk.'},
        { title:'The premature withdrawal penalty', body:'Most banks reduce the effective interest rate by 0.5-1% if you withdraw an FD before maturity, recalculating the entire deposit at the lower rate for the time it was actually held. This makes laddering a better strategy than locking everything into one large FD if there is any chance you will need partial access to the funds.'},
        { title:'Reinvesting FD interest vs taking payouts', body:'Many banks let you choose between a cumulative FD, where interest is reinvested and paid out at maturity as this calculator models, or a non-cumulative FD with periodic payouts. Retirees often prefer the latter for regular income, even though it produces a lower total return than letting interest compound.'},
      ],
    },
    pairWith:[
      { slug:'ppf', reason:'Both are safe, low-risk options for the conservative part of a portfolio — compare FD\u2019s flexible tenure against PPF\u2019s tax-free, 15-year-locked return.' },
      { slug:'income-tax', reason:'FD interest adds to your taxable income every year — see how a large FD shifts your overall tax bracket.' },
    ]},
  { slug:'gov-scheme-compare',category:'finance',group:'Grow Money',icon:'🏛️',title:'PPF vs EPF vs NPS vs FD Comparison',short:'PPF/EPF/NPS/FD',desc:'Compare PPF, EPF, NPS and FD maturity value side by side to find the best fit for your age and tax bracket.',metaDesc:'Free PPF vs EPF vs NPS vs FD calculator. Compare returns, tax treatment and lock-in to pick the right scheme.',tags:['ppf','epf','nps','fd','comparison','tax saving','80c'],tips:['PPF and EPF are both fully tax-free (EEE) — the safest, most tax-efficient core of a conservative portfolio.','NPS adds an extra ₹50,000 deduction under Section 80CCD(1B), on top of the ₹1.5L Section 80C limit shared by PPF/EPF/ELSS.','40% of your NPS corpus must buy an annuity at maturity — factor that lower liquidity into your decision.'],faq:[{q:'Which is better, PPF or NPS?',a:'NPS has historically delivered higher returns (~10% blended) but 40% of the corpus must buy an annuity at maturity. PPF is safer and fully liquid-at-maturity at a lower, but fully tax-free and guaranteed, 7.1%.'},{q:'Can I invest in both PPF and NPS?',a:'Yes — and it is often the best approach. Both qualify for Section 80C (shared ₹1.5L limit with EPF/ELSS), and NPS additionally unlocks a separate ₹50,000 deduction under Section 80CCD(1B).'},{q:'Is EPF better than PPF?',a:'EPF usually wins on pure returns because your employer matches your contribution rupee-for-rupee — effectively doubling your invested principal before any interest is even applied. PPF is open to everyone (not just salaried employees) and gives you more control over contribution timing.'},{q:'Why is FD the worst option here?',a:'FD interest is fully taxable every year at your income slab rate, unlike PPF/EPF (fully tax-free) or NPS (60% tax-free at maturity). At a 30% tax slab, a 7% FD behaves like roughly a 4.9% post-tax return.'}],
    pairWith:[
      { slug:'ppf', reason:'See the exact PPF-only numbers behind the comparison — maturity value, interest, and year-by-year growth.' },
      { slug:'fd', reason:'See the exact FD-only numbers behind the comparison, including the quarterly-compounding maturity math.' },
      { slug:'retirement', reason:'PPF, EPF and NPS are usually the guaranteed core of a retirement corpus — see how they fit your overall retirement number.' },
    ]},
  { slug:'rd',category:'finance',group:'Grow Money',icon:'💰',title:'Recurring Deposit (RD) Calculator',short:'RD Calculator',desc:'Calculate RD maturity value from monthly deposits with quarterly compounding.',metaDesc:'Free Recurring Deposit calculator. See your RD maturity value from monthly deposits.',tags:['rd','recurring deposit'],tips:["RDs are useful for disciplined saving toward a known short-term goal, since missing a deposit usually triggers a small penalty.","Unlike a SIP, RD returns are fixed and guaranteed — useful when you can't tolerate market volatility."],faq:[{q:'What happens if I miss an RD instalment?',a:'Most banks charge a small penalty per missed instalment, and may close the RD if multiple instalments are missed.'}],
    content:{
      intro:'A Recurring Deposit lets you build a fixed-return corpus through disciplined monthly deposits rather than a single lump sum, with quarterly compounding that produces a guaranteed maturity value known in advance — useful for short, defined savings goals where market volatility is not acceptable.',
      howItWorks:[
        {title:'Quarterly compounding on monthly deposits', body:'Unlike a SIP where each contribution is invested in the market, an RD applies a fixed interest rate compounded quarterly. Since deposits arrive monthly but compounding happens quarterly, each instalment effectively compounds for a slightly different duration depending on when in the quarter it was deposited.'},
        {title:'Why RD returns are fixed and known in advance', body:'Unlike equity SIPs, an RD\'s maturity value is calculable in advance the moment you start, since the interest rate is locked for the full tenure — useful when you specifically need certainty about the final amount rather than the potential for higher but variable returns.'},
        {title:'Penalty for missed instalments', body:'Most banks charge a modest penalty per missed monthly instalment, and may close the RD account entirely if multiple instalments are missed in a row — RDs work best when you are confident you can sustain the monthly commitment for the full tenure.'},
      ],
      formula:{ label:'RD maturity (quarterly compounding)', expr:'Maturity = sum of all instalments, each compounded quarterly for its remaining tenure' },
      examples:[
        { title:'Example — 2-year RD', scenario:'₹5,000/month for 24 months at 7% interest.', result:'Maturity ≈₹1,29,099 (invested ₹1,20,000, interest earned ≈₹9,099)' },
        { title:'Comparing RD to a simple lump-sum FD', scenario:'Same total amount (₹1,20,000) deposited as a lump sum FD instead, at the same 7% rate, for 2 years.', result:'A lump-sum FD typically yields more interest than an RD of the same total, since the full amount compounds from day one rather than arriving gradually over the tenure' },
      ],
      useCases:[
        { title:'Saving toward a known, near-term goal', body:'RDs work well for goals with a fixed amount and fixed date 1–3 years out, like a planned purchase or a deposit for a larger commitment, where the guaranteed, predictable maturity value matters more than maximising returns.'},
        { title:'Building a savings discipline before moving to market-linked instruments', body:'For someone new to structured saving, an RD\'s fixed monthly commitment and guaranteed outcome can be a useful stepping stone before committing to the variability of an equity SIP.'},
        { title:'Comparing RD against a SIP for the same monthly amount', body:'An equity SIP at a higher expected return will likely outperform an RD over the same period, but with real volatility — RDs remain the more appropriate choice specifically when capital certainty matters more than expected return.'},
      ],
    },
  },
  { slug:'ppf',category:'finance',group:'Grow Money',icon:'🛡️',title:'PPF Calculator',short:'PPF Calculator',desc:'Calculate your PPF maturity value over the 15-year lock-in with annual compounding.',metaDesc:'Free PPF calculator. See your Public Provident Fund maturity value with current interest rates.',tags:['ppf','public provident fund'],tips:['Deposit before the 5th of the month — PPF interest is calculated on the lowest balance between the 5th and last day of each month.','You can extend PPF in blocks of 5 years after the initial 15-year term, with or without further contributions.'],faq:[{q:'What is the PPF annual deposit limit?',a:'₹1,50,000 per financial year, which also qualifies for Section 80C tax deduction.'},{q:'Is PPF interest taxable?',a:'No — PPF has Exempt-Exempt-Exempt (EEE) status: contributions, interest, and maturity are all tax-free.'}] ,
    content:{
      intro:'PPF (Public Provident Fund) is one of the few investment instruments in India offering completely tax-free returns at a government-guaranteed rate, making it a cornerstone of conservative, long-horizon financial planning. Its defining feature is the 15-year lock-in, which forces a discipline that often works in the saver\u2019s favor but requires understanding upfront before committing funds you might need sooner.',
      howItWorks:[
        {title:'Annual compounding, not quarterly', body:'Unlike a bank FD, PPF compounds annually, with interest calculated on the lowest balance held between the 5th and the last day of each month. Depositing early in the month, ideally before the 5th, means that month\u2019s deposit earns interest for the full month rather than missing out.'},
        {title:'The 1.5 lakh annual deposit cap', body:'PPF allows a maximum of 150,000 rupees in deposits per financial year across all your PPF accounts combined. Depositing beyond this cap does not earn additional interest, so contributions should be planned around this limit rather than exceeding it unintentionally.'},
        {title:'EEE tax status — a rare combination', body:'PPF carries Exempt-Exempt-Exempt status: your contribution qualifies for a Section 80C deduction, the interest earned every year is entirely tax-free, and the final maturity amount is also tax-free. Very few investment options in India offer tax-free treatment at all three of these stages simultaneously.'},
        {title:'What happens after 15 years', body:'At maturity, you can withdraw the full balance, or extend the account in blocks of 5 years, either with continued contributions or without. Many long-term savers use the extension option specifically to keep the tax-free compounding going well past the initial 15-year term.'},
      ],
      formula:{ label:'PPF maturity (annual compounding)', expr:'Each year: Interest = Balance x rate, then Balance = Balance + Deposit + Interest', note:'Repeated for each of the 15 years, with the deposit capped at 150,000 rupees per year' },
      examples:[
        { title:'Example 1 — Maxing out the annual limit', scenario:'150,000 rupees deposited every year for 15 years at a 7.1% rate.', result:'Maturity value is roughly 40-41 lakh rupees, with total contributions of 22.5 lakh rupees and the rest from compounded, tax-free interest' },
        { title:'Example 2 — A smaller, steady contribution', scenario:'50,000 rupees deposited every year for 15 years at the same rate.', result:'Maturity value is roughly 13.5-14 lakh rupees — proportionally smaller, since PPF growth scales directly with the deposit amount' },
        { title:'Example 3 — Extending past 15 years', scenario:'After reaching the 15-year maturity in Example 1, the account is extended for another 5-year block with continued maximum contributions.', result:'The balance continues compounding tax-free, and by year 20 the maturity value can be meaningfully higher than stopping at year 15, since the existing large balance keeps earning interest on top of new deposits' },
      ],
      useCases:[
        { title:'PPF as the foundation of a retirement portfolio', body:'Because of its guaranteed, tax-free, government-backed nature, PPF is commonly used as the stable, low-risk core of a retirement plan, complemented by higher-growth but higher-risk instruments like equity mutual funds for the portion of savings meant to outpace inflation more aggressively.'},
        { title:'PPF for a child\u2019s education fund', body:'The long, fixed lock-in period maps naturally onto a child\u2019s education timeline started from birth, since the 15-year maturity often lines up close to when higher-education expenses begin, while the tax-free growth maximizes the usable corpus.'},
        { title:'Partial withdrawal rules', body:'Partial withdrawals are permitted from the 7th financial year onward, subject to specific limits tied to the balance at certain points in the account\u2019s history. This makes PPF less liquid than an FD in the early years, which is worth weighing against its tax advantages.'},
        { title:'Loan against PPF', body:'Between the 3rd and 6th year, account holders can take a loan against their PPF balance at a modest interest rate, which can be a useful low-cost borrowing option without disturbing the long-term compounding of the underlying deposit.'},
      ],
    },
    pairWith:[
      { slug:'fd', reason:'Compare PPF\u2019s tax-free but long-locked return against an FD\u2019s flexible tenure and fully taxable interest.' },
      { slug:'retirement', reason:'PPF is often the safe core of a retirement corpus — see how it fits into your overall retirement number.' },
    ]},

  // Finance — Borrow Money
  { slug:'car-loan',category:'finance',group:'Borrow Money',icon:'🚗',title:'Car Loan EMI Calculator',short:'Car Loan EMI',desc:"Calculate your car loan EMI, total interest, and see how it compares to the car's depreciating value.",metaDesc:'Free car loan EMI calculator. See your monthly payment, total interest, and depreciation comparison.',tags:['car loan','auto loan','car emi'],tips:['Keep car loan tenure under 5 years — beyond that, you risk owing more than the car is worth for much of the loan.','A larger down payment reduces both your EMI and the risk of negative equity from depreciation.'],faq:[{q:'How much down payment should I make on a car loan?',a:"At least 20% is recommended — it lowers your EMI and reduces the risk of owing more than the car's resale value."}],
    content:{
      intro:'A car loan EMI calculation alone does not tell the full story, since a car is a depreciating asset losing value every year you are still paying it off. This calculator shows your EMI and total interest alongside the car\'s estimated depreciated value, so you can see whether you risk owing more than the car is worth at any point during the loan.',
      howItWorks:[
        {title:'Why down payment size matters more for cars than homes', body:'Cars depreciate 15–20% in the first year alone and continue depreciating steadily after that, while a home loan is secured against an asset that typically holds or gains value. A small down payment on a car loan increases the risk of negative equity — owing more than the car is worth — for a meaningful stretch of the loan.'},
        {title:'The depreciation curve used in this estimate', body:'This calculator applies a standard 18% annual depreciation rate as a reasonable estimate across most vehicle categories, though actual depreciation varies by brand, model, and condition.'},
        {title:'Why shorter tenures are generally recommended for car loans', body:'Keeping the loan tenure under 5 years reduces the period during which the outstanding loan balance could exceed the car\'s depreciated value — a risk that grows the longer the loan runs.'},
      ],
      formula:{ label:'Depreciated value estimate', expr:'Value after N years ≈ price × 0.82^N', note:'Standard EMI formula applies for the loan itself' },
      examples:[
        { title:'Example — 10 lakh car, 20% down, 9%, 5 years', scenario:'Principal = ₹8,00,000 after down payment.', result:'EMI ≈₹16,607/month. Estimated depreciated value after 5 years ≈₹3.71 lakh' },
        { title:'Why this comparison matters', scenario:'Comparing the outstanding loan balance against the depreciated value at any point in the loan.', result:'A larger down payment or shorter tenure keeps the loan balance below the depreciating asset value for more of the loan term, reducing negative equity risk' },
      ],
      useCases:[
        { title:'Deciding how much down payment to make', body:'A larger down payment directly reduces both your EMI and the risk window where you owe more than the car is worth — weigh this against keeping cash available for other priorities.'},
        { title:'Comparing loan tenure options', body:'A longer tenure lowers the EMI but extends the period of negative equity risk and increases total interest paid — model both a 3-year and 5-year tenure to see the real tradeoff.'},
        { title:'Understanding resale value before buying', body:'If you plan to sell or upgrade within a few years, comparing the loan balance trajectory against the depreciation curve helps avoid being unable to clear the loan from the sale proceeds.'},
      ],
    },
  },
  { slug:'personal-loan',category:'finance',group:'Borrow Money',icon:'💳',title:'Personal Loan EMI Calculator',short:'Personal Loan EMI',desc:'Calculate your personal loan EMI and total interest for unsecured loans.',metaDesc:'Free personal loan EMI calculator. See your monthly payment and total interest cost.',tags:['personal loan','unsecured loan'],tips:['Personal loans carry higher rates than secured loans (home/car) — prioritize paying these off first if you have multiple debts.','Check your credit score before applying — a higher score can mean several percentage points lower interest.'],faq:[{q:'Why are personal loan rates higher than home loan rates?',a:"Personal loans are unsecured — there's no collateral for the lender to recover if you default, so the rate compensates for that added risk."}],
    content:{
      intro:'Personal loans are unsecured, meaning no asset backs the loan, which is exactly why they carry meaningfully higher interest rates than home or car loans. This calculator shows your EMI and total interest so you can see the real cost of that convenience before borrowing.',
      howItWorks:[
        {title:'Why the lack of collateral drives up the rate', body:'With a secured loan, the lender can recover the asset (a home or car) if you default, which reduces their risk and lets them offer a lower rate. A personal loan offers no such recovery option, so the rate compensates the lender for that added risk.'},
        {title:'Typical rate and tenure ranges', body:'Personal loans in India commonly carry rates in the 10–24% range depending on credit profile, considerably higher than secured loans, and tenures are usually shorter (1–5 years) than home loans.'},
        {title:'How credit score affects the rate you are offered', body:'A meaningfully higher credit score can secure a rate several percentage points lower than what a borderline applicant receives — checking your score before applying is worth doing, since lenders use it directly to price the loan.'},
      ],
      formula:{ label:'Standard EMI formula', expr:'EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1)', note:'P = principal, r = monthly rate, n = number of months' },
      examples:[
        { title:'Example — ₹3,00,000 personal loan', scenario:'₹3,00,000 at 14% for 3 years.', result:'EMI ≈₹10,253/month, total repayment ≈₹3.69 lakh, total interest ≈₹69,000' },
        { title:'Why prioritising payoff matters here', scenario:'The same loan compared against a home loan at 8.5% for the same principal and tenure.', result:'The personal loan\'s total interest is substantially higher purely due to the rate difference, despite an identical principal and tenure — illustrating why personal loan debt deserves priority in any payoff plan' },
      ],
      useCases:[
        { title:'Comparing the true cost against alternatives before borrowing', body:'If a personal loan is being considered for a purchase that could instead be saved for over a few months, comparing the total interest cost here against the opportunity cost of waiting often makes the tradeoff clearer.'},
        { title:'Prioritising personal loan payoff among multiple debts', body:'Given the meaningfully higher rate compared to secured loans, personal loan debt should generally be prioritised for early payoff ahead of lower-rate debts like a home or car loan.'},
        { title:'Checking your credit score before applying', body:'Since rate offers vary significantly by credit profile, checking your score beforehand and addressing any easily fixable issues can directly translate into a lower rate on the actual loan.'},
      ],
    },
  },

  // Finance — Plan Ahead
  { slug:'lean-fire',category:'finance',group:'Plan Ahead',icon:'🌱',title:'Lean FIRE Calculator',short:'Lean FIRE',desc:'Calculate your Lean FIRE number — financial independence on a deliberately minimal budget.',metaDesc:'Free Lean FIRE calculator. Find your financial independence number on a lean, minimal-expense budget.',tags:['lean fire','fire movement','minimalist'],tips:["Lean FIRE trades some lifestyle comfort for an earlier exit from full-time work — be honest about which expenses you can actually sustain long-term.",'Revisit your lean number periodically; what feels sustainable changes as life circumstances change.'],faq:[{q:"What's the difference between FIRE and Lean FIRE?",a:'Lean FIRE applies the same 25x rule to a deliberately reduced, minimal expense base, reaching independence sooner but with less spending cushion.'}],
    content:{
      intro:'Lean FIRE reaches financial independence sooner than standard FIRE by deliberately targeting a leaner, more minimal expense base rather than maintaining your current lifestyle spending — a real tradeoff between an earlier exit from full-time work and a thinner spending cushion afterward.',
      howItWorks:[
        {title:'How the leaner expense base is calculated', body:'This calculator reduces your current annual expenses by a percentage you choose, representing genuine, sustainable cuts (not aspirational ones) you would be comfortable maintaining long-term, then applies the standard 25x rule to that reduced figure.'},
        {title:'Why the cuts need to be genuinely sustainable', body:'A Lean FIRE number calculated against an unrealistically minimal budget that you cannot actually sustain for decades defeats the purpose — the leaner figure should reflect spending you have actually tested and found workable, not a theoretical minimum.'},
        {title:'The honest tradeoff at the core of Lean FIRE', body:'Reaching financial independence sooner under Lean FIRE means accepting less spending flexibility afterward — there is less room to absorb unexpected costs or lifestyle changes compared to a standard or Fat FIRE target.'},
      ],
      formula:{ label:'Lean FIRE number', expr:'Lean expenses = current annual expenses × (1 − reduction %); FIRE number = lean expenses × 25' },
      examples:[
        { title:'Example — 30% expense reduction', scenario:'Current annual expenses ₹6,00,000, targeting a 30% reduction, current portfolio ₹5,00,000, investing ₹30,000/month at 11% return.', result:'Lean annual expense = ₹4,20,000, Lean FIRE number = ₹1,05,00,000, reached in approximately 11.8 years' },
        { title:'Comparing against standard FIRE on the same income', scenario:'Same starting numbers, but no expense reduction (standard FIRE target instead).', result:'The standard FIRE number is meaningfully higher, requiring a longer timeline to reach — the leaner target trades future spending flexibility for an earlier independence date' },
      ],
      useCases:[
        { title:'Deciding whether Lean FIRE genuinely fits your situation', body:'Lean FIRE works best for people who have already tested a leaner lifestyle and found it sustainable, not as a theoretical exercise — be honest about which current expenses you could actually cut long-term before committing to this target.'},
        { title:'Using Lean FIRE as an interim milestone', body:'Some people treat their Lean FIRE number as an earlier checkpoint, reaching it first and then continuing to invest toward a fuller, more comfortable FIRE number afterward, rather than stopping work entirely at the lean target.'},
        { title:'Revisiting the lean percentage as circumstances change', body:'What feels sustainable shifts with life changes — revisit your assumed reduction percentage periodically rather than treating it as fixed from when you first calculated it.'},
      ],
    },
  },
  { slug:'coast-fire',category:'finance',group:'Plan Ahead',icon:'⛵',title:'Coast FIRE Calculator',short:'Coast FIRE',desc:'Find the point where your current investments alone will reach your retirement target with zero further contributions.',metaDesc:'Free Coast FIRE calculator. See if your current savings will compound to your retirement goal on their own.',tags:['coast fire','fire movement'],tips:["Reaching Coast FIRE doesn't mean you have to stop working — many people use it to justify switching to lower-stress or lower-paying work.",'Re-run this calculator whenever your portfolio value or retirement timeline changes meaningfully.'],faq:[{q:'What is Coast FIRE?',a:'The point where your existing investments, left untouched, will grow to your full retirement target by your planned retirement age purely from compounding.'}],
    content:{
      intro:'Coast FIRE is the point where your current investments, with zero further contributions, will still compound to your full retirement target by your planned retirement age. Reaching it does not mean you must stop working — many people use it as the green light to switch to lower-stress or lower-paying work without sacrificing their eventual retirement security.',
      howItWorks:[
        {title:'How this differs from a standard FIRE number', body:'A standard FIRE calculation assumes you keep contributing until retirement. Coast FIRE specifically asks whether your existing portfolio alone, given enough years left to compound, reaches the target — contributions become optional from that point forward.'},
        {title:'The "Coast FIRE number today"', body:'This calculator also shows the portfolio value needed right now to coast to your target — a useful benchmark even if you have not reached it yet, since it tells you exactly how much further compounding alone needs to close the gap.'},
        {title:'Why years remaining matters as much as portfolio size', body:'A smaller portfolio with many years left to compound can reach Coast FIRE before a larger portfolio with few years remaining — time, not just capital, is doing real work in this calculation.'},
      ],
      formula:{ label:'Projected value at retirement', expr:'Projected = current portfolio × (1 + return)^years to retirement' },
      examples:[
        { title:'Example — already at Coast FIRE', scenario:'₹30,00,000 portfolio, 20 years to retirement, 11% expected return, target of ₹2,00,00,000.', result:'Projected value at retirement ≈₹2.42 crore — exceeds the target, meaning Coast FIRE has already been reached' },
        { title:'Using the Coast FIRE number today', scenario:'Same 20-year horizon and target.', result:'The portfolio needed today to coast to the target is ≈₹24.8 lakh — since the actual portfolio (₹30L) exceeds this, the result confirms Coast FIRE status' },
      ],
      useCases:[
        { title:'Deciding whether to switch to lower-stress work', body:'If you have reached Coast FIRE, taking a lower-paying or less stressful job no longer jeopardises your eventual retirement target, since existing investments alone will get you there.'},
        { title:'Knowing exactly how much more you need if you have not reached it', body:'The shortfall figure shows precisely how much additional portfolio value (today) would close the gap, which is more actionable than knowing only the eventual retirement target.'},
        { title:'Revisiting the calculation as circumstances change', body:'Re-run this whenever your portfolio value, expected return assumption, or retirement timeline changes meaningfully, since all three directly affect whether Coast FIRE status holds.'},
      ],
    },
  },
  { slug:'emergency-fund',category:'finance',group:'Plan Ahead',icon:'🆘',title:'Emergency Fund Calculator',short:'Emergency Fund',desc:'Find your ideal emergency fund size based on your expenses and job stability.',metaDesc:'Free emergency fund calculator. Find how much you should save based on your income stability.',tags:['emergency fund','rainy day fund'],tips:['Keep your emergency fund in a liquid, low-risk instrument (savings account, liquid fund) — not locked away or invested in volatile assets.','Rebuild your emergency fund as the first priority after using it, before resuming other investment goals.'],faq:[{q:'How many months of expenses should an emergency fund cover?',a:'3-6 months for stable dual-income households, 6-12 months for single-income or variable-income situations.'}],
    content:{
      intro:'An emergency fund is not a single fixed amount — the right size depends on how stable your income actually is. This calculator scales the target by a stability factor you choose, rather than defaulting to one generic "3 to 6 months" rule that may be too thin or too conservative for your specific situation.',
      howItWorks:[
        {title:'Why stability, not income level, drives the target', body:'A salaried employee in a stable dual-income household generally needs less buffer than a freelancer or single-income household with variable monthly earnings, even at the identical monthly expense level — risk of income disruption matters more than the expense amount itself.'},
        {title:'The months-of-expenses model', body:'This calculator multiplies your monthly essential expenses by a stability factor (commonly 3–6 for stable income, 6–12 for variable or single-income situations) to produce a target corpus.'},
        {title:'Why "expenses," not "income," is the right base', body:'An emergency fund needs to cover what you actually spend during a disruption, not your full income — using income as the base would overstate the real requirement for most households.'},
      ],
      formula:{ label:'Emergency fund target', expr:'Target = monthly essential expenses × stability factor (months)' },
      examples:[
        { title:'Example — stable dual-income household', scenario:'Monthly essential expenses of ₹50,000, stability factor of 6 months.', result:'Target emergency fund = ₹3,00,000' },
        { title:'Example — variable-income freelancer', scenario:'Same ₹50,000 monthly expenses, but a stability factor of 9 months given irregular income.', result:'Target emergency fund = ₹4,50,000 — 50% larger than the stable-income example purely due to income volatility' },
      ],
      useCases:[
        { title:'Choosing the right stability factor for your situation', body:'Be honest about your actual income reliability — a single-income household, commission-based role, or freelance income all warrant a larger multiple than a stable, dual-income salaried household.'},
        { title:'Where to actually keep this money', body:'A liquid, low-risk instrument (savings account or liquid mutual fund) is appropriate, since an emergency fund prioritises immediate access over growth — this money should not be exposed to market volatility.'},
        { title:'Rebuilding after a withdrawal', body:'If you use part or all of your emergency fund, treat rebuilding it as the top financial priority before resuming other investment contributions, since a depleted emergency fund leaves you exposed to needing high-interest debt for the next shock.'},
      ],
    },
  },

  // Finance — Tax & Pay
  { slug:'hra',category:'finance',group:'Tax & Pay',icon:'🏠',title:'HRA Exemption Calculator',short:'HRA Exemption',desc:'Calculate your House Rent Allowance tax exemption under Section 10(13A).',metaDesc:'Free HRA exemption calculator. Find your tax-exempt HRA amount under Section 10(13A).',tags:['hra','house rent allowance','tax exemption'],tips:["Keep rent receipts and your landlord's PAN (if annual rent exceeds ₹1,00,000) — both are typically required to claim HRA exemption.",'HRA exemption only applies if you actually live in rented accommodation — paying rent to a family member is allowed but should be at a fair market rate with proper documentation.'],faq:[{q:'Can I claim HRA if I live with my parents and pay them rent?',a:'Yes, this is allowed, but the rent payment should be genuine, documented (bank transfer), and your parents must declare it as rental income.'}],
    content:{
      intro:'HRA exemption is calculated as the least of three separate conditions, not simply the HRA amount your employer pays you — a detail that causes many salaried employees to either under-claim or incorrectly assume their full HRA is tax-free. This calculator runs all three conditions and shows you exactly which one is the binding constraint.',
      howItWorks:[
        {title:'The three conditions, explained', body:'Condition 1 is the actual HRA received from your employer. Condition 2 is rent paid minus 10% of basic salary. Condition 3 is 50% of basic salary in a metro city, or 40% in a non-metro city. The exemption is the smallest of these three.',},
        {title:'Why metro classification matters', body:'Only Delhi, Mumbai, Kolkata, and Chennai count as metros for this specific calculation — other major cities like Bengaluru, Hyderabad, and Pune use the 40% non-metro rate despite being large, expensive cities.'},
        {title:'What happens if you do not pay rent at all', body:'If you do not pay rent, your entire HRA received becomes taxable, since Condition 2 (rent minus 10% of basic) would be zero or negative, making it the binding minimum.'},
      ],
      formula:{ label:'HRA exemption', expr:'Exemption = min(HRA received, rent paid − 10% × basic salary, 50%/40% × basic salary)' },
      examples:[
        { title:'Example — all three conditions distinct', scenario:'Basic salary ₹40,000/month, HRA received ₹18,000/month, rent paid ₹25,000/month, metro city.', result:'Condition 1 = ₹18,000. Condition 2 = ₹21,000. Condition 3 = ₹20,000. Exemption = ₹18,000 (the smallest) — meaning the entire HRA received is exempt, with zero taxable HRA' },
        { title:'Example — rent below the threshold', scenario:'Same salary and HRA, but rent paid is only ₹8,000/month.', result:'Condition 2 becomes ₹4,000 (8,000 − 4,000), now the binding minimum — only ₹4,000 is exempt, with ₹14,000 of the HRA becoming taxable' },
      ],
      useCases:[
        { title:'Why low rent relative to salary sharply reduces your exemption', body:'As shown in the second example, paying rent that is low relative to your basic salary can make Condition 2 the binding constraint, significantly reducing your exemption even if your employer pays a generous HRA.'},
        { title:'Claiming HRA when living with parents', body:'This is legitimate if you pay genuine, documented rent (ideally via bank transfer) and your parents declare it as rental income on their own tax return — verbal or undocumented arrangements do not satisfy audit requirements.'},
        { title:'What to do if you do not receive HRA but pay rent', body:'Section 80GG provides a separate, smaller deduction for rent paid by those who do not receive HRA at all — a different provision worth checking if this applies to you.'},
      ],
    },
  },
  { slug:'capital-gains',category:'finance',group:'Tax & Pay',icon:'📈',title:'Capital Gains Tax Calculator',short:'Capital Gains Tax',desc:'Estimate capital gains tax on equity, debt funds, or property based on holding period.',metaDesc:'Free capital gains tax calculator. Estimate STCG/LTCG tax on equity, debt, or property.',tags:['capital gains','ltcg','stcg'],tips:['Holding equity investments past the 12-month mark shifts gains from STCG (20%) to the more favorable LTCG (12.5%) rate.',"Harvest long-term equity gains up to the ₹1.25 lakh annual exemption each year if you don't need the funds immediately — it's a use-it-or-lose-it allowance."],faq:[{q:'What is the LTCG exemption limit for equity?',a:'₹1,25,000 per financial year — long-term equity gains above this are taxed at 12.5%.'}],
    content:{
      intro:'Capital gains tax in India depends heavily on three factors: what type of asset you sold, how long you held it, and whether the gain falls within an available exemption threshold. This calculator applies the correct holding-period rule and tax rate for equity, debt, and property separately, rather than a single generic estimate.',
      howItWorks:[
        {title:'Equity — the most favourable treatment, with conditions', body:'Equity shares and equity mutual funds held over 12 months qualify for long-term treatment: 12.5% tax on gains above a ₹1,25,000 annual exemption (since the July 2024 Budget). Held under 12 months, gains are short-term and taxed at 20%.'},
        {title:'Debt — no long-term preferential rate since 2023', body:'Debt mutual fund units purchased on or after 1 April 2023 are taxed at your income tax slab rate regardless of holding period — the long-term capital gains benefit for debt funds was removed by that rule change.'},
        {title:'Property — a 24-month threshold and no indexation since mid-2024', body:'Property held over 24 months qualifies as long-term, taxed at 12.5% without indexation for transfers after 23 July 2024 (a simplified estimate is used here; consult a tax professional for property sold before that date, where indexation rules may still apply).'},
      ],
      formula:{ label:'Equity LTCG tax', expr:'Tax = max(0, gain − ₹1,25,000) × 12.5%', note:'Equity STCG (under 12 months): gain × 20%' },
      examples:[
        { title:'Example — equity, long-term', scenario:'Equity shares purchased for ₹3,00,000, sold 18 months later for ₹5,00,000.', result:'Gain = ₹2,00,000. Taxable gain after exemption = ₹75,000. Tax = ₹9,375 at 12.5%' },
        { title:'Example — equity, short-term', scenario:'Same shares, but sold after only 8 months instead.', result:'Gain = ₹2,00,000, fully taxed at the short-term rate of 20% (no exemption applies) = ₹40,000 tax' },
      ],
      useCases:[
        { title:'Why holding period alone can save a meaningful amount of tax', body:'The equity example above shows the same ₹2 lakh gain taxed at either ₹9,375 or ₹40,000 depending purely on whether the holding period crossed 12 months.'},
        { title:'Spreading gains across financial years to use the exemption repeatedly', body:'The ₹1,25,000 equity exemption applies per financial year — spreading a large redemption across two financial years can let you use the exemption twice instead of once.'},
        { title:'Why debt funds lost their tax advantage', body:'Before April 2023, debt funds held over 36 months received indexation-adjusted long-term treatment. This benefit was removed for units purchased after that date.'},
      ],
    },
  },
  { slug:'take-home-salary',category:'finance',group:'Tax & Pay',icon:'💵',title:'Take-Home Salary Calculator',short:'Take-Home Salary',desc:'Estimate your monthly in-hand salary from your annual CTC.',metaDesc:'Free take-home salary calculator. Estimate your monthly in-hand pay from CTC.',tags:['take home salary','ctc','in-hand salary'],tips:['CTC includes employer contributions you never see in-hand (employer PF, gratuity) — always ask for the monthly in-hand figure when comparing offers.','A higher CTC with a lower basic-to-CTC ratio can sometimes mean a lower in-hand salary than expected — check the actual breakup.'],faq:[{q:'Why is my in-hand salary lower than CTC divided by 12?',a:'CTC includes employer PF contribution, gratuity, and other components that are part of your total cost to the company but are not paid to you monthly.'}],
    content:{
      intro:'CTC (Cost to Company) is not the same as what lands in your bank account each month, since it bundles in employer contributions and benefits you never receive as cash. This calculator estimates your monthly take-home pay by working backward from CTC through the major deductions.',
      howItWorks:[
        {title:'What gets removed from CTC before you see it', body:'Employer PF contribution is part of your CTC on paper but goes into your retirement account, not your monthly pay. Income tax is also deducted before the remainder reaches your account. This calculator nets out both to estimate the actual monthly figure.'},
        {title:'Why basic salary percentage changes the outcome', body:'Components like PF contribution and HRA are typically calculated as a percentage of basic salary, not total CTC — two offers with identical CTC but different basic-to-CTC ratios can produce noticeably different in-hand amounts.'},
        {title:'An important honesty note on the tax estimate', body:'The income tax figure shown here is a simplified, rough approximation, not a substitute for an actual tax computation, which depends on your specific deductions, exemptions, and chosen tax regime. Use HealthWealthTools\' dedicated Income Tax Calculator for an accurate figure before making financial decisions based on the exact tax amount.'},
      ],
      formula:{ label:'Simplified monthly in-hand estimate', expr:'In-hand ≈ (CTC − employer PF − bonus) ÷ 12 − employee PF − estimated tax' },
      examples:[
        { title:'Example — ₹12 lakh CTC', scenario:'CTC ₹12,00,000, basic salary 40% of CTC, annual bonus ₹1,00,000.', result:'Estimated monthly in-hand ≈₹84,080 — meaningfully less than the naive ₹12L ÷ 12 = ₹1,00,000 figure many people assume' },
        { title:'Why basic percentage matters', scenario:'Same ₹12 lakh CTC, but with a higher basic percentage (say 50% instead of 40%).', result:'PF contribution rises correspondingly, generally producing a different (often somewhat lower) in-hand monthly figure despite an identical total CTC' },
      ],
      useCases:[
        { title:'Comparing job offers with different CTC structures fairly', body:'Two offers with the same headline CTC can produce different actual take-home pay depending on basic percentage, bonus structure, and other components — always ask for the detailed breakup, not just the CTC figure, before comparing offers.'},
        { title:'Setting a realistic monthly budget before a new job starts', body:'Budgeting against the full CTC divided by 12 consistently overstates available monthly cash — use the more realistic in-hand estimate instead when planning expenses around a new salary.'},
        { title:'Getting an accurate tax figure for actual filing decisions', body:'Once you need a precise number rather than a planning estimate, use a dedicated income tax calculator that accounts for your specific deductions and regime choice rather than this calculator\'s simplified approximation.'},
      ],
    },
  },

  // Finance — Tools
  { slug:'simple-interest',category:'finance',group:'Tools',icon:'➗',title:'Simple Interest Calculator',short:'Simple Interest',desc:'Calculate simple interest and compare it against compound interest on the same amount.',metaDesc:'Free simple interest calculator. Calculate interest and compare against compound growth.',tags:['simple interest'],tips:['Simple interest is calculated only on the principal — useful for short-term loans, but it is why long-term savings should generally use compound instruments instead.'],faq:[{q:"What's the difference between simple and compound interest?",a:'Simple interest is calculated only on the original principal. Compound interest is calculated on the principal plus previously earned interest, so it grows faster over time.'}],
    content:{
      intro:'Simple interest is calculated only on the original principal amount for the entire period, never on any interest already earned — a more predictable but slower-growing alternative to compound interest, still relevant for certain short-term loans and a small number of fixed-income instruments.',
      howItWorks:[
        {title:'Why simple interest never accelerates', body:'Because each period\'s interest is always calculated on the same original principal, the amount of interest earned per period stays constant throughout the term — unlike compound interest, where the base grows and accelerates the interest earned each period.'},
        {title:'Where simple interest still genuinely applies', body:'Some short-term personal loans, certain types of bonds, and specific fixed-income products in India calculate interest this way — understanding the distinction helps you correctly evaluate the real cost or return of these instruments.'},
        {title:'Why the gap to compound interest widens with time', body:'Over short periods, simple and compound interest produce similar results. Over longer periods, the gap becomes dramatic, since compounding\'s advantage is specifically about time — this is why simple interest is rarely used for long-term savings or investment products.'},
      ],
      formula:{ label:'Simple interest', expr:'Interest = Principal × Rate × Time', note:'Total = Principal + Interest' },
      examples:[
        { title:'Example — ₹2,00,000 for 5 years', scenario:'₹2,00,000 at 8% simple interest for 5 years.', result:'Interest = ₹80,000, total = ₹2,80,000' },
        { title:'Comparing the same numbers as compound interest', scenario:'Same ₹2,00,000, 8%, 5 years, but compounded annually instead.', result:'Compound interest produces a meaningfully higher total than the ₹2,80,000 simple-interest result, since each year\'s interest also earns interest in the compound version' },
      ],
      useCases:[
        { title:'Evaluating short-term loans that use simple interest', body:'Some personal loans and short-term lending products are quoted using simple interest — calculating the actual total cost this way helps you compare them fairly against compound-interest alternatives quoted at a similar headline rate.'},
        { title:'Understanding why long-term savings should avoid simple-interest instruments', body:'Any savings or investment goal beyond a few years benefits substantially more from compound growth — use this calculator specifically to see the cost of choosing a simple-interest instrument over a comparable compounding one for long-term money.'},
        { title:'Quick estimates for fixed-term lending', body:'For a known principal, rate, and term using simple interest, this calculator gives an instant total cost without needing to work through the formula manually.'},
      ],
    },
  },
  { slug:'discount',category:'finance',group:'Tools',icon:'🏷️',title:'Discount Calculator',short:'Discount Calculator',desc:'Calculate the final price after one or two stacked discounts, and the true effective discount rate.',metaDesc:'Free discount calculator. Calculate sale price and effective discount, including stacked discounts.',tags:['discount','sale price'],tips:['Stacked discounts (e.g. 20% + 10%) are never simply additive — they compound on the already-reduced price, so the real total is always less than the sum.'],faq:[{q:'Does 20% off + 10% off equal 30% off?',a:'No — the second discount applies to the already-discounted price, so 20% + 10% works out to 28% total, not 30%.'}],
    content:{
      intro:'Stacked discounts are a common source of confusion because they feel like they should simply add together, but they do not — each successive discount applies to an already-reduced price, which means the combined effective discount is always slightly less than the sum of the individual percentages.',
      howItWorks:[
        {title:'Why discounts compound rather than add', body:'A 20% discount followed by a 10% discount means: first multiply the price by 0.80, then multiply that result by 0.90. The combined multiplier is 0.80 × 0.90 = 0.72, meaning the final price is 72% of the original — a 28% total discount, not 30%.'},
        {title:'The general rule for any two stacked percentages', body:'For any two discounts A% and B%, the combined effective discount is always slightly less than A% + B%, with the gap growing larger as the individual percentages increase.'},
        {title:'Why retailers sometimes present discounts this way', body:'Advertising "20% off, plus an extra 10% off" can sound more generous than the mathematically equivalent single 28% discount, even though the actual saving is identical — a useful thing to recognise as a shopper.'},
      ],
      formula:{ label:'Stacked discount', expr:'Final price = price × (1 − discount1%) × (1 − discount2%)' },
      examples:[
        { title:'Example — 20% then 10%', scenario:'A ₹1,000 item with 20% off, then an additional 10% off the discounted price.', result:'Final price = ₹1,000 × 0.80 × 0.90 = ₹720. Effective total discount = 28%, not 30%' },
        { title:'Example — single equivalent discount', scenario:'What single discount percentage would produce the same ₹720 final price directly?', result:'A flat 28% discount on ₹1,000 also gives ₹720 — confirming the stacked discount is mathematically identical to a single 28% reduction' },
      ],
      useCases:[
        { title:'Comparing "stacked" deals against a single flat discount', body:'When deciding between a retailer offering stacked percentages versus a competitor offering one flat percentage, calculate the actual final price for both rather than comparing the headline numbers directly.'},
        { title:'Understanding why the order of discounts does not matter', body:'Multiplying by 0.80 then 0.90 gives the same result as multiplying by 0.90 then 0.80 — the order of stacked percentage discounts does not affect the final price, only the total number of discounts applied does.'},
        { title:'Calculating the true effective discount rate for budgeting', body:'Knowing the real combined percentage (28%, not 30%) matters when comparing your actual savings against a budget or when comparing deals across different stores with different discount structures.'},
      ],
    },
  },

  // Finance — Insurance (new group)
  { slug:'term-insurance',category:'finance',group:'Insurance',icon:'🛡️',title:'Term Insurance Calculator',short:'Term Insurance',desc:'Calculate how much life insurance cover you need using the Human Life Value method.',metaDesc:'Free term insurance calculator. Find your recommended life insurance cover amount.',tags:['term insurance','life insurance cover'],tips:['Buy term insurance early — premiums are locked in lower at a younger age and increase significantly with age and health conditions.','Avoid investment-linked insurance (ULIPs, endowment plans) as your primary cover — pure term insurance gives far more cover per rupee of premium.'],faq:[{q:'How much life insurance cover do I need?',a:'A common rule of thumb is 10-15x your annual income, but the Human Life Value method (used here) accounts for your specific debts, dependents, and existing savings for a more tailored number.'}] ,
    content:{
      intro:'Term life insurance exists for one purpose: replacing your income for the people who depend on it if you are no longer there to provide it. Unlike investment-linked insurance products, term insurance carries no savings component, which is exactly why it offers far more coverage per rupee of premium than any other type of life insurance — every rupee goes toward pure protection.',
      howItWorks:[
        {title:'The Human Life Value method', body:'Rather than using a flat multiple of income, this calculator estimates the cover you need by adding up your income replacement need over a chosen number of years, your outstanding loans, and a buffer per dependent, then subtracting savings you already have. This produces a more tailored number than a generic 10x or 15x income rule.'},
        {title:'Why premiums rise sharply with age', body:'Term insurance premiums are priced on mortality risk, which increases with age and with health conditions discovered over time. Buying cover earlier in life, even before it feels urgent, locks in a meaningfully lower premium for the same coverage amount than waiting another decade would.'},
        {title:'Term insurance vs investment-linked insurance', body:'Products like ULIPs and endowment plans bundle a small insurance component with an investment component, but typically deliver weaker investment returns than a standalone mutual fund and far less coverage than a pure term plan for the same premium. Most financial planners recommend separating insurance and investment rather than combining them.'},
        {title:'Choosing the right cover period', body:'A common approach is to cover yourself until your youngest dependent becomes financially independent, or until major liabilities like a home loan are expected to be paid off, whichever is longer. This calculator\u2019s "years to cover" input should reflect that horizon, not just your current age.'},
      ],
      examples:[
        { title:'Example 1 — Young family with a home loan', scenario:'Annual income of 800,000 rupees, 20 years of income to replace, a 2,000,000 rupee outstanding home loan, 500,000 rupees in existing savings, and 2 dependents.', result:'Recommended cover comes out to roughly 1.75-1.8 crore rupees once income replacement, the loan, and dependent buffers are added together and existing savings are subtracted' },
        { title:'Example 2 — Single income earner, no dependents yet', scenario:'Annual income of 600,000 rupees, 10 years of cover, no outstanding loans, modest savings, and 0 dependents.', result:'Recommended cover is meaningfully lower, since there is no dependent buffer or major liability driving the number up, though the income-replacement component still applies' },
        { title:'Example 3 — Updating cover after a major life event', scenario:'The same person from Example 2 gets married, takes on a home loan, and has a child a few years later.', result:'Re-running the calculator with the new loan amount and 1 dependent typically increases the recommended cover substantially, illustrating why term cover should be revisited after major life changes rather than left at the original amount indefinitely' },
      ],
      useCases:[
        { title:'Buying term insurance early, even without dependents yet', body:'Locking in a term plan in your twenties or early thirties, before health conditions or family obligations exist, secures a low premium for the policy\u2019s entire term. Increasing cover later as income and dependents grow is usually more cost-effective than starting from scratch at an older age.'},
        { title:'Term insurance is not optional once you have dependents', body:'If anyone, a spouse, children, or aging parents, relies on your income, the absence of term cover means that risk is currently unmanaged. The Human Life Value method used here is specifically designed to quantify that risk in concrete rupee terms rather than leaving it as an abstract worry.'},
        { title:'Riders worth considering', body:'Many insurers offer optional riders such as critical illness or accidental death benefit on top of a base term plan, which can extend protection for specific risks at a modest additional premium, though they add complexity and should be evaluated against your specific risk profile.'},
        { title:'Declaring health information honestly', body:'Term insurance claims can be rejected if pre-existing health conditions are not disclosed during the application process, regardless of how unrelated the eventual cause of claim seems. Full, honest disclosure at the time of buying protects the policy\u2019s validity for your family later.'},
      ],
    },
    pairWith:[
      { slug:'emergency-fund', reason:'An emergency fund covers short-term shocks; term insurance covers the much larger, long-term risk of lost income entirely.' },
      { slug:'health-insurance', reason:'Term and health insurance address different risks — income loss versus medical costs — and most complete financial plans need both.' },
    ]},
  { slug:'health-insurance',category:'finance',group:'Insurance',icon:'🏥',title:'Health Insurance Calculator',short:'Health Insurance',desc:'Estimate the right health insurance cover for your family based on city, age, and family size.',metaDesc:'Free health insurance calculator. Estimate the right family floater cover for your situation.',tags:['health insurance','medical insurance','family floater'],tips:['Buy health insurance before you need it — pre-existing conditions discovered after a claim can complicate or delay payouts.','A family floater is usually more cost-effective than individual policies for each family member, unless someone has a serious pre-existing condition.'],faq:[{q:'How much health insurance cover do I need for my family?',a:'A reasonable starting point is ₹5-10 lakh per family in a metro city, scaled up with age and any pre-existing conditions — get actual quotes to confirm.'}],
    content:{
      intro:'Health insurance cover requirements are not one-size-fits-all — city tier, the age of the oldest family member, and any existing health conditions all meaningfully shift how much cover is genuinely adequate. This calculator scales a recommended cover amount across these factors rather than suggesting a single generic figure.',
      howItWorks:[
        {title:'Why city tier changes the base recommendation', body:'Healthcare costs vary substantially between metro cities and smaller towns — a hospitalisation that costs a certain amount in a Tier 3 city can cost considerably more for comparable treatment in a metro, which is why this calculator starts from a different base cover for each city tier.'},
        {title:'Age-based scaling', body:'Recommended cover increases meaningfully once the oldest family member crosses 45, and again past 60, reflecting the generally higher likelihood and cost of health events at older ages.'},
        {title:'Family size and existing conditions', body:'Each additional family member beyond two adds to the recommended cover, and any existing health condition in the family further increases the suggested amount, since pre-existing conditions are statistically associated with higher future claim likelihood.'},
      ],
      formula:{ label:'Recommended cover', expr:'Base (by city tier) × age multiplier × condition multiplier + (family size − 2) × addon per person' },
      examples:[
        { title:'Example — family of 4, metro, oldest 50, no conditions', scenario:'City tier metro (base ₹10,00,000), oldest family member 50 (1.5x multiplier), family size 4.', result:'Recommended cover ≈₹18,00,000, estimated annual premium roughly ₹21,600–45,000' },
        { title:'Example — same family, oldest member 65', scenario:'Same family, but oldest member now 65 instead of 50.', result:'Recommended cover increases substantially due to the additional age-based multiplier for crossing 60 — illustrating how much age alone shifts the adequate cover amount' },
      ],
      useCases:[
        { title:'Choosing between a family floater and individual policies', body:'A family floater is usually more cost-effective than separate individual policies for each family member, unless someone has a serious pre-existing condition that would significantly raise the floater\'s overall premium.'},
        { title:'Buying cover before it is needed', body:'Pre-existing conditions discovered or developed after a claim can complicate or delay future payouts — buying adequate cover while everyone is healthy avoids this entirely.'},
        { title:'Using this as a starting point, not a final quote', body:'This calculator gives a reasonable planning estimate — always get actual quotes from insurers to confirm real premium costs and coverage terms before purchasing.'},
      ],
    },
  },
  { slug:'car-insurance',category:'finance',group:'Insurance',icon:'🚙',title:'Car Insurance Calculator',short:'Car Insurance',desc:'Estimate your car insurance premium based on IDV, city, and No-Claim Bonus.',metaDesc:'Free car insurance calculator. Estimate your annual premium based on car value and NCB.',tags:['car insurance','motor insurance','idv'],tips:['Your No-Claim Bonus (NCB) is tied to you, not your car — it transfers to a new vehicle if you switch cars without making a claim.','Compare IDV across insurers — a lower IDV reduces your premium but also reduces your payout in case of total loss.'],faq:[{q:'What is IDV in car insurance?',a:'Insured Declared Value — the current market value of your car after depreciation, which forms the basis for your premium and maximum claim payout.'}],
    content:{
      intro:'Car insurance premiums in India are built from a few specific, calculable components — the Insured Declared Value (IDV), an Own Damage premium based on that IDV, a flat third-party premium, and a No-Claim Bonus discount. This calculator breaks down each piece so you can see exactly what is driving your estimated premium.',
      howItWorks:[
        {title:'How IDV is calculated', body:'IDV is your car\'s current market value after depreciation, following a schedule set by IRDAI guidelines — roughly 10% depreciation per year, capped at 60% for older vehicles. A higher IDV means a higher premium, but also a higher payout in case of total loss or theft.'},
        {title:'Own Damage premium and city tier', body:'The Own Damage premium is calculated as a percentage of IDV, with metro cities typically carrying a slightly higher rate than tier-2 or tier-3 cities, reflecting generally higher claim frequency and repair costs in larger cities.'},
        {title:'No-Claim Bonus — and why it follows you, not your car', body:'NCB increases by 5 percentage points for each claim-free year, up to a maximum of 50%, and importantly transfers with you to a new vehicle if you switch cars without filing a claim — it is tied to your claims history, not the specific car insured.'},
      ],
      formula:{ label:'Net premium', expr:'Net Premium = (IDV × OD rate + third-party premium) × (1 − NCB%)' },
      examples:[
        { title:'Example — 2-year-old car, metro, 20% NCB', scenario:'Car value ₹8,00,000, 2 years old, metro city, 20% No-Claim Bonus.', result:'IDV ≈₹6.4 lakh, OD premium ≈₹22,400, gross premium ≈₹24,494, NCB discount ≈₹4,899, net premium ≈₹19,595/year' },
        { title:'Example — same car, higher NCB', scenario:'Same car and city, but 50% NCB (maximum, after 5 claim-free years).', result:'Net premium drops further as the higher NCB discount applies to the same gross premium base — illustrating the real value of maintaining a claims-free record' },
      ],
      useCases:[
        { title:'Choosing the right IDV when renewing', body:'Insurers sometimes offer to set IDV below the standard depreciation schedule to reduce your premium — but this also reduces your payout in a total-loss claim, so weigh the premium saving against the reduced protection carefully.'},
        { title:'Protecting your No-Claim Bonus', body:'For minor damage where the repair cost is close to or below your NCB discount value, paying out of pocket and preserving your claims-free record is often more economical than filing a claim and losing accumulated NCB.'},
        { title:'Transferring NCB when buying a new car', body:'When you sell your current car and buy a new one, your accumulated NCB transfers to the new policy — make sure your insurer issues an NCB retention certificate when you sell to avoid losing this benefit.'},
      ],
    },
  },

  // Health — Body & Weight
  { slug:'waist-hip-ratio',category:'health',group:'Body & Weight',icon:'📏',title:'Waist-to-Hip Ratio Calculator',short:'Waist-Hip Ratio',desc:'Calculate your waist-to-hip ratio and WHO cardiovascular risk category.',metaDesc:'Free waist-to-hip ratio calculator. Find your WHR and cardiovascular risk category.',tags:['waist hip ratio','whr','body shape'],tips:['Measure both waist and hip at the same time of day for consistency, ideally first thing in the morning before eating.'],faq:[{q:'What is a healthy waist-to-hip ratio?',a:'WHO considers below 0.90 (men) or 0.80 (women) as lower risk, with risk increasing above these thresholds.'}],
    content:{
      intro:'Waist-to-hip ratio captures something BMI and even total body fat percentage miss entirely: where on your body fat is actually distributed. Fat stored around the abdomen carries meaningfully higher cardiovascular risk than the same amount of fat stored around the hips and thighs, even at an identical total body weight.',
      howItWorks:[
        {title:'Why distribution matters more than total amount', body:'Abdominal ("visceral") fat surrounds internal organs and is more metabolically active in ways linked to insulin resistance and cardiovascular disease, compared to fat stored subcutaneously around the hips and thighs — two people with the same body fat percentage can carry very different cardiovascular risk depending on this distribution.'},
        {title:'WHO risk thresholds', body:'The World Health Organization considers a ratio below 0.90 for men and below 0.80 for women as lower risk, with risk increasing as the ratio rises above these thresholds.'},
        {title:'Why measurement consistency matters', body:'Measure both waist (at the navel) and hip (at the widest point) at the same time of day, ideally first thing in the morning before eating, since both measurements can shift slightly throughout the day.'},
      ],
      formula:{ label:'Waist-to-hip ratio', expr:'WHR = waist circumference ÷ hip circumference' },
      examples:[
        { title:'Example — male, waist 85cm, hip 100cm', scenario:'A man with an 85cm waist and 100cm hip measurement.', result:'WHR = 0.85, classified as low risk (below the 0.90 male threshold)' },
        { title:'Example — same waist, smaller hip', scenario:'Same 85cm waist, but hip measurement of 88cm instead.', result:'WHR = 0.97, now classified as moderate to high risk — illustrating how hip measurement, not just waist size, changes the risk category' },
      ],
      useCases:[
        { title:'A useful companion to BMI, not a replacement', body:'WHR adds information BMI cannot capture at all — use both together for a more complete picture, since a normal BMI with a high WHR ("apple shape") still carries elevated cardiovascular risk.'},
        { title:'Tracking changes during a fat loss program', body:'WHR can reveal whether fat loss is coming disproportionately from the higher-risk abdominal area or more evenly across the body — a useful additional metric alongside weight and body fat percentage.'},
        { title:'Understanding personal risk beyond the scale', body:'Two people at the same weight and height can have meaningfully different cardiovascular risk profiles based on fat distribution alone — WHR makes this difference visible.'},
      ],
    },
  },
  { slug:'pregnancy-weight-gain',category:'health',group:'Body & Weight',icon:'🤰',title:'Pregnancy Weight Gain Calculator',short:'Pregnancy Weight Gain',desc:'See your expected weight gain by week of pregnancy based on IOM guidelines.',metaDesc:'Free pregnancy weight gain calculator. Track expected gain by week based on your pre-pregnancy BMI.',tags:['pregnancy weight','iom guidelines'],tips:['These ranges are guidelines, not strict targets — always discuss your specific situation with your doctor, especially with multiples or other complications.'],faq:[{q:'How much weight should I gain during pregnancy?',a:'It depends on your pre-pregnancy BMI — IOM guidelines suggest roughly 11.5-16kg for a normal starting BMI, with different ranges for underweight, overweight, or obese starting points.'}],
    content:{
      intro:'Healthy pregnancy weight gain is not a single universal number — it depends substantially on your pre-pregnancy BMI, following guidelines from the Institute of Medicine (IOM). This calculator shows both the recommended total range for the full pregnancy and a projected gain so far based on current week of gestation.',
      howItWorks:[
        {title:'Why pre-pregnancy BMI changes the target range', body:'Someone starting pregnancy underweight is recommended to gain more (12.5–18kg) than someone starting at a higher BMI (5–9kg for an obese starting BMI), since the goal is a healthy outcome for both parent and baby, not a single fixed target.'},
        {title:'Why gain is not linear throughout pregnancy', body:'The first trimester typically involves comparatively little weight gain (around 1–2kg total), with the majority of the recommended gain occurring more steadily through the second and third trimesters — this calculator models that uneven distribution rather than assuming a flat weekly rate.'},
        {title:'These are guidelines, not strict individual targets', body:'IOM ranges are population-level guidelines. Multiples (twins or more), pre-existing conditions, and individual circumstances can reasonably shift the appropriate target — always discuss your specific situation with your doctor rather than treating this calculator as a strict requirement.'},
      ],
      formula:{ label:'IOM total gain ranges by pre-pregnancy BMI', expr:'Underweight: 12.5–18kg · Normal: 11.5–16kg · Overweight: 7–11.5kg · Obese: 5–9kg' },
      examples:[
        { title:'Example — normal BMI, week 20', scenario:'Pre-pregnancy BMI of 23 (normal range), currently at 20 weeks gestation.', result:'Total recommended range for full pregnancy: 11.5–16kg. Projected gain so far at week 20: approximately 4.1–5.3kg' },
        { title:'Comparing to a different starting BMI', scenario:'Same 20-week point, but pre-pregnancy BMI of 32 (obese range) instead.', result:'Total recommended range drops to 5–9kg — illustrating how much pre-pregnancy BMI shifts the appropriate target' },
      ],
      useCases:[
        { title:'Tracking progress against a personalised range rather than a generic number', body:'Comparing your actual weekly weigh-ins against the projected range for your specific BMI category gives more useful context than a single flat target shared across all pregnancies.'},
        { title:'Discussing concerns with your doctor using concrete numbers', body:'If your actual gain is tracking meaningfully outside the projected range, having the specific numbers in hand makes for a more productive conversation with your healthcare provider.'},
        { title:'Understanding why "eating for two" oversimplifies real needs', body:'Caloric needs increase only modestly during pregnancy, particularly in the first trimester — the recommended weight gain ranges reflect this more nuanced reality rather than supporting a dramatic increase in intake from day one.'},
      ],
    },
  },

  // Health — Nutrition
  { slug:'protein-intake',category:'health',group:'Nutrition',icon:'🥚',title:'Protein Intake Calculator',short:'Protein Intake',desc:'Find your daily protein target based on body weight, activity level, and goal.',metaDesc:'Free protein intake calculator. Find your daily protein target in grams based on activity and goals.',tags:['protein intake','protein target'],tips:['Spread protein intake across 3-4 meals rather than one large serving — this supports better muscle protein synthesis throughout the day.'],faq:[{q:'How much protein do I need per day?',a:'It depends on activity level and goals — roughly 0.8-1g/kg for sedentary individuals, up to 1.6-2.4g/kg for very active people or those building muscle.'}],
    content:{
      intro:'Protein needs vary considerably based on activity level and goal, far more than the flat 0.8g/kg RDA figure suggests — that number represents the minimum to avoid deficiency in a sedentary population, not the optimal intake for anyone training regularly. This calculator gives an activity- and goal-specific range instead.',
      howItWorks:[
        {title:'Why activity level changes the range so much', body:'Sedentary individuals need only enough protein to prevent deficiency (0.8–1.0 g/kg), while active individuals and athletes benefit from substantially more (1.6–2.4 g/kg) to support muscle repair and adaptation from regular training.'},
        {title:'Why goal adds a further adjustment on top of activity level', body:'A fat-loss goal shifts the range upward by roughly 0.2 g/kg, since higher protein intake helps preserve muscle mass during a calorie deficit. A muscle-building goal shifts the upper end of the range higher as well, to support the additional protein synthesis muscle growth requires.'},
        {title:'Why this differs slightly from the Macro Calculator', body:'This calculator gives a protein target in grams per kilogram of bodyweight directly, independent of total calorie intake — useful when protein itself is your primary focus, rather than working from an overall macro percentage split.'},
      ],
      formula:{ label:'Protein target', expr:'Grams/day = bodyweight (kg) × g/kg range (by activity level and goal)' },
      examples:[
        { title:'Example — active, building muscle, 70kg', scenario:'70kg person, active training level, goal of building muscle.', result:'Target range: approximately 112–154 grams of protein per day' },
        { title:'Example — sedentary, maintaining', scenario:'Same 70kg bodyweight, but sedentary activity level and a maintenance goal.', result:'Target range drops to approximately 56–70 grams per day — illustrating how much activity level alone shifts the requirement' },
      ],
      useCases:[
        { title:'Setting a concrete daily target rather than guessing', body:'Many people underestimate their actual protein needs, particularly if they are training regularly — having a specific gram range removes the guesswork.'},
        { title:'Spreading intake across the day', body:'Distributing your daily target across 3–4 meals tends to support muscle protein synthesis more effectively than concentrating it into one or two large servings.'},
        { title:'Adjusting as your goal changes', body:'Recalculate when shifting between a fat-loss phase and a muscle-building phase, since the appropriate range genuinely shifts with the goal, not just bodyweight.'},
      ],
    },
  },
  { slug:'fiber-intake',category:'health',group:'Nutrition',icon:'🌾',title:'Fiber Intake Calculator',short:'Fiber Intake',desc:'Find your recommended daily fiber intake and see how your current diet compares.',metaDesc:'Free fiber intake calculator. Find your daily fiber target by age and sex.',tags:['fiber intake','dietary fiber'],tips:['Increase fiber intake gradually over a few weeks, with plenty of water, to avoid digestive discomfort.'],faq:[{q:'How much fiber should I eat per day?',a:'Generally 25-38g/day depending on age and sex — most adults eat noticeably less than this.'}],
    content:{
      intro:'Dietary fibre is one of the few nutrients where the gap between recommended and actual intake is both large and well-documented — most adults eat noticeably less than the target. This calculator shows your personal RDA by age and sex, plus the specific gap between your current intake and that target.',
      howItWorks:[
        {title:'Why the RDA differs by age and sex', body:'Recommended fibre intake is generally higher for younger adults and for men compared to women, reflecting differences in typical calorie needs — the RDA roughly tracks overall energy intake, since fibre recommendations are partly calorie-scaled.'},
        {title:'The strength of the evidence behind fibre specifically', body:'A 2019 systematic review and meta-analysis published in The Lancet, covering 185 studies, found that intake in the 25–29g range was associated with meaningfully lower all-cause mortality and lower rates of several major diseases compared to under 15g per day.'},
        {title:'Why the gap matters more than the absolute target', body:'Knowing your specific gap, not just the RDA, gives a concrete, actionable number — closing a 10g gap is a more tangible goal than simply "eat more fibre."'},
      ],
      formula:{ label:'Fiber RDA', expr:'Men: 38g (≤50yrs) or 30g (50+) · Women: 25g (≤50yrs) or 21g (50+)' },
      examples:[
        { title:'Example — woman, 35, currently eating 15g/day', scenario:'35-year-old woman, current intake 15g/day.', result:'RDA = 25g, gap = 10g, currently at 60% of target' },
        { title:'Closing the gap with concrete food choices', scenario:'Same person adding roughly one cup of cooked lentils (around 8g fibre) and a serving of oats (around 4g fibre) to her daily diet.', result:'This combination alone would close most of the 10g gap identified above' },
      ],
      useCases:[
        { title:'Identifying a specific, achievable target rather than a vague goal', body:'A precise gram gap is more actionable than a general intention to "eat healthier" — use the gap figure to choose specific foods that close it.'},
        { title:'Increasing fibre gradually to avoid digestive discomfort', body:'Raising fibre intake too quickly causes bloating and gas — increasing by roughly 5g per week, with adequate water intake, allows gut bacteria to adjust gradually.'},
        { title:'Tracking progress over time as diet changes', body:'Recalculate periodically as your diet shifts, since the gap should narrow as fibre-rich foods become a more regular part of your meals.'},
      ],
    },
  },

  // Health — Fitness
  { slug:'vo2max',category:'health',group:'Fitness',icon:'🫁',title:'VO2 Max Calculator',short:'VO2 Max',desc:'Estimate your VO2 max (aerobic fitness) without a treadmill test, using a validated non-exercise formula.',metaDesc:'Free VO2 max calculator. Estimate your aerobic fitness level without a lab test.',tags:['vo2 max','aerobic fitness','cardio fitness'],tips:['VO2 max naturally declines with age, but regular cardiovascular training can significantly slow this decline.'],faq:[{q:'What is a good VO2 max?',a:'It varies by age and sex, but generally above 45-50 mL/kg/min is considered good to excellent for most adults.'}],
    content:{
      intro:'VO2 max — the maximum rate at which your body can use oxygen during intense exercise — is one of the most respected single measures of cardiovascular fitness, but lab-testing it requires a treadmill or cycle ergometer with metabolic gas analysis. This calculator uses a validated non-exercise regression model to estimate it from age, body composition, sex, and self-reported activity level alone.',
      howItWorks:[
        {title:'The Jackson et al. (1990) non-exercise model', body:'This calculator uses a peer-reviewed regression formula that estimates VO2 max from age, BMI, sex, and a self-reported activity scale, developed specifically as an alternative to direct exercise testing — useful when treadmill or lab access is not available.'},
        {title:'Why BMI is used instead of simply weight', body:'The formula incorporates BMI rather than raw weight because body composition relative to height carries more information about cardiovascular fitness capacity than weight alone.'},
        {title:'Why this is an estimate, not a lab measurement', body:'Non-exercise models like this one are reasonably accurate at a population level but carry more individual variation than an actual graded exercise test — treat the result as a useful estimate and fitness-tracking tool, not a clinical-grade measurement.'},
      ],
      formula:{ label:'Jackson et al. (1990) regression', expr:'VO2max = 56.363 + 1.921×activity − 0.381×age − 0.754×BMI + 10.987×(1 if male, else 0)' },
      examples:[
        { title:'Example — 30-year-old male', scenario:'Age 30, 75kg, 178cm, activity index 4 (moderately active) out of 7.', result:'Estimated VO2 max ≈45.8 mL/kg/min, BMI ≈23.7, classified as "Good"' },
        { title:'Example — same person, 10 years later, same activity level', scenario:'Same height, weight, and activity level, but now age 40.', result:'Estimated VO2 max drops by roughly 3.8 points purely from the age term — illustrating the expected natural decline absent any change in training' },
      ],
      useCases:[
        { title:'Tracking aerobic fitness trends over time without lab access', body:'Recalculate every few months as training progresses — while the absolute number carries some uncertainty, the trend direction (improving or declining) is a useful signal of changing cardiovascular fitness.'},
        { title:'Understanding category benchmarks for your age and sex', body:'VO2 max categories (poor through excellent) are typically defined relative to age and sex norms, since natural fitness capacity differs across these groups — compare your result against appropriate benchmarks, not a single universal number.'},
        { title:'Motivating training changes', body:'Since regular cardiovascular training can meaningfully slow the natural age-related decline in VO2 max, tracking this estimate over time can help illustrate the real impact of consistent training versus a sedentary lifestyle.'},
      ],
    },
  },
  { slug:'pace',category:'health',group:'Fitness',icon:'🏃',title:'Running Pace Calculator',short:'Running Pace',desc:'Calculate the pace per km/mile needed to hit your goal race finish time, with a full splits table.',metaDesc:'Free running pace calculator. Find your required pace for any race distance and goal time.',tags:['running pace','race pace','marathon pace'],tips:['Consider a slightly conservative start with a faster back half ("negative split") rather than starting exactly at goal pace.'],faq:[{q:'What pace do I need for a sub-2-hour half marathon?',a:'Roughly 5:41 per km (9:09 per mile) — use this calculator for your exact distance and goal time.'}],
    content:{
      intro:'Knowing your overall goal finish time is not the same as knowing what pace to actually run at, kilometre by kilometre, during the race itself. This calculator converts a goal time into a required per-km and per-mile pace, plus a full splits table showing the target time at each kilometre marker.',
      howItWorks:[
        {title:'Converting total time into pace', body:'This calculator divides your total goal time by the race distance to find the average pace needed per kilometre and per mile, then generates a full splits table projecting the target cumulative time at every kilometre of the race.'},
        {title:'Why even pacing is usually the safer default strategy', body:'While the splits table shows an even pace throughout, many experienced runners deliberately target a slightly slower first half and a faster second half (a "negative split"), since starting conservatively reduces the risk of an unsustainable early pace causing a significant slowdown later in the race.'},
        {title:'Using splits during the actual race', body:'Checking your watch against the projected split at each kilometre marker tells you in real time whether you are on pace, ahead, or falling behind — far more actionable mid-race than only knowing your overall goal time.'},
      ],
      formula:{ label:'Pace per kilometre', expr:'Pace (sec/km) = total goal time (seconds) ÷ distance (km)' },
      examples:[
        { title:'Example — 10K in 50 minutes', scenario:'Goal: complete a 10km race in exactly 50:00.', result:'Required pace = 5:00 per km — the splits table would show 5:00, 10:00, 15:00 and so on at each kilometre marker' },
        { title:'Example — half marathon sub-2-hour goal', scenario:'Goal: complete a 21.1km half marathon in under 2 hours.', result:'Required pace ≈5:41 per km (about 9:09 per mile)' },
      ],
      useCases:[
        { title:'Planning race-day pacing strategy in advance', body:'Knowing the exact target pace before race day, rather than figuring it out mid-race, removes a major source of pacing error that commonly derails an otherwise well-prepared race.'},
        { title:'Structuring training runs around race pace', body:'Practicing specific training runs at your calculated goal pace builds familiarity with exactly how that effort level feels, which is more useful preparation than only running at a comfortable, untracked pace.'},
        { title:'Adjusting goals realistically based on training paces', body:'If your typical training pace is meaningfully slower than the pace this calculator shows for your stated goal, that gap is useful information for setting a more realistic target time.'},
      ],
    },
  },
  { slug:'one-rep-max-plates',category:'health',group:'Fitness',icon:'🏋️',title:'Plate Calculator',short:'Plate Calculator',desc:'Figure out exactly which plates to load on the bar to hit your target weight.',metaDesc:'Free barbell plate calculator. Find which plates to load for any target weight.',tags:['plate calculator','barbell loading'],tips:['Always load plates symmetrically and use collars to keep them secure, especially as weight increases.'],faq:[{q:'What plates does a standard gym usually have?',a:'Most commercial gyms stock 25, 20, 15, 10, 5, 2.5, and 1.25kg plates per side, on a 20kg Olympic bar.'}],
    content:{
      intro:'Quickly figuring out which plates to load for a specific target weight is a small but genuinely useful calculation, especially under time pressure between sets. This calculator works out the exact combination of standard plates needed per side to hit your target as closely as possible.',
      howItWorks:[
        {title:'The greedy plate-selection approach', body:'This calculator works through available plates from largest to smallest, using as many of the largest plate as fit, then moving to the next size down, repeating until the target weight per side is reached or the closest achievable combination is found.'},
        {title:'Why the bar weight matters', body:'A standard Olympic barbell weighs 20kg — this is subtracted from your target total before calculating per-side plate weight, since the bar itself already contributes that weight before any plates are added.'},
        {title:'When the exact target cannot be hit precisely', body:'Standard plate increments (down to 1.25kg) cannot always hit every possible target weight exactly — this calculator shows the closest achievable total and the small remainder, if any, so you know precisely what you are actually lifting.'},
      ],
      formula:{ label:'Plates needed per side', expr:'Per side weight = (target weight − bar weight) ÷ 2', note:'Then greedily filled using standard plate sizes: 25, 20, 15, 10, 5, 2.5, 1.25kg' },
      examples:[
        { title:'Example — 100kg target, 20kg bar', scenario:'Target total of 100kg using a standard 20kg Olympic bar.', result:'Per side weight needed = 40kg, achieved using one 25kg plate and one 15kg plate per side' },
        { title:'Example — a weight that does not divide evenly', scenario:'A target of 101kg instead, same 20kg bar.', result:'Per side weight needed = 40.5kg — the calculator finds the closest achievable combination and shows any small remainder' },
      ],
      useCases:[
        { title:'Quickly loading the bar for a new target weight', body:'Rather than mentally calculating plate combinations under time pressure between sets, this gives an instant, exact answer.'},
        { title:'Planning a progressive overload sequence', body:'Calculating plate combinations for a series of planned weight increases ahead of a session helps you set up the right plates in advance.'},
        { title:'Working with a gym that has a different plate set', body:'If your gym does not stock every standard plate size, the closest achievable combination shown here helps you adapt your target slightly to what is actually available.'},
      ],
    },
  },

  // Health — Life
  { slug:'ovulation',category:'health',group:'Life',icon:'🌸',title:'Ovulation Calculator',short:'Ovulation Calculator',desc:'Estimate your ovulation day and fertile window from your last period and cycle length.',metaDesc:'Free ovulation calculator. Find your estimated fertile window and next period date.',tags:['ovulation','fertile window','cycle tracker'],tips:['Cycle length and ovulation timing can vary month to month — tracking basal body temperature or using an ovulation predictor kit gives a more precise read for your specific cycle.'],faq:[{q:'How is ovulation day calculated?',a:"It's estimated as cycle length minus 14 days from the first day of your last period, since the luteal phase (after ovulation) is consistently about 14 days for most people."}],
    content:{
      intro:'Ovulation timing is estimated by working backward from cycle length, based on the relatively consistent length of the luteal phase (the time between ovulation and the next period) across most people, regardless of overall cycle length. This calculator estimates ovulation day, the fertile window, and the next expected period date from your last period and typical cycle length.',
      howItWorks:[
        {title:'Why the luteal phase, not the follicular phase, is the stable part of the cycle', body:'The luteal phase (after ovulation, before the next period) is consistently around 14 days for most people, while the follicular phase (before ovulation) varies more between individuals and cycles. This is why ovulation is estimated by counting backward 14 days from the next expected period, rather than forward from the last period.'},
        {title:'The fertile window', body:'This calculator estimates a fertile window beginning roughly 5 days before ovulation and extending 1 day after, since sperm can survive several days in the reproductive tract while the egg itself remains viable for a much shorter window after release.'},
        {title:'Why actual timing varies month to month', body:'Even with a generally regular cycle, ovulation timing can shift by a few days from one cycle to the next due to stress, illness, or other factors — this estimate is a planning tool, not a guaranteed prediction.'},
      ],
      formula:{ label:'Estimated ovulation day', expr:'Ovulation day = cycle length − 14 days (counted from the first day of the last period)' },
      examples:[
        { title:'Example — 28-day cycle', scenario:'Last period started 1 June, average cycle length 28 days.', result:'Estimated ovulation: 15 June. Fertile window: 10–16 June. Next expected period: 29 June' },
        { title:'Example — longer cycle', scenario:'Same last period date, but a 32-day average cycle instead.', result:'Estimated ovulation shifts later to around 19 June, since a longer cycle generally means a longer follicular phase before ovulation, not a longer luteal phase' },
      ],
      useCases:[
        { title:'Planning around a fertile window', body:'Whether trying to conceive or avoid conception, knowing the estimated fertile window provides a useful planning reference, though it should not be relied on as a sole method given natural month-to-month variation.'},
        { title:'Improving accuracy with additional tracking methods', body:'Basal body temperature tracking or ovulation predictor kits can confirm ovulation more precisely for your specific cycle than a calendar estimate alone, particularly useful if your cycle length varies noticeably month to month.'},
        { title:'Tracking cycle length trends over several months', body:'Recording actual cycle length over 3–6 months, rather than relying on a single assumed average, improves the accuracy of this estimate considerably for irregular cycles.'},
      ],
    },
  },
  // ── New calculators (60 → 75 expansion) ────────────
  { slug:'apy', category:'finance', group:'Grow Money',
    icon:'📈', title:'APY Calculator',short:'APY',
    desc:'Convert APR to Annual Percentage Yield for any compounding frequency.',
    metaDesc:'Free APY calculator. Convert APR to APY for daily, monthly, quarterly compounding.',
    tags:['apy','apr','compounding','savings'],
    tips:['APY is always higher than APR due to compounding.','Compare APY not APR when choosing savings accounts.'],
    faq:[{q:'What is APY?',a:'Annual Percentage Yield — the real return including compound interest.'}] },

  { slug:'cagr', category:'finance', group:'Grow Money',
    icon:'📊', title:'CAGR Calculator',short:'CAGR',
    desc:'Calculate Compound Annual Growth Rate of any investment.',
    metaDesc:'Free CAGR calculator. Find the annual growth rate of any investment.',
    tags:['cagr','growth rate','investment returns'],
    tips:['Mutual fund returns are always shown as CAGR.','Compare CAGR not absolute returns.'],
    faq:[{q:'What is CAGR?',a:'Compound Annual Growth Rate — the steady annual rate at which an investment grew.'}] },

  { slug:'future-value', category:'finance', group:'Grow Money',
    icon:'🔮', title:'Future Value Calculator',short:'Future Value',
    desc:'Calculate the future value of a lump sum with or without regular contributions.',
    metaDesc:'Free future value calculator. Lump sum and annuity future value.',
    tags:['future value','fv','investment'],
    tips:['Future value grows exponentially with time.','Start early — time is more powerful than rate.'],
    faq:[{q:'What is future value?',a:'The value of a current asset at a future date based on an assumed growth rate.'}] },

  { slug:'irr', category:'finance', group:'Grow Money',
    icon:'📉', title:'IRR Calculator',short:'IRR',
    desc:'Calculate Internal Rate of Return for investments with irregular cashflows.',
    metaDesc:'Free IRR calculator. Internal rate of return for any investment or business.',
    tags:['irr','internal rate of return','investment analysis'],
    tips:['IRR above 12% generally beats market returns.','Compare IRR to your opportunity cost.'],
    faq:[{q:'What is IRR?',a:'The discount rate that makes NPV of all cashflows equal to zero. Higher is better.'}] },

  { slug:'credit-card', category:'finance', group:'Borrow Money',
    icon:'💳', title:'Credit Card Payoff',short:'Credit Card',
    desc:'See how long to pay off your credit card and how much interest you will pay.',
    metaDesc:'Free credit card payoff calculator. Minimum payment vs fixed payment comparison.',
    tags:['credit card','payoff','interest','debt'],
    tips:['Indian credit cards charge 36-42% APR.','Minimum payments can take years to clear a balance.'],
    faq:[{q:'Why does minimum payment take so long?',a:'Most minimum payment goes to interest, barely reducing the principal.'}],
    interpretation:'The "years to pay off at minimum payment" number is usually the most important figure on this page — if it shows 10+ years for a balance you could clear much faster, that gap is exactly what a fixed higher payment fixes. Compare minimum-payment-only against a realistic fixed payment before deciding what you can actually afford each month.',
    commonMistakes:[{mistake:'Paying only the minimum every month without realizing how much goes to interest.',fix:'At 36-42% APR, the minimum payment on a large balance can be mostly interest for months or years. Even ₹1,000-2,000 extra per month can cut years off the payoff time.'},{mistake:'Making a large purchase on the card while still carrying a balance.',fix:'New purchases usually start accruing interest immediately when a balance is already carried (no grace period) — check your card\'s terms, since this is a common way balances spiral rather than shrink.'},{mistake:'Not comparing the card\'s APR to a personal loan or balance transfer option.',fix:'Personal loan rates (10-24%) are typically far below credit card APR (36-42%). For large balances, transferring the debt to a lower-rate personal loan is often worth the one-time hassle.'}] },

  { slug:'mortgage-refinance', category:'finance', group:'Borrow Money',
    icon:'🔄', title:'Mortgage Refinance',short:'Refinance',
    desc:'Should you refinance? Calculate break-even and total savings.',
    metaDesc:'Free mortgage refinance calculator. Break-even and savings from refinancing.',
    tags:['refinance','home loan','mortgage'],
    tips:['Refinancing makes sense if break-even is under 2 years.','Even 0.5% rate reduction can save lakhs.'],
    faq:[{q:'When should I refinance?',a:'When the new rate saves enough to recover closing costs within 2 years.'}] },

  { slug:'pay-raise', category:'finance', group:'Tools',
    icon:'💰', title:'Pay Raise Calculator',short:'Pay Raise',
    desc:'Calculate the impact of a pay raise on annual, monthly, and hourly earnings.',
    metaDesc:'Free pay raise calculator. See impact of salary increase on all pay periods.',
    tags:['pay raise','salary increase','compensation'],
    tips:['Negotiate for at least cost of living + performance: 8-15%.','Always negotiate — most offers have room.'],
    faq:[{q:'What is a good pay raise?',a:'6-8% covers inflation. 10-15% is a meaningful increase. 20%+ is excellent.'}] },

  { slug:'salary-hourly', category:'finance', group:'Tools',
    icon:'⏰', title:'Salary to Hourly',short:'Salary/Hourly',
    desc:'Convert between annual, monthly, weekly, daily and hourly salary.',
    metaDesc:'Free salary to hourly calculator. Convert any salary to hourly rate.',
    tags:['salary','hourly','wage','conversion'],
    tips:['Knowing your hourly rate helps value your time.','Freelancers: charge 2-3x employee hourly rate.'],
    faq:[{q:'How to convert annual salary to hourly?',a:'Divide annual salary by (hours per week × 52 weeks).'}] },

  { slug:'stock-average', category:'finance', group:'Grow Money',
    icon:'📈', title:'Stock Average Calculator',short:'Stock Average',
    desc:'Calculate average cost basis when buying stocks at different prices.',
    metaDesc:'Free stock average calculator. Average down or up cost basis calculator.',
    tags:['stock average','cost basis','averaging'],
    tips:['Averaging down only makes sense in fundamentally strong stocks.','Track cost basis for accurate P&L calculation.'],
    faq:[{q:'What is average cost basis?',a:'The average price paid per share across all purchases, used to calculate profit or loss.'}] },

  { slug:'margin', category:'finance', group:'Tools',
    icon:'📊', title:'Margin Calculator',short:'Margin',
    desc:'Calculate gross profit margin, markup percentage, and break-even price.',
    metaDesc:'Free margin calculator. Gross margin, markup, and profit percentage.',
    tags:['margin','markup','profit','business'],
    tips:['Margin and markup are different — do not confuse them.','Gross margin 50%+ is typically healthy for services.'],
    faq:[{q:'Difference between margin and markup?',a:'Margin is profit/revenue. Markup is profit/cost. A 50% markup gives only 33% margin.'}] },

  { slug:'cash-back', category:'finance', group:'Grow Money',
    icon:'💵', title:'Cash Back Calculator',short:'Cash Back',
    desc:'Compare credit cards to find which earns most cashback on your spending.',
    metaDesc:'Free cashback calculator. Compare credit card rewards on your spending.',
    tags:['cashback','credit card','rewards'],
    tips:['Net cashback = gross rewards minus annual fee.','Category cards beat flat-rate cards if you spend in those categories.'],
    faq:[{q:'How to maximise cashback?',a:'Use category cards for top spending areas and a flat-rate card for everything else.'}] },

  { slug:'overtime', category:'finance', group:'Tools',
    icon:'⏱️', title:'Overtime Calculator',short:'Overtime',
    desc:'Calculate overtime pay at 1.25×, 1.5×, or 2× rate and annual earnings.',
    metaDesc:'Free overtime calculator. Time and a half, double time pay calculation.',
    tags:['overtime','time and a half','pay'],
    tips:['In India, overtime is typically 2× the regular rate under Factories Act.','Overtime income should not be relied upon for regular expenses.'],
    faq:[{q:'What is standard overtime rate in India?',a:'Under the Factories Act, overtime is paid at twice the ordinary rate of wages.'}] },

  { slug:'interest-rate', category:'finance', group:'Grow Money',
    icon:'🎯', title:'Interest Rate Calculator',short:'Interest Rate',
    desc:'Find what interest rate you need to reach your financial goal.',
    metaDesc:'Free interest rate calculator. Find required return to reach any goal.',
    tags:['interest rate','required return','goal'],
    tips:['The Rule of 72: divide 72 by rate to find doubling time.','Higher required return = higher risk needed.'],
    faq:[{q:'What return is realistic?',a:'FD: 7%, Debt funds: 7-8%, Balanced: 9-10%, Equity: 11-13% over long term.'}] },

  { slug:'loan-payoff', category:'finance', group:'Borrow Money',
    icon:'🎯', title:'Loan Payoff Calculator',short:'Loan Payoff',
    desc:'Compare strategies to pay off a loan faster and save on interest.',
    metaDesc:'Free loan payoff calculator. Extra payment strategies and interest savings.',
    tags:['loan payoff','extra payment','debt free'],
    tips:['Extra ₹5,000/month on a 20-year loan can cut 5-7 years.','Apply windfalls and bonuses directly to principal.'],
    faq:[{q:'How to pay off loan faster?',a:'Pay extra towards principal, make bi-weekly instead of monthly payments, or apply lump sums.'}] },
];

export const getBySlug     = (slug: string) => CALCULATORS.find(c => c.slug === slug) ?? null;
export const getAllSlugs   = () => CALCULATORS.map(c => ({ category: c.category, slug: c.slug }));
export const getRelated    = (slug: string, cat: Category) => {
  const current    = CALCULATORS.find(c => c.slug === slug);
  const candidates = CALCULATORS.filter(c => c.slug !== slug && c.category === cat);
  if (!current) return candidates.slice(0, 8);
  return candidates
    .map(c => ({ calc: c, score: c.tags.filter(t => current.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .map(s => s.calc)
    .slice(0, 8);
};
export const getAll        = () => CALCULATORS;
export const getByCategory = (cat: Category) => CALCULATORS.filter(c => c.category === cat);
export const getPopular    = () => CALCULATORS.filter(c => c.popular);

export const getGroups     = (cat: Category): Record<string, Calculator[]> => {
  const out: Record<string, Calculator[]> = {};
  CALCULATORS.filter(c => c.category === cat).forEach(c => {
    if (!out[c.group]) out[c.group] = [];
    out[c.group].push(c);
  });
  return out;
};

// Merged app aliases
export { CALCULATORS as TOOLS };
export { getByCategory as getToolsByCategory };
