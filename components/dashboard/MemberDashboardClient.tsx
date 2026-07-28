'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { Heart, Brain, Wallet, Leaf, Flame, Circle, CheckCircle2 } from 'lucide-react';
import { scoreColor } from '@/lib/wellfilab-score';
import { ScoreRing } from '@/components/ui/ScoreRing';
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
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { NetWorthCard } from './NetWorthCard';
import { CashFlowCard } from './CashFlowCard';
import { EquityAllocationCard } from './EquityAllocationCard';
import { HealthOverviewCard } from './HealthOverviewCard';
import { WealthOverviewCard } from './WealthOverviewCard';
import { TopOpportunitiesCard } from './TopOpportunitiesCard';
import { RoadmapProgressCard } from './RoadmapProgressCard';
import { MiniScoreCard } from './MiniScoreCard';
import { AchievementsCard } from './AchievementsCard';
import { NextStepsCard } from './NextStepsCard';
import { MonthlyReviewBand } from './MonthlyReviewBand';
import { FocusSelector } from './FocusSelector';
import { LinkChip, LinkBar } from './LinkChip';

// recharts is heavy — load it only on the client, same pattern every
// calculator widget already uses, instead of bloating the dashboard's
// initial JS payload with a library only this one chart needs.
const HealthWealthTrendChart = dynamic(
  () => import('./HealthWealthTrendChart').then(m => m.HealthWealthTrendChart),
  { ssr: false, loading: () => <div className="h-60 animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);
const MiniTrendLine = dynamic(
  () => import('./MiniTrendLine').then(m => m.MiniTrendLine),
  { ssr: false }
);

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

const TREND_WINDOWS = [3, 6, 10] as const;

/** Refetches every account data source — used after the one-time import
 * banner completes, since it may have just written into all of them. */
function refreshAllAccountData() {
  return Promise.all([
    mutate(SWR_KEYS.scoreHistory), mutate(SWR_KEYS.goals), mutate(SWR_KEYS.netWorthSnapshots),
    mutate(SWR_KEYS.roadmapChecks), mutate(SWR_KEYS.scoreInputs),
  ]);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** The big overall-score card that anchors the top row — same real ring
 * used on the homepage preview and the score results page, plus the real
 * archetype identity (not shown anywhere else on this redesigned page). */
function WellFiScoreCard({ overall, delta, archetypeName, archetypeEmoji, series }: {
  overall: number; delta?: number; archetypeName: string; archetypeEmoji: string; series: number[];
}) {
  const color = scoreColor(overall);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">WellFi Score</p>
      <div className="flex items-center gap-3 mb-1">
        <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
          <ScoreRing pct={overall} color={color} size={56} thick={6} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono tabular-nums font-black text-lg" style={{ color }}>{overall}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{archetypeEmoji} {archetypeName}</p>
          {delta != null && (
            <p className={`text-[10px] font-semibold ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {delta !== 0 ? `${Math.abs(delta)} vs last` : 'No change'}
            </p>
          )}
        </div>
      </div>
      {series.length > 1 && <div className="-mx-2 mt-auto"><MiniTrendLine data={series} color={color} /></div>}
    </div>
  );
}

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [focus, setFocus] = useState<ScoreFocus>('both');
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [roadmapStarted, setRoadmapStarted] = useState(false);
  const [trendWindow, setTrendWindow] = useState<typeof TREND_WINDOWS[number]>(6);
  const firstName = userName.split(' ')[0];

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

  const roadmapProgress = score
    ? computeRoadmapProgress(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, roadmapChecks ?? {}, focus)
    : null;

  // Real deltas vs the previous saved check-in — never against an assumed
  // "last month," since real check-in cadence varies. Skipped across a
  // scoreVersion boundary, same rule the algorithm itself uses for
  // `scoreChange`, so a formula update never shows as a fake swing.
  const prevEntry = history && history.length > 1 ? history[1] : null;
  const prevValid = !!(prevEntry && score && prevEntry.scoreVersion === score.scoreVersion);
  const deltaOf = (curr?: number, prev?: number) => prevValid && curr != null && prev != null ? curr - prev : undefined;

  // Oldest -> newest, for the mini sparklines and the trend window below.
  const chronological = (history ?? []).slice().reverse();
  const seriesOf = (key: 'overall' | 'body' | 'mind' | 'wealth' | 'life') => chronological.map(h => h[key]);
  const healthSeriesFull = chronological.map(h => Math.round((h.body + h.mind) / 2));
  const wealthSeriesFull = seriesOf('wealth');
  const windowed = chronological.slice(-trendWindow);
  const healthImprovement = windowed.length > 1 ? Math.round((windowed[windowed.length - 1].body + windowed[windowed.length - 1].mind) / 2) - Math.round((windowed[0].body + windowed[0].mind) / 2) : null;
  const wealthImprovement = windowed.length > 1 ? windowed[windowed.length - 1].wealth - windowed[0].wealth : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {!loading && showImportBanner && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <ImportLocalDataBanner onDone={handleImportDone} />
        </div>
      )}

      {loading ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : !score ? (
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

      {/* ── Welcome bar — light, information-first, replacing the old dark
           gradient hero. Every stat here is real: no fabricated "synced Xm
           ago" timestamp, since we don't track one — just an honest
           signed-in-vs-local status. ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {userImageUrl ? (
            <img src={userImageUrl} alt="" title={userEmail} className="w-11 h-11 rounded-xl object-cover border border-gray-200 dark:border-gray-800 flex-shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-base font-black text-white flex-shrink-0">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{greeting}, {firstName} 👋</h1>
            <p className="text-xs text-gray-400">Here's your health, wealth and life overview.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 rounded-full px-3 py-1.5">
            <CheckCircle2 size={13} /> Synced to your account
          </span>
          {score.date && (
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1.5">
              Last check-in {fmtDate(score.date)}
            </span>
          )}
          {score.streakDays > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-full px-3 py-1.5">
              <Flame size={13} /> {score.streakDays} day streak
            </span>
          )}
          <FocusSelector focus={focus} onChange={handleFocusChange} />
        </div>
      </div>

      {/* ── Row 1 — every real score dimension the algorithm returns, plus
           the overall ring. Same numbers as score.body/mind/wealth/life,
           not a derived split. ── */}
      <div className={`grid gap-4 ${focus === 'both' ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {focus !== 'wealth' && <MiniScoreCard label="Body" icon={<Heart size={14} />} score={score.body} delta={deltaOf(score.body, prevEntry?.body)} series={seriesOf('body')} />}
        {focus !== 'wealth' && <MiniScoreCard label="Mind" icon={<Brain size={14} />} score={score.mind} delta={deltaOf(score.mind, prevEntry?.mind)} series={seriesOf('mind')} />}
        {focus !== 'health' && <MiniScoreCard label="Wealth" icon={<Wallet size={14} />} score={score.wealth} delta={deltaOf(score.wealth, prevEntry?.wealth)} series={wealthSeriesFull} />}
        {focus === 'both' && <MiniScoreCard label="Life" icon={<Leaf size={14} />} score={score.life} delta={deltaOf(score.life, prevEntry?.life)} series={seriesOf('life')} />}
        <WellFiScoreCard overall={score.overall} delta={deltaOf(score.overall, prevEntry?.overall)} archetypeName={score.archetype.name} archetypeEmoji={score.archetype.emoji} series={seriesOf('overall')} />
      </div>

      {/* ── Row 2 — real wealth detail: net worth (assets/liabilities), real
           income vs expenses, and a real self-reported equity split. No
           fabricated portfolio/fund breakdown — we have no broker link. ── */}
      {focus !== 'health' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <NetWorthCard snapshots={netWorthSnapshots ?? []} age={rawInputs?.body?.age} />
          <CashFlowCard finance={rawInputs?.finance ?? null} />
          <EquityAllocationCard finance={rawInputs?.finance ?? null} />
        </div>
      )}

      {/* ── Row 3 — health/wealth overview tiles + the algorithm's own
           top-ranked opportunities (real "why" + real impact estimate, not
           an "AI insights" feature we don't actually have). ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {focus !== 'wealth' && <HealthOverviewCard body={rawInputs?.body ?? null} />}
        {focus !== 'health' && <WealthOverviewCard finance={rawInputs?.finance ?? null} />}
        <TopOpportunitiesCard actions={score.actions} />
      </div>

      {/* ── Row 4 — goals, all 3 roadmap phases at a glance, and the active
           phase's real checklist. ── */}
      <div className="grid lg:grid-cols-3 gap-4 items-stretch">
        <GoalProgressCard goals={goals} focus={focus} />
        <RoadmapProgressCard started={roadmapStarted} progress={roadmapProgress} />
        <div id="upcoming-actions" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Upcoming actions</p>
            {roadmapProgress && <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Phase {roadmapProgress.activePhaseNum}</span>}
          </div>
          {!roadmapStarted ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-400 mb-3">You haven't started your roadmap yet.</p>
              <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Start your roadmap →</Link>
            </div>
          ) : roadmapProgress && roadmapProgress.activePhaseActions.length > 0 ? (
            <div className="space-y-2.5">
              {roadmapProgress.activePhaseActions.slice(0, 4).map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {a.checked
                    ? <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />
                    : <Circle size={17} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />}
                  <p className={`text-xs font-medium leading-tight ${a.checked ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{a.title}</p>
                </div>
              ))}
              <Link href="/roadmap" className="block text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2">View full action plan →</Link>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-2">No active phase yet — take your score to build a roadmap.</p>
          )}
          <LinkBar>
            <LinkChip targetId="roadmap-progress">Part of your Roadmap Progress</LinkChip>
          </LinkBar>
        </div>
      </div>

      <RiskAlertsCard alerts={getRiskAlerts(
        focus === 'wealth' ? null : rawInputs?.body ?? null,
        focus === 'health' ? null : rawInputs?.finance ?? null,
      )} />

      {/* ── Your full picture — detailed trend, achievements, next steps and
           the monthly review, kept as real secondary detail rather than
           competing with the rows above for attention. ── */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 mt-4">Your Full Picture</p>

        <div className="space-y-6">
          <div className="grid lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Health vs. Wealth trend</p>
                <select value={trendWindow} onChange={e => setTrendWindow(Number(e.target.value) as typeof TREND_WINDOWS[number])}
                  className="text-[11px] font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none">
                  {TREND_WINDOWS.map(w => <option key={w} value={w}>Last {w} check-ins</option>)}
                </select>
              </div>
              <HealthWealthTrendChart history={history ?? []} limit={trendWindow} />
              {(healthImprovement != null || wealthImprovement != null) && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {healthImprovement != null && focus !== 'wealth' && (
                    <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/20">
                      <p className="text-[10px] text-gray-400">Health Improvement</p>
                      <p className={`font-mono tabular-nums text-sm font-bold ${healthImprovement >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500'}`}>{healthImprovement > 0 ? '+' : ''}{healthImprovement} points</p>
                    </div>
                  )}
                  {wealthImprovement != null && focus !== 'health' && (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                      <p className="text-[10px] text-gray-400">Wealth Improvement</p>
                      <p className={`font-mono tabular-nums text-sm font-bold ${wealthImprovement >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>{wealthImprovement > 0 ? '+' : ''}{wealthImprovement} points</p>
                    </div>
                  )}
                </div>
              )}
              <Link href="/history" className="block text-center text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-3">Full history →</Link>
            </div>
            <div className="lg:col-span-2"><AchievementsCard achievements={getAchievements(score, history ?? [], roadmapProgress, goals)} /></div>
          </div>

          <NextStepsCard
            dimensions={(() => {
              const focused = score.dimensions.filter(d => dimMatchesFocus(d.id, focus));
              return focused.length > 0 ? focused : score.dimensions;
            })()}
            body={rawInputs?.body ?? null} finance={rawInputs?.finance ?? null}
          />

          <MonthlyReviewBand score={score} />
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 pt-2">
        Your data is private, encrypted, and synced to your account only — sign in on any device and it's all here. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
      </p>
      </div>
      )}
    </div>
  );
}
