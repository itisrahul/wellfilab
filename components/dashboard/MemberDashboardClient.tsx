'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { scoreColor, type WellFiScore } from '@/lib/wellfilab-score';
import { getLatestScore, getScoreHistory } from '@/lib/scoreStorage';
import { loadRawInputs } from '@/lib/scoreInputs';
import { getGoals, type Goal } from '@/lib/goalsStorage';
import { getRiskAlerts } from '@/lib/riskAlerts';
import { computeRoadmapProgress, type RoadmapProgressSummary } from '@/lib/roadmapProgress';
import { getAchievements } from '@/lib/achievements';
import { ScoreBand } from './ScoreBand';
import { TopPriorities } from './TopPriorities';
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { RoadmapProgressCard } from './RoadmapProgressCard';
import { AchievementsCard } from './AchievementsCard';
import { NextStepsCard } from './NextStepsCard';
import { MonthlyReviewBand } from './MonthlyReviewBand';

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
  goals: Goal[];
  rawInputs: ReturnType<typeof loadRawInputs>;
  roadmapStarted: boolean;
  roadmapProgress: RoadmapProgressSummary | null;
  greeting: string;
  dateStr: string;
}

function readRoadmapState(): { started: boolean; checks: Record<string, boolean> } {
  if (typeof window === 'undefined') return { started: false, checks: {} };
  const started = !!window.localStorage.getItem('wfl_roadmap_start');
  let checks: Record<string, boolean> = {};
  try { checks = JSON.parse(window.localStorage.getItem('wfl_roadmap_checks') ?? '{}'); } catch { /* noop */ }
  return { started, checks };
}

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const firstName = userName.split(' ')[0];
  const initial = userName.trim().charAt(0).toUpperCase() || 'W';

  useEffect(() => {
    const hour = new Date().getHours();
    Promise.all([getLatestScore(), getScoreHistory(), getGoals()])
      .then(([score, history, goals]) => {
        const rawInputs = loadRawInputs();
        const roadmap = readRoadmapState();
        const roadmapProgress = score ? computeRoadmapProgress(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, roadmap.checks) : null;
        setData({
          score, history, goals, rawInputs,
          roadmapStarted:  roadmap.started,
          roadmapProgress,
          greeting: hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
          dateStr:  new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        });
      });
  }, []);

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
                <p className="font-mono tabular-nums text-2xl font-black" style={{ color: data?.score ? scoreColor(data.score.overall) : '#6b7280' }}>
                  {data?.score?.overall ?? '—'}
                </p>
                <p className="text-white/40 text-[11px]">WellFiLab Score</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="font-mono tabular-nums text-2xl font-black text-teal-400">{data?.score?.streakDays ?? '—'}</p>
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
            Get my free score →
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── ACT — above the fold: where I stand, biggest problem, urgent risk ── */}
          <ScoreBand score={data.score} />

          <div className="grid lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3"><TopPriorities actions={data.score.actions} /></div>
            <div className="lg:col-span-2"><RiskAlertsCard alerts={getRiskAlerts(data.rawInputs?.body ?? null, data.rawInputs?.finance ?? null)} /></div>
          </div>

          {/* ── TRACK — first scroll: how much progress, is it working ── */}
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <GoalProgressCard goals={data.goals} />
            <RoadmapProgressCard started={data.roadmapStarted} progress={data.roadmapProgress} />
          </div>

          <div className="grid lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3"><ScoreHistoryChart history={data.history} /></div>
            <div className="lg:col-span-2">
              <AchievementsCard achievements={getAchievements(data.score, data.history, data.roadmapProgress, data.goals)} />
            </div>
          </div>

          {/* ── RETURN — bottom: what to do next, why come back next month ── */}
          <NextStepsCard dimensions={data.score.dimensions} body={data.rawInputs?.body ?? null} finance={data.rawInputs?.finance ?? null} />

          <MonthlyReviewBand score={data.score} />

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Scores and history are stored on this device only. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
