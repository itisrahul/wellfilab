'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getPlanAny } from '@/lib/plans';
import { getLatestScore } from '@/lib/scoreStorage';
import { saveOnboarding, type PlanKind } from '@/lib/onboardingStorage';

// ── Step schema ─────────────────────────────────────────────────────────
interface StepOption { emoji: string; label: string; value: string; }
interface DetailField {
  key: string; label: string; type: 'number' | 'text' | 'textarea' | 'select';
  placeholder?: string; options?: string[]; required?: boolean;
}
interface Step {
  key: string;
  label: string;       // short label used in the compiled email, e.g. "Main goal"
  question: string;
  section?: string;
  type: 'single' | 'multi' | 'details';
  options?: StepOption[];
  otherText?: boolean;  // multi-select steps get a free-text "anything else" field
  fields?: DetailField[];
}

const DIET_STEPS: Step[] = [
  {
    key: 'goal', label: 'Main goal', type: 'single',
    question: 'What is your main goal?',
    options: [
      { emoji: '🎯', label: 'Lose weight and feel lighter', value: 'Lose weight and feel lighter' },
      { emoji: '💪', label: 'Build strength and muscle', value: 'Build strength and muscle' },
      { emoji: '🥦', label: 'Eat healthier and have more energy', value: 'Eat healthier and have more energy' },
      { emoji: '🏥', label: 'Manage a health condition through diet', value: 'Manage a health condition through diet' },
    ],
  },
  {
    key: 'restrictions', label: 'Restrictions', type: 'multi',
    question: 'Do you have any dietary restrictions?',
    otherText: true,
    options: [
      { emoji: '✅', label: 'None — I eat everything', value: 'None' },
      { emoji: '🌱', label: 'Vegetarian', value: 'Vegetarian' },
      { emoji: '🌿', label: 'Vegan', value: 'Vegan' },
      { emoji: '🚫', label: 'Gluten free or dairy free', value: 'Gluten free or dairy free' },
    ],
  },
  {
    key: 'cookTime', label: 'Cook time', type: 'single',
    question: 'How much time can you cook per day?',
    options: [
      { emoji: '⚡', label: '15 minutes — I need very quick meals', value: '15 minutes' },
      { emoji: '🕐', label: "30 minutes — I can cook if it's simple", value: '30 minutes' },
      { emoji: '🍳', label: '45 minutes — I enjoy cooking sometimes', value: '45 minutes' },
      { emoji: '👨‍🍳', label: '1 hour+ — I like spending time cooking', value: '1 hour+' },
    ],
  },
  {
    key: 'cookingFor', label: 'Cooking for', type: 'single',
    question: 'Who are you cooking for?',
    options: [
      { emoji: '👤', label: 'Just me', value: 'Just me' },
      { emoji: '👫', label: 'Me and my partner', value: 'Me and my partner' },
      { emoji: '👨‍👩‍👧', label: 'Family with children', value: 'Family with children' },
      { emoji: '🏠', label: 'Shared house — I cook for myself', value: 'Shared house' },
    ],
  },
  {
    key: 'challenge', label: 'Biggest challenge', type: 'single',
    question: 'What is your biggest food challenge?',
    options: [
      { emoji: '⏰', label: 'No time to cook healthy food', value: 'No time to cook' },
      { emoji: '🤷', label: "I don't know what to eat", value: "Don't know what to eat" },
      { emoji: '🍔', label: 'I eat out or order delivery too much', value: 'Eat out too much' },
      { emoji: '😔', label: 'I eat when stressed or emotional', value: 'Emotional eating' },
    ],
  },
  {
    key: 'details', label: 'Details', type: 'details',
    question: 'Tell us about yourself',
    fields: [
      { key: 'age', label: 'Age', type: 'number', required: true },
      { key: 'currentWeight', label: 'Current weight in kg (optional)', type: 'number' },
      { key: 'targetWeight', label: 'Target weight in kg (optional)', type: 'number' },
      { key: 'notes', label: 'Anything else we should know?', type: 'textarea' },
    ],
  },
];

