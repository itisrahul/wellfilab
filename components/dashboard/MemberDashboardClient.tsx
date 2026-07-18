'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { scoreColor } from '@/lib/wellfilab-score';
import { getScoreHistory } from '@/lib/scoreStorage';
import { syncScoreInputsFromAccount } from '@/lib/scoreInputs';
import { getGoals } from '@/lib/goalsStorage';
import { getSnapshots, syncNetWorthGoal } from '@/lib/netWorthHistory';
import { getRiskAlerts } from '@/lib/riskAlerts';
import { computeRoadmapProgress } from '@/lib/roadmapProgress';
import { getAchievements } from '@/lib/achievements';
import { getScoreFocus, setScoreFocus, dimMatchesFocus, type ScoreFocus } from '@/lib/scoreFocus';
import { syncRoadmapChecksFromAccount } from '@/lib/roadmapChecks';
import { hasUnimportedLocalData } from '@/lib/accountImport';
import { SWR_KEYS } from '@/lib/swrKeys';
import { ImportLocalDataBanner } from './ImportLocalDataBanner';
import { ScoreBand } from './ScoreBand';
import { TopPriorities } from './TopPriorities';
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { NetWorthCard } from './NetWorthCard';
import { RoadmapProgressCard } from './RoadmapProgressCard';
import { AchievementsCard } from './AchievementsCard';
import { NextStepsCard } from './NextStepsCard';
import { MonthlyReviewBand } from './MonthlyReviewBand';
import { FocusSelector } from './FocusSelector';

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

/** Refetches every account data source — used after the one-time import
 * banner completes, since it may have just written into all of them. */
function refreshAllAccountData() {
  return Promise.all([
    mutate(SWR_KEYS.scoreHistory), mutate(SWR_KEYS.goals), mutate(SWR_KEYS.netWorthSnapshots),
    mutate(SWR_KEYS.roadmapChecks), mutate(SWR_KEYS.scoreInputs),
  ]);
}

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [focus, setFocus] = useState<ScoreFocus>('both');
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [roadmapStarted, setRoadmapStarted] = useState(false);
  const firstName = userName.split(' ')[0];
  const initial = userName.trim().charAt(0).toUpperCase() || 'W';

  // Cached by shared keys (lib/swrKeys.ts) — the same data fetched here is
  // reused (not re-fetched) when the user then visits /goals, /roadmap, or
  // /history, and vice versa.
  const { data: history, isLoading: historyLoading } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const { data: rawGoals, isLoading: goalsLoading } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: netWorthSnapshots, isLoading: snapshotsLoading } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const { data: roadmapChecks, isLoading: roadmapLoading } = useSWR(SWR_KEYS.roadmapChecks, syncRoadmapChecksFromAccount);
  const { data: rawInputs, isLoading: inputsLoading } = useSWR(SWR_KEYS.scoreInputs, syncScoreInputsFromAccount);

  const loading = historyLoading || goalsLoading || snapshotsLoading || roadmapLoading || inputsLoading;
  const score = history?.[0] ?? null;

  // A 'net-worth' goal reads its current value from the latest real
  // snapshot instead of a stale manual entry — see syncNetWorthGoal.
  const goals = useMemo(
    () => (rawGoals ?? []).map(g => syncNetWorthGoal(g, netWorthSnapshots ?? [])),
    [rawGoals, netWorthSnapshots]
  );

  useEffect(() => {
    setFocus(getScoreFocus());
    setShowImportBanner(hasUnimportedLocalData());
    setRoadmapStarted(typeof window !== 'undefined' && !!window.localStorage.getItem('wfl_roadmap_start'));
  }, []);

  useEffect(() => {
    // Mirrors the original behavior: the first time a score is seen and no
    // start flag exists yet, stamp "now" as when the roadmap effectively began.
    if (score && typeof window !== 'undefined' && !window.localStorage.getItem('wfl_roadmap_start')) {
      const now = new Date().toISOString();
      window.localStorage.setItem('wfl_roadmap_start', now);
      setRoadmapStarted(true);
    }
  }, [score]);

  const handleImportDone = () => {
    setShowImportBanner(false);
    refreshAllAccountData();
  };

  const handleFocusChange = (f: ScoreFocus) => {
    setFocus(f);
    setScoreFocus(f);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const roadmapProgress = score
    ? computeRoadmapProgress(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, roadmapChecks ?? {}, focus)
    : null;

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
                  {!loading ? dateStr : ' '}
                </p>
                <h1 className="text-2xl font-extrabold text-white mb-0.5">
                  {!loading ? `${greeting}, ${firstName}` : `Welcome, ${firstName}`} 👋
                </h1>
                <p className="text-white/50 text-sm">{userEmail}{memberSince ? ` · Member since ${memberSince}` : ''}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="font-mono tabular-nums text-2xl font-black" style={{ color: score ? scoreColor(score.overall) : '#6b7280' }}>
                  {score?.overall ?? '—'}
                </p>
                <p className="text-white/40 text-[11px]">WellFiLab Score</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="font-mono tabular-nums text-2xl font-black text-teal-400">{score?.streakDays ?? '—'}</p>
                <p className="text-white/40 text-[11px]">Review streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading && showImportBanner && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <ImportLocalDataBanner onDone={handleImportDone} />
        </div>
      )}

      {loading ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : !score ? (
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

          {/* ── Focus — Health only / Wealth only / Both (the 3 real user flows) ── */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-400">Track and get recommendations for:</p>
            <FocusSelector focus={focus} onChange={handleFocusChange} />
          </div>

          {/* ── ACT — above the fold: where I stand, biggest problem, urgent risk ── */}
          <ScoreBand score={score} focus={focus} />

          <div className="grid lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3"><TopPriorities actions={score.actions} focus={focus} /></div>
            <div className="lg:col-span-2">
              <RiskAlertsCard alerts={getRiskAlerts(
                focus === 'wealth' ? null : rawInputs?.body ?? null,
                focus === 'health' ? null : rawInputs?.finance ?? null,
              )} />
            </div>
          </div>

          {/* ── TRACK — first scroll: how much progress, is it working ── */}
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <GoalProgressCard goals={goals} focus={focus} />
            <RoadmapProgressCard started={roadmapStarted} progress={roadmapProgress} />
          </div>

          {focus !== 'health' && (
            <NetWorthCard snapshots={netWorthSnapshots ?? []} age={rawInputs?.body?.age} />
          )}

          <div className="grid lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3"><ScoreHistoryChart history={history ?? []} /></div>
            <div className="lg:col-span-2">
              <AchievementsCard achievements={getAchievements(score, history ?? [], roadmapProgress, goals)} />
            </div>
          </div>

          <Link href="/history"
            className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 p-5 transition-all group">
            <span className="text-3xl flex-shrink-0">📜</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-sm">See your full history</p>
              <p className="text-xs text-gray-400 mt-0.5">Score, net worth, goals, and roadmap — every real update, in one timeline.</p>
            </div>
            <span className="flex-shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">View history →</span>
          </Link>

          {/* ── RETURN — bottom: what to do next, why come back next month ── */}
          <NextStepsCard
            dimensions={(() => {
              const focused = score.dimensions.filter(d => dimMatchesFocus(d.id, focus));
              return focused.length > 0 ? focused : score.dimensions;
            })()}
            body={rawInputs?.body ?? null} finance={rawInputs?.finance ?? null}
          />

          <MonthlyReviewBand score={score} />

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Scores and history are synced to your account — sign in on any device and it's all here. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
