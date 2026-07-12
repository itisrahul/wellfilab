'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestScore } from '@/lib/scoreStorage';
import { getBySlug } from '@/config/tools';
import type { WellFiScore } from '@/lib/wellfilab-score';

type Dim = 'body' | 'mind' | 'wealth';

interface RoadmapAction {
  title: string;
  why: string;
  toolSlug?: string;
  toolCat?: 'health' | 'finance';
}

const ROOT_CAUSE: Record<Dim, { title: string; body: string; icon: string; accent: string; bg: string; border: string }> = {
  body: {
    title: 'Start here: Your physical health',
    body: 'Your body score is lowest. Energy, focus, and even financial discipline all depend on your physical foundation. Small physical changes create the biggest ripple effect.',
    icon: '💪', accent: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-300 dark:border-teal-700',
  },
  mind: {
    title: 'Start here: Stress and mental load',
    body: 'Your mind score is lowest. Stress is the hidden driver behind poor food choices AND poor financial decisions. Reducing it unlocks everything else simultaneously.',
    icon: '🧠', accent: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-300 dark:border-indigo-700',
  },
  wealth: {
    title: 'Start here: Financial foundation',
    body: 'Your finance score is lowest. Financial anxiety quietly damages sleep, eating habits, and relationships. Building a simple financial foundation removes that weight from everything.',
    icon: '💰', accent: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-300 dark:border-amber-700',
  },
};

const DIM_LABEL: Record<Dim, string> = { body: 'Body', mind: 'Mind', wealth: 'Wealth' };

const PHASE1_ACTIONS: Record<Dim, RoadmapAction[]> = {
  body: [
    { title: 'Sleep 30 minutes more tonight', why: 'Not an hour. Just 30 minutes. Set a bedtime alarm, not just a wake alarm.', toolSlug: 'sleep', toolCat: 'health' },
    { title: 'Walk for 20 minutes tomorrow morning', why: 'Before checking your phone. This sets your cortisol rhythm for the whole day.', toolSlug: 'calories-burned', toolCat: 'health' },
    { title: "Cook one meal at home this week that you'd normally order", why: 'Not a diet. One meal. Build the habit before building the plan.', toolSlug: 'calories', toolCat: 'health' },
  ],
  mind: [
    { title: 'Write down your 3 biggest stressors', why: 'Not to solve them. Just to see them clearly written down. Takes 5 minutes.' },
    { title: 'No phone for 30 minutes before sleep', why: 'Start tonight. This alone improves sleep quality noticeably within a week.', toolSlug: 'sleep', toolCat: 'health' },
    { title: 'Write your total income and expenses', why: 'Financial fog causes more stress than financial problems. Clarity reduces anxiety immediately.', toolSlug: 'budget', toolCat: 'finance' },
  ],
  wealth: [
    { title: 'Find out exactly where your money went last month', why: 'Open your bank app. Look at last 30 days. No judgement — just awareness.', toolSlug: 'budget', toolCat: 'finance' },
    { title: 'Calculate your emergency fund target', why: '3 months of expenses. Calculate the exact number you\'re working towards.', toolSlug: 'savings-goal', toolCat: 'finance' },
    { title: 'Find one thing you spend on that you could pause for 30 days', why: 'Not forever. Just 30 days. One subscription, one habit.' },
  ],
};

const PHASE3_ACTIONS: Record<Dim, RoadmapAction[]> = {
  body: [
    { title: 'Get a body composition check', why: 'Weight alone hides the real story — body fat percentage tells you what\'s actually changing.', toolSlug: 'body-fat', toolCat: 'health' },
    { title: 'Set a specific fitness goal for the next 90 days', why: 'A number and a date beat "get fitter" every time.' },
    { title: 'When ready: join a structured program', why: 'A couch-to-5K app or a local gym plan — outside structure accelerates what you\'ve already started.' },
  ],
  mind: [
    { title: 'Build a 10-minute daily stress practice', why: 'Breathing, journaling, a walk without your phone — consistency matters more than the method.' },
    { title: 'Protect one full day a week as genuinely offline', why: 'Recovery is not optional — it\'s what makes the other six days sustainable.' },
    { title: 'When ready: talk to a professional', why: 'Even 3-4 sessions with a therapist or counsellor can build tools that last for years.' },
  ],
  wealth: [
    { title: 'When ready for investing: open a demat account and start a small SIP', why: 'Even ₹500/month started today beats a larger amount started next year.', toolSlug: 'sip', toolCat: 'finance' },
    { title: 'Review your tax-saving investments', why: 'Money you\'re already earning — make sure it\'s not leaking to avoidable tax.', toolSlug: 'debt-payoff', toolCat: 'finance' },
    { title: 'Set a concrete net worth target for next year', why: 'A specific number to build toward, not a vague sense of "doing better".' },
  ],
};