const FINANCE_STEPS: Step[] = [
  {
    key: 'goal', label: 'Main goal', type: 'single',
    question: 'What is your main financial goal?',
    options: [
      { emoji: '💰', label: 'Save more money each month', value: 'Save more each month' },
      { emoji: '📈', label: 'Start investing for the future', value: 'Start investing' },
      { emoji: '💳', label: 'Pay off debt and feel free', value: 'Pay off debt' },
      { emoji: '🏠', label: 'Save for a major purchase', value: 'Save for a major purchase' },
      { emoji: '🌴', label: 'Build towards financial independence', value: 'Financial independence' },
    ],
  },
  {
    key: 'situation', label: 'Current situation', type: 'single',
    question: 'How would you describe your current situation?',
    options: [
      { emoji: '😰', label: 'Living paycheck to paycheck', value: 'Paycheck to paycheck' },
      { emoji: '😐', label: 'Getting by but not saving enough', value: 'Getting by, not saving enough' },
      { emoji: '😊', label: 'Saving a little but not investing', value: 'Saving but not investing' },
      { emoji: '🤑', label: 'Earning well but not optimising', value: 'Earning well, not optimising' },
    ],
  },
  {
    key: 'investing', label: 'Currently investing', type: 'single',
    question: 'Do you currently invest anything?',
    options: [
      { emoji: '❌', label: "No — I haven't started yet", value: 'Not started' },
      { emoji: '🌱', label: 'A little — under ₹5,000/month', value: 'Under ₹5,000/month' },
      { emoji: '📈', label: 'Yes — ₹5,000-20,000/month', value: '₹5,000-20,000/month' },
      { emoji: '💼', label: 'Actively — more than ₹20,000/month', value: 'More than ₹20,000/month' },
    ],
  },
  {
    key: 'challenge', label: 'Biggest challenge', type: 'single',
    question: 'What is your biggest money challenge?',
    options: [
      { emoji: '📊', label: "I don't know where my money goes", value: "Don't know where money goes" },
      { emoji: '💸', label: 'I spend more than I plan to', value: 'Overspending' },
      { emoji: '😨', label: 'Debt is stressing me out', value: 'Debt stress' },
      { emoji: '🤷', label: "I don't know where to start with investing", value: "Don't know where to start investing" },
    ],
  },
  {
    key: 'successVision', label: 'What success looks like', type: 'details',
    question: 'What does financial success look like for you?',
    fields: [
      { key: 'successVision', label: '', type: 'textarea', required: true, placeholder: 'Describe your ideal financial situation in 1-2 sentences...' },
    ],
  },
  {
    key: 'details', label: 'Details', type: 'details',
    question: 'Your details',
    fields: [
      { key: 'age', label: 'Age', type: 'number', required: true },
      { key: 'incomeRange', label: 'Monthly income range', type: 'select', required: true,
        options: ['Under ₹30K', '₹30-50K', '₹50-80K', '₹80K-1.5L', 'Above ₹1.5L'] },
      { key: 'notes', label: 'Anything else we should know?', type: 'textarea' },
    ],
  },
];

function buildSteps(plan: PlanKind): Step[] {
  if (plan === 'diet') return DIET_STEPS;
  if (plan === 'finance') return FINANCE_STEPS;
  return [
    ...DIET_STEPS.map(s => ({ ...s, key: `diet_${s.key}`, label: `Nutrition — ${s.label}`, section: 'Section 1: Nutrition' })),
    ...FINANCE_STEPS.map(s => ({ ...s, key: `finance_${s.key}`, label: `Finance — ${s.label}`, section: 'Section 2: Finance' })),
  ];
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950" />}>
      <OnboardingFlow />
    </Suspense>
  );
}

function OnboardingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planParam = (searchParams.get('plan') ?? 'diet') as PlanKind;
  const plan: PlanKind = (['diet', 'finance', 'bundle'] as PlanKind[]).includes(planParam) ? planParam : 'diet';
  const email = searchParams.get('email') ?? '';
  const planInfo = getPlanAny(plan);

  const steps = buildSteps(plan);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const setAnswer = (key: string, value: any) => setAnswers(a => ({ ...a, [key]: value }));

  const canAdvance = (() => {
    if (step.type === 'single') return !!answers[step.key];
    if (step.type === 'multi') {
      const selected: string[] = answers[step.key] ?? [];
      return selected.length > 0;
    }
    // details
    return (step.fields ?? []).every(f => !f.required || String(answers[f.key] ?? '').trim() !== '');
  })();

  const goNext = () => {
    if (!canAdvance) return;
    if (isLast) { void submit(); return; }
    setStepIndex(i => i + 1);
  };
  const goBack = () => setStepIndex(i => Math.max(0, i - 1));

  const toggleMulti = (value: string) => {
    const selected: string[] = answers[step.key] ?? [];
    if (value === 'None') { setAnswer(step.key, selected.includes('None') ? [] : ['None']); return; }
    const withoutNone = selected.filter(v => v !== 'None');
    const next = withoutNone.includes(value) ? withoutNone.filter(v => v !== value) : [...withoutNone, value];
    setAnswer(step.key, next);
  };

  const formatAnswer = (s: Step): string => {
    const v = answers[s.key];
    if (s.type === 'multi') {
      const arr: string[] = v ?? [];
      const other = answers[`${s.key}Other`];
      return [arr.join(', ') || '—', other ? `(also: ${other})` : ''].filter(Boolean).join(' ');
    }
    if (s.type === 'details') {
      return (s.fields ?? [])
        .map(f => answers[f.key] ? `${f.label || s.question}: ${answers[f.key]}` : null)
        .filter(Boolean).join(' · ') || '—';
    }
    return v ?? '—';
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const score = await getLatestScore();
      const planName = planInfo?.name ?? plan;
      const lines = [
        'NEW SUBSCRIBER ONBOARDING ANSWERS',
        '──────────────────────────────────',
        `Plan: ${planName}`,
        `Email: ${email || 'not provided'}`,
        `Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        `WellFiLab Score: ${score ? `${score.overall}/100 — ${score.archetype.name}` : 'Not taken yet'}`,
        '',
        'ANSWERS:',
        ...steps.map((s, i) => `Q${i + 1} — ${s.label}: ${formatAnswer(s)}`),
        '──────────────────────────────────',
        `ACTION NEEDED: Create and send personalised plan within 48 hours to ${email || '(no email provided)'}`,
      ];

      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: email ? email.split('@')[0] : 'Plan Subscriber',
            email: email || 'no-reply@wellfilab.com',
            subject: `New Plan Subscriber — ${planName} — ${email}`,
            message: lines.join('\n'),
          }),
        });
      } catch {
        // Don't trap the user behind a failed email — the answers are still
        // saved locally and the admin can be reached directly if needed.
      }

      await saveOnboarding({ plan, email, answers, submittedAt: new Date().toISOString() });
      router.push(`/plan/onboarding/done?plan=${plan}&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('Something went wrong submitting your answers. Please try again, or email hello@wellfilab.com directly.');
      setSubmitting(false);
    }
  };

  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Question {stepIndex + 1} of {steps.length}</span>
            {planInfo && <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{planInfo.icon} {planInfo.name}</span>}
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          {step.section && (
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-3 text-center">{step.section}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center leading-snug">
            {step.question}
          </h1>

          {step.type === 'single' && (
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {step.options!.map(opt => (
                <button key={opt.value} onClick={() => setAnswer(step.key, opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                    answers[step.key] === opt.value
                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-400'
                  }`}>
                  <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                  <span className="font-semibold text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {step.type === 'multi' && (
            <div className="mb-8">
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {step.options!.map(opt => {
                  const selected: string[] = answers[step.key] ?? [];
                  const active = selected.includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => toggleMulti(opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-400'
                      }`}>
                      <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {step.otherText && (
                <input value={answers[`${step.key}Other`] ?? ''} onChange={e => setAnswer(`${step.key}Other`, e.target.value)}
                  placeholder="Anything else we should know?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500" />
              )}
            </div>
          )}

          {step.type === 'details' && (
            <div className="space-y-4 mb-8">
              {step.fields!.map(f => (
                <div key={f.key}>
                  {f.label && <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{f.label}</label>}
                  {f.type === 'textarea' ? (
                    <textarea value={answers[f.key] ?? ''} onChange={e => setAnswer(f.key, e.target.value)}
                      placeholder={f.placeholder} rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none" />
                  ) : f.type === 'select' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {f.options!.map(opt => (
                        <button key={opt} onClick={() => setAnswer(f.key, opt)}
                          className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            answers[f.key] === opt
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input type={f.type} value={answers[f.key] ?? ''} onChange={e => setAnswer(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500" />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            {stepIndex > 0 && (
              <button onClick={goBack} className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                ← Back
              </button>
            )}
            <button onClick={goNext} disabled={!canAdvance || submitting}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                canAdvance && !submitting
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}>
              {submitting ? 'Sending…' : isLast ? 'Send my answers →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
