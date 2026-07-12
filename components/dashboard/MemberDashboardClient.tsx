'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { scoreColor, type WellFiScore, type Insight } from '@/lib/wellfilab-score';
import { getLatestScore, getScoreHistory } from '@/lib/scoreStorage';
import {
  getSubscription, getAccountSubscription, syncSubscriptionToAccount, cancelSubscription,
  type StoredSubscription,
} from '@/lib/subscriptionStorage';
import { getCalcHistory, type CalcHistoryEntry } from '@/lib/dashboardData';
import { getOnboarding } from '@/lib/onboardingStorage';
import { AICoach } from './AICoach';
import { PlanStatus } from './PlanStatus';
import { QuickTools } from './QuickTools';

// recharts is heavy — load it only on the client, same pattern every
// calculator widget already uses, instead of bloating the dashboard's
// initial JS payload with a library only this one chart needs.
const ScoreHistoryChart = dynamic(
  () => import('./ScoreHistoryChart').then(m => m.ScoreHistoryChart),
  { ssr: false, loading: () => <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-full min-h-[300px] animate-pulse" /> }
);

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

interface DashboardData {
  score: WellFiScore | null;
  history: WellFiScore[];
  subscription: StoredSubscription | null;
  onboarded: boolean;
  roadmapStarted: boolean;
  phase1Done: boolean;
  calcHistory: CalcHistoryEntry[];
  greeting: string;
  dateStr: string;
}

function readRoadmapState(): { started: boolean; phase1Done: boolean } {
  if (typeof window === 'undefined') return { started: false, phase1Done: false };
  const started = !!window.localStorage.getItem('wfl_roadmap_start');
  let phase1Done = false;
  try {
    const checked = JSON.parse(window.localStorage.getItem('wfl_roadmap_checked') ?? '{}');
    phase1Done = !!checked['p1-0'] && !!checked['p1-1'] && !!checked['p1-2'];
  } catch { /* noop */ }
  return { started, phase1Done };
}

const DIMENSIONS: { key: 'body' | 'mind' | 'wealth' | 'life'; label: string; icon: string; barColor: string }[] = [
  { key: 'body',   label: 'Body',   icon: '💪', barColor: 'bg-teal-500' },
  { key: 'mind',   label: 'Mind',   icon: '🧠', barColor: 'bg-indigo-500' },
  { key: 'wealth', label: 'Wealth', icon: '💰', barColor: 'bg-amber-500' },
  { key: 'life',   label: 'Life',   icon: '🌱', barColor: 'bg-green-500' },
];

const INSIGHT_STYLE: Record<Insight['type'], string> = {
  warning:     'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  opportunity: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  connection:  'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  strength:    'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
};

const LEVEL_LABEL: Record<WellFiScore['level'], string> = {
  quick: 'Quick self-rating', body: 'Body details added', full: 'Full picture',
};

type StepState = 'done' | 'current' | 'upcoming' | 'optional';
interface JourneyStep { icon: string; label: string; sub: string; state: StepState; href?: string; }

const STEP_STYLE: Record<StepState, { dot: string; text: string; line: string }> = {
  done:     { dot: 'bg-teal-600 text-white',                                    text: 'text-gray-700 dark:text-gray-300', line: 'bg-teal-600' },
  current:  { dot: 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/40', text: 'text-amber-700 dark:text-amber-400 font-bold', line: 'bg-gray-200 dark:bg-gray-700' },
  upcoming: { dot: 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700', text: 'text-gray-400', line: 'bg-gray-200 dark:bg-gray-700' },
  optional: { dot: 'bg-white dark:bg-gray-900 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700', text: 'text-gray-400', line: 'bg-gray-200 dark:bg-gray-700' },
};

function buildJourney(
  score: WellFiScore, subscription: StoredSubscription | null, onboarded: boolean,
  roadmapStarted: boolean, phase1Done: boolean
): JourneyStep[] {
  const steps: JourneyStep[] = [{ icon: '🎯', label: 'Score taken', sub: score.archetype.name, state: 'done' }];

  steps.push(roadmapStarted
    ? { icon: '🗺️', label: 'View roadmap', sub: 'Started', state: 'done', href: '/roadmap' }
    : { icon: '🗺️', label: 'View roadmap', sub: 'Do this next', state: 'current', href: '/roadmap' });

  steps.push(phase1Done
    ? { icon: '✅', label: 'Follow Phase 1', sub: '3 actions done', state: 'done', href: '/roadmap' }
    : { icon: '✅', label: 'Follow Phase 1', sub: roadmapStarted ? '3 actions' : 'Start the roadmap first', state: roadmapStarted ? 'current' : 'upcoming', href: roadmapStarted ? '/roadmap' : undefined });

  const daysSinceScore = score.date ? Math.floor((Date.now() - new Date(score.date).getTime()) / 86400000) : 0;
  const checkInDue = daysSinceScore >= 7;
  steps.push({
    icon: '📊', label: '7-day check-in',
    sub: checkInDue ? 'Due now' : `In ${Math.max(0, 7 - daysSinceScore)}d`,
    state: checkInDue ? 'current' : 'upcoming',
    href: checkInDue ? '/score' : undefined,
  });

  if (!subscription || subscription.status === 'cancelled') {
    steps.push({ icon: '📋', label: 'Plan', sub: subscription ? 'Resubscribe' : 'Optional', state: 'optional', href: '/plan' });
  } else if (!onboarded) {
    steps.push({ icon: '📋', label: 'Plan', sub: 'Complete onboarding', state: 'current', href: `/plan/onboarding?plan=${subscription.planId}` });
  } else {
    steps.push({ icon: '📋', label: 'Plan', sub: 'Active', state: 'done', href: '/plan' });
  }

  return steps;
}

function JourneyTracker({ score, subscription, onboarded, roadmapStarted, phase1Done }: {
  score: WellFiScore; subscription: StoredSubscription | null; onboarded: boolean;
  roadmapStarted: boolean; phase1Done: boolean;
}) {
  const steps = buildJourney(score, subscription, onboarded, roadmapStarted, phase1Done);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Your journey</p>
      <div className="flex items-start">
        {steps.map((s, i) => {
          const style = STEP_STYLE[s.state];
          const content = (
            <div className="flex-1 flex flex-col items-center text-center min-w-0 px-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2 flex-shrink-0 ${style.dot}`}>{s.icon}</div>
              <p className={`text-[11px] leading-tight ${style.text}`}>{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-full">{s.sub}</p>
            </div>
          );
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              {s.href ? <Link href={s.href} className="flex-1 hover:opacity-80 transition-opacity">{content}</Link> : content}
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 -mt-6 ${style.line}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoadmapCard({ score, started }: { score: WellFiScore; started: boolean }) {
  if (!started) {
    return (
      <Link href="/roadmap"
        className="flex items-center gap-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all group">
        <span className="text-3xl flex-shrink-0">🗺️</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm">Your roadmap is ready →</p>
          <p className="text-xs text-white/80 mt-0.5">Based on your score. Free. Personalised.</p>
        </div>
        <span className="flex-shrink-0 text-xs font-bold group-hover:translate-x-0.5 transition-transform">View →</span>
      </Link>
    );
  }
  return (
    <Link href="/roadmap"
      className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 p-5 transition-all group">
      <span className="text-3xl flex-shrink-0">{score.archetype.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 dark:text-white text-sm">Your Roadmap</p>
        <p className="text-xs text-gray-400 mt-0.5">{score.archetype.name} · Score {score.overall}/100</p>
      </div>
      <span className="flex-shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">View your roadmap →</span>
    </Link>
  );
}

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const firstName = userName.split(' ')[0];
  const initial = userName.trim().charAt(0).toUpperCase() || 'W';

  useEffect(() => {
    const hour = new Date().getHours();
    Promise.all([getLatestScore(), getScoreHistory(), getAccountSubscription(), getSubscription()])
      .then(async ([score, history, accountSub, localSub]) => {
        // Account metadata (Clerk) is authoritative. If it's empty but this
        // browser has a local record — e.g. checkout happened as a guest,
        // then the same person signed in — link it to the account now so it
        // survives future devices/browsers too, instead of staying stuck local.
        let subscription = accountSub;
        if (!subscription && localSub) {
          await syncSubscriptionToAccount(localSub);
          subscription = localSub;
        }
        const onboarding = subscription ? await getOnboarding(subscription.planId) : null;
        const roadmap = readRoadmapState();
        setData({
          score, history, subscription,
          onboarded:      !!onboarding,
          roadmapStarted: roadmap.started,
          phase1Done:     roadmap.phase1Done,
          calcHistory:  getCalcHistory(),
          greeting:     hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
          dateStr:      new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        });
      });
  }, []);

  const handleCancelSubscription = async () => {
    if (!data?.subscription) return;
    const updated = await cancelSubscription(data.subscription);
    setData(prev => prev ? { ...prev, subscription: updated } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header — dark gradient with teal glow ── */}
      <div className="relative overflow-hidden bg-gray-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">

            <div className="flex items-center gap-4">
              {userImageUrl ? (
                <img src={userImageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-xl font-black text-white flex-shrink-0">
                  {initial}
                </div>
              )}
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                  {data ? data.dateStr : ' '}
                </p>
                <h1 className="text-2xl font-extrabold text-white mb-0.5">
                  {data ? `${data.greeting}, ${firstName}` : `Welcome, ${firstName}`} 👋
                </h1>
                <p className="text-white/50 text-sm">{userEmail}{memberSince ? ` · Member since ${memberSince}` : ''}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="text-2xl font-black" style={{ color: data?.score ? scoreColor(data.score.overall) : '#6b7280' }}>
                  {data?.score?.overall ?? '—'}
                </p>
                <p className="text-white/40 text-[11px]">WellFiLab Score</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="text-2xl font-black text-teal-400">{data?.score?.streakDays ?? '—'}</p>
                <p className="text-white/40 text-[11px]">Day streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!data ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : !data.score ? (
        // ── No score yet — CTA to take it ──
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't taken your WellFiLab Score yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Answer 3 quick questions and get your score, archetype, and a personalised action plan in under a minute.
          </p>
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            Take the WellFiLab Score →
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Your journey — where they are, what's next, why it matters */}
          <JourneyTracker score={data.score} subscription={data.subscription} onboarded={data.onboarded}
            roadmapStarted={data.roadmapStarted} phase1Done={data.phase1Done} />

          {/* Roadmap quick link — vivid "ready" banner until started, then a calmer continue-card */}
          <RoadmapCard score={data.score} started={data.roadmapStarted} />

          {/* Member stats strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Score depth',     value: LEVEL_LABEL[data.score.level] },
              { label: 'Tools tried',     value: String(data.calcHistory.length) },
              { label: 'Member since',    value: memberSince || '—' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Score + archetype hero */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 flex-wrap justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{data.score.archetype.emoji}</span>
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">{data.score.archetype.name}</p>
                  <p className="text-xs text-gray-400">{data.score.archetype.tagline}</p>
                </div>
              </div>
              <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex-shrink-0">
                View full score →
              </Link>
            </div>

            {/* 4 dimension progress bars */}
            <div className="grid sm:grid-cols-2 gap-4">
              {DIMENSIONS.map(d => (
                <div key={d.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <span>{d.icon}</span>{d.label}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{data.score[d.key]}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.barColor} transition-all duration-700`} style={{ width: `${data.score![d.key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What your numbers say */}
          {data.score.insights.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What your numbers say</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.score.insights.slice(0, 4).map((ins, i) => (
                  <div key={i} className={`rounded-2xl border p-4 ${INSIGHT_STYLE[ins.type]}`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl flex-shrink-0">{ins.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-xs mb-1">{ins.headline}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{ins.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health cost + trajectories (full picture only) — or a nudge to unlock them */}
          {data.score.level === 'full' && data.score.annualHealthCost != null ? (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Your health is costing you</p>
                <p className="text-3xl font-black">₹{data.score.annualHealthCost.toLocaleString('en-IN')}<span className="text-sm font-bold text-white/60">/yr</span></p>
                {data.score.lifetimeHealthCost != null && (
                  <p className="text-xs text-white/80 mt-2">₹{(data.score.lifetimeHealthCost/10000000).toFixed(1)} Cr over your career</p>
                )}
              </div>
              {data.score.trajectories && (
                <div className="sm:col-span-2 grid grid-cols-3 gap-2.5">
                  {data.score.trajectories.map(t => (
                    <div key={t.scenario} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5">
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 truncate">{t.label}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">₹{(t.netWorthAt60/10000000).toFixed(1)}Cr</p>
                      <p className="text-[10px] text-gray-400">at 60</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link href="/score" className="group block bg-gray-950 dark:bg-gray-900 rounded-2xl p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <span className="text-3xl flex-shrink-0">🔓</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-sm">Unlock your health cost in ₹ and life trajectories</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {data.score.level === 'quick' ? 'Add body and finance details' : 'Add finance details'} — 2 minutes, on the Score page.
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs font-bold text-teal-400 group-hover:translate-x-0.5 transition-transform">Continue →</span>
              </div>
            </Link>
          )}

          {/* AI Coach */}
          <AICoach score={data.score} />

          {/* Chart (2/3) + Plan status (1/3) */}
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2"><ScoreHistoryChart history={data.history} /></div>
            <div><PlanStatus subscription={data.subscription} onboarded={data.onboarded} email={userEmail} onCancel={handleCancelSubscription} /></div>
          </div>

          {/* Last 3 actions */}
          {data.score.actions.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Do this next</p>
              <div className="space-y-3">
                {data.score.actions.slice(0, 3).map(a => (
                  <div key={a.rank} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{a.rank}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{a.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1.5">{a.why}</p>
                        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">{a.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick tools */}
          <QuickTools actions={data.score.actions} calcHistory={data.calcHistory} />

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Scores and history are stored on this device only. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