const ROADMAP_TOOLS: Record<Dim, string[]> = {
  body:   ['bmi', 'sleep', 'calories', 'body-fat'],
  mind:   ['sleep', 'heart-rate', 'budget'],
  wealth: ['budget', 'sip', 'savings-goal', 'debt-payoff'],
};

function lowestToHighest(score: WellFiScore): Dim[] {
  return (['body', 'mind', 'wealth'] as Dim[]).sort((a, b) => score[a] - score[b]);
}

function loadChecked(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem('wfl_roadmap_checked') ?? '{}'); } catch { return {}; }
}
function saveChecked(v: Record<string, boolean>) {
  try { window.localStorage.setItem('wfl_roadmap_checked', JSON.stringify(v)); } catch { /* noop */ }
}

export default function RoadmapPage() {
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState<WellFiScore | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    getLatestScore().then(s => {
      setScore(s);
      if (s) {
        let started = window.localStorage.getItem('wfl_roadmap_start');
        if (!started) {
          started = new Date().toISOString();
          window.localStorage.setItem('wfl_roadmap_start', started);
        }
        setStartedAt(started);
        setChecked(loadChecked());
      }
    });
  }, []);

  const toggleAction = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      saveChecked(next);
      return next;
    });
  };

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!score) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
          <p className="text-4xl mb-4">🗺️</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Take the free score first</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Your roadmap is personalised to your score results. Takes 60 seconds.
          </p>
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            Get my score →
          </Link>
        </div>
      </div>
    );
  }

  const order = lowestToHighest(score);
  const [phase1Dim, phase2Dim, phase3Dim] = order;

  const checkInDate = startedAt ? new Date(new Date(startedAt).getTime() + 30 * 86400000) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Personalised Roadmap</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Your 90-Day Roadmap</h1>
          <p className="text-gray-400 text-sm mb-4">Based on your score of {score.overall}/100</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-lg">{score.archetype.emoji}</span>
            <span className="text-sm font-bold text-white">{score.archetype.name}</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-4">Updates automatically when you retake your score</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Root cause card */}
        <div className={`rounded-2xl border-2 p-6 ${ROOT_CAUSE[phase1Dim].bg} ${ROOT_CAUSE[phase1Dim].border}`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">{ROOT_CAUSE[phase1Dim].icon}</span>
            <div>
              <p className={`font-extrabold text-lg mb-1.5 ${ROOT_CAUSE[phase1Dim].accent}`}>{ROOT_CAUSE[phase1Dim].title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ROOT_CAUSE[phase1Dim].body}</p>
            </div>
          </div>
        </div>

        {/* 3-phase timeline */}
        <div>
          <PhaseRow
            label="Right Now" weeks="Week 1-2" status="active"
            tagline={`Based on your lowest score: ${DIM_LABEL[phase1Dim]}`}
            dim={phase1Dim} actions={PHASE1_ACTIONS[phase1Dim]}
            checked={checked} onToggle={toggleAction} phaseKey="p1"
          />
          <PhaseRow
            label="Building" weeks="Week 3-6" status="upcoming"
            tagline={`Complete Phase 1 first · ${DIM_LABEL[phase2Dim]}`}
            dim={phase2Dim} actions={PHASE1_ACTIONS[phase2Dim]}
            checked={checked} onToggle={toggleAction} phaseKey="p2"
          />
          <PhaseRow
            label="Growing" weeks="Month 2-3" status="future"
            tagline={`Building on your strength: ${DIM_LABEL[phase3Dim]}`}
            dim={phase3Dim} actions={PHASE3_ACTIONS[phase3Dim]}
            checked={checked} onToggle={toggleAction} phaseKey="p3" isLast
          />
        </div>

        {/* Tools for your roadmap */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tools for your roadmap</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROADMAP_TOOLS[phase1Dim].map(slug => {
              const tool = getBySlug(slug);
              if (!tool) return null;
              return (
                <Link key={slug} href={`/tools/${tool.category}/${tool.slug}`}
                  className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group">
                  <span className="text-xl">{tool.icon}</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{tool.short}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Check-in section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
          <p className="text-2xl mb-2">📅</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Come back in 30 days</p>
          <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
            Retake your score to see what improved. Your roadmap updates automatically.
          </p>
          {startedAt && (
            <div className="flex items-center justify-center gap-6 text-xs">
              <div>
                <p className="font-bold text-gray-700 dark:text-gray-300">{new Date(startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-gray-400">Roadmap started</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div>
                <p className="font-bold text-teal-600 dark:text-teal-400">{checkInDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-gray-400">Next check-in</p>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade section */}
        <div className="bg-gray-950 rounded-2xl p-7 text-center">
          <p className="font-extrabold text-white text-lg mb-3">Want a deeper personalised roadmap?</p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto mb-2">
            The roadmap above is based on your score. A personalised plan goes further — your specific numbers, your specific challenges, a detailed step-by-step guide built for exactly your situation.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto mb-5">
            Created personally. Not AI-generated. Not a template.
          </p>
          <p className="text-xs text-gray-500 mb-5">₹149/month · 48hr delivery · 30-day refund</p>
          <Link href="/plan" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all hover:scale-105">
            Get my personalised plan →
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── Presentational pieces ─────────────────────────────────────────────────

const STATUS_STYLE: Record<'active' | 'upcoming' | 'future', { dot: string; card: string; opacity: string }> = {
  active:   { dot: 'bg-teal-600 ring-4 ring-teal-100 dark:ring-teal-900/40', card: 'border-teal-300 dark:border-teal-700 bg-white dark:bg-gray-900', opacity: '' },
  upcoming: { dot: 'bg-gray-300 dark:bg-gray-600', card: 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50', opacity: 'opacity-80' },
  future:   { dot: 'bg-gray-200 dark:bg-gray-700', card: 'border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30', opacity: 'opacity-60' },
};

function PhaseRow({ label, weeks, status, tagline, actions, checked, onToggle, phaseKey, isLast }: {
  label: string; weeks: string; status: 'active' | 'upcoming' | 'future'; tagline: string;
  dim: Dim; actions: RoadmapAction[];
  checked: Record<string, boolean>; onToggle: (id: string) => void; phaseKey: string; isLast?: boolean;
}) {
  const style = STATUS_STYLE[status];
  return (
    <div className="flex gap-4 sm:gap-6">
      {/* Left rail */}
      <div className="flex flex-col items-center flex-shrink-0 w-14 sm:w-24">
        <div className={`w-4 h-4 rounded-full ${style.dot}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 my-1" />}
        <div className="text-center mt-1 hidden sm:block">
          <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{label}</p>
          <p className="text-[10px] text-gray-400">{weeks}</p>
        </div>
      </div>

      {/* Right card */}
      <div className={`flex-1 rounded-2xl border p-5 mb-6 ${style.card} ${style.opacity}`}>
        <p className="sm:hidden text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{label} · {weeks}</p>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">{tagline}</p>
        <div className="space-y-3">
          {actions.map((a, i) => {
            const id = `${phaseKey}-${i}`;
            const done = !!checked[id];
            return (
              <label key={id} className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={done} onChange={() => onToggle(id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">{a.why}</p>
                  {a.toolSlug && a.toolCat && (
                    <Link href={`/tools/${a.toolCat}/${a.toolSlug}`} onClick={e => e.stopPropagation()}
                      className="inline-block text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1.5">
                      Try the tool →
                    </Link>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
