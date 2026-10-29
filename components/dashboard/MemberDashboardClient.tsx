'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { Flame } from 'lucide-react';
import { scoreColor, scoreLabel } from '@/lib/wellfilab-score';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { getScoreHistory } from '@/lib/scoreStorage';
import { syncScoreInputsFromAccount } from '@/lib/scoreInputs';
import { getGoals } from '@/lib/goalsStorage';
import { getSnapshots, syncNetWorthGoal } from '@/lib/netWorthHistory';
import { getRiskAlerts } from '@/lib/riskAlerts';
import { computeRoadmapProgress } from '@/lib/roadmapProgress';
import { getAchievements } from '@/lib/achievements';
import { dimMatchesFocus } from '@/lib/scoreFocus';
import { syncRoadmapChecksFromAccount, toggleRoadmapCheck, type RoadmapChecks } from '@/lib/roadmapChecks';
import { hasUnimportedLocalData } from '@/lib/accountImport';
import { getTodayCheckin } from '@/lib/dashboardCheckins';
import { fmtINR } from '@/lib/roadmapActions';
import { SWR_KEYS } from '@/lib/swrKeys';
import { RecentToolsBanner } from '@/components/ui/RecentToolsBanner';
import { ImportLocalDataBanner } from './ImportLocalDataBanner';
import { CheckinCard } from './CheckinCard';
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { AchievementsCard } from './AchievementsCard';
import { NextStepsCard } from './NextStepsCard';
import { MonthlyReviewBand } from './MonthlyReviewBand';

// recharts is heavy — load it only on the client, same pattern every
// calculator widget already uses.
const HealthWealthTrendChart = dynamic(
  () => import('./HealthWealthTrendChart').then(m => m.HealthWealthTrendChart),
  { ssr: false, loading: () => <div className="h-60 animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

const TABS = [
  { label: 'Today', href: '#top' },
  { label: 'Health', href: '#health' },
  { label: 'Money', href: '#money' },
  { label: 'Score', href: '/score' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Goals', href: '/goals' },
];

/** Refetches every account data source — used after the one-time import
 * banner completes, since it may have just written into all of them. */
function refreshAllAccountData() {
  return Promise.all([
    mutate(SWR_KEYS.scoreHistory), mutate(SWR_KEYS.goals), mutate(SWR_KEYS.netWorthSnapshots),
    mutate(SWR_KEYS.roadmapChecks), mutate(SWR_KEYS.scoreInputs),
  ]);
}

function RingCard({ label, score, delta, note }: { label: string; score: number; delta?: number; note: string }) {
  const color = scoreColor(score);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 text-center">
      <div className="relative mx-auto" style={{ width: 68, height: 68 }}>
        <ScoreRing pct={score} color={color} size={68} thick={7} />
        <div className="absolute inset-0 flex items-center justify-center font-mono tabular-nums font-black text-base text-gray-900 dark:text-white">{score}</div>
      </div>
      <p className="font-bold text-sm text-gray-900 dark:text-white mt-2">{label}</p>
      {delta != null && (
        <p className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{delta >= 0 ? '+' : ''}{delta} this month</p>
      )}
      <p className="text-xs text-gray-400">{note}</p>
    </div>
  );
}

function Metric({ label, value, pct, color, note }: { label: string; value: string; pct: number; color: string; note: string }) {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3.5 bg-gray-50 dark:bg-gray-800/60">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight my-0.5">{value}</p>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden my-2"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(2, pct))}%`, backgroundColor: color }} /></div>
      <p className="text-xs text-gray-400">{note}</p>
    </div>
  );
}

export function MemberDashboardClient({ userName, userImageUrl }: Props) {
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [roadmapStarted, setRoadmapStarted] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<ReturnType<typeof getTodayCheckin>>(null);
  const firstName = userName.split(' ')[0];

  const { data: history, isLoading: historyLoading } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const { data: rawGoals, isLoading: goalsLoading } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: netWorthSnapshots, isLoading: snapshotsLoading } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const { data: cachedChecks, isLoading: roadmapLoading, mutate: mutateChecks } = useSWR(SWR_KEYS.roadmapChecks, syncRoadmapChecksFromAccount);
  const { data: rawInputs, isLoading: inputsLoading } = useSWR(SWR_KEYS.scoreInputs, syncScoreInputsFromAccount);
  const [checks, setChecks] = useState<RoadmapChecks>({});

  const loading = historyLoading || goalsLoading || snapshotsLoading || roadmapLoading || inputsLoading;
  const score = history?.[0] ?? null;

  const goals = useMemo(
    () => (rawGoals ?? []).map(g => syncNetWorthGoal(g, netWorthSnapshots ?? [])),
    [rawGoals, netWorthSnapshots]
  );

  useEffect(() => {
    setShowImportBanner(hasUnimportedLocalData());
    setRoadmapStarted(typeof window !== 'undefined' && !!window.localStorage.getItem('wfl_roadmap_start'));
    setTodayCheckin(getTodayCheckin());
  }, []);

  useEffect(() => {
    if (cachedChecks) setChecks(cachedChecks);
  }, [cachedChecks]);

  // Same optimistic-update pattern as app/roadmap/page.tsx — toggle the
  // real check, update local state immediately, and push the result into
  // the shared SWR cache (no refetch) so other mounted views stay in sync.
  const toggleCheck = (id: string) => {
    setChecks(prev => {
      const next = toggleRoadmapCheck(prev, id);
      mutateChecks(next, false);
      return next;
    });
  };

  useEffect(() => {
    if (score && typeof window !== 'undefined' && !window.localStorage.getItem('wfl_roadmap_start')) {
      window.localStorage.setItem('wfl_roadmap_start', new Date().toISOString());
      setRoadmapStarted(true);
    }
  }, [score]);

  const handleImportDone = () => {
    setShowImportBanner(false);
    refreshAllAccountData();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const roadmapProgress = score
    ? computeRoadmapProgress(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, checks, 'both')
    : null;
  const actionsLeftToday = roadmapProgress ? roadmapProgress.activePhaseActions.filter(a => !a.checked).length : 0;

  const prevEntry = history && history.length > 1 ? history[1] : null;
  const prevValid = !!(prevEntry && score && prevEntry.scoreVersion === score.scoreVersion);
  const deltaOf = (curr?: number, prev?: number) => prevValid && curr != null && prev != null ? curr - prev : undefined;

  const chronological = (history ?? []).slice().reverse();
  const netWorthChart = (netWorthSnapshots ?? []).slice(-6);
  const latestNetWorth = netWorthChart.length > 0 ? netWorthChart[netWorthChart.length - 1] : null;
  const netWorthDelta = netWorthChart.length > 1 ? latestNetWorth!.netWorth - netWorthChart[0].netWorth : null;
  const savedPerMonth = rawInputs?.finance ? Math.max(0, rawInputs.finance.monthlyIncome - rawInputs.finance.monthlyExpenses) : null;
  const savingsRatePct = rawInputs?.finance && rawInputs.finance.monthlyIncome > 0
    ? Math.round(((rawInputs.finance.monthlyIncome - rawInputs.finance.monthlyExpenses) / rawInputs.finance.monthlyIncome) * 100) : null;
  const sipGoal = goals.find(g => g.type === 'sip-target');
  const emergencyGoal = goals.find(g => g.type === 'emergency-fund');
  const weightGoal = goals.find(g => g.type === 'weight');

  // A real, grounded coach line — the dimension with the largest real drop
  // since the last check-in, named plainly. No invented causal narrative
  // ("stress is cutting your sleep") we can't actually verify from the data.
  const coachLine = useMemo(() => {
    if (!score || !prevValid || !prevEntry) return null;
    const dims: { label: string; delta: number }[] = [
      { label: 'Body', delta: score.body - prevEntry.body },
      { label: 'Mind', delta: score.mind - prevEntry.mind },
      { label: 'Wealth', delta: score.wealth - prevEntry.wealth },
    ];
    const worst = dims.reduce((a, b) => (b.delta < a.delta ? b : a));
    if (worst.delta >= 0) return null;
    return `Your ${worst.label} score dropped ${Math.abs(worst.delta)} point${Math.abs(worst.delta) === 1 ? '' : 's'} since your last check-in. That's the area with the most room to recover first.`;
  }, [score, prevEntry, prevValid]);

  const weight = rawInputs?.body?.weight;

  return (
    <div id="top" className="min-h-screen bg-gray-50/60 dark:bg-gray-950 scroll-smooth">

      {!loading && showImportBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <ImportLocalDataBanner onDone={handleImportDone} />
        </div>
      )}

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : !score ? (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't taken your WellFiLab Score yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Answer 3 quick questions and get your score, archetype, and a personalised action plan in under a minute.
          </p>
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-[#04211E] font-semibold text-sm transition-colors">
            Get my score →
          </Link>
          <RecentToolsBanner className="mt-10" />
        </div>
      ) : (
        <>
        {/* ── Sub-nav — Today stays on this page; Health/Money scroll to
             their section below; Goals/Roadmap are the real dedicated pages. ── */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <a key={t.label} href={t.href}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  t.label === 'Today' ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
                }`}>
                {t.label}
              </a>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* ── Welcome band — the one deliberately-dark band regardless of
               theme, same role as a dark CTA band on an otherwise light
               page; everything else below is fully theme-adaptive. ── */}
          <div className="bg-[#0F2A27] rounded-xl p-6 flex flex-wrap justify-between items-center gap-5">
            <div className="flex items-center gap-3">
              {userImageUrl ? (
                <img src={userImageUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/20 flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center text-base font-black text-[#04211E] flex-shrink-0">{firstName.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-white leading-tight">{greeting}, {firstName}</h1>
                <p className="text-sm text-[#93ADA8]">{dateLabel} · {actionsLeftToday} action{actionsLeftToday === 1 ? '' : 's'} left today</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="bg-white/5 rounded-lg px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xl font-black text-teal-300 tabular-nums leading-none">{score.overall}</p>
                <p className="text-[11px] text-[#93ADA8] mt-1">Overall score</p>
              </div>
              <div className="bg-white/5 rounded-lg px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xl font-black text-teal-300 flex items-center justify-center gap-1 leading-none">{score.streakDays > 0 && <Flame size={15} />}{score.streakDays}</p>
                <p className="text-[11px] text-[#93ADA8] mt-1">{score.streakDays === 1 ? 'Day' : 'Days'} streak</p>
              </div>
              {deltaOf(score.overall, prevEntry?.overall) != null && (
                <div className="bg-white/5 rounded-lg px-4 py-2.5 text-center min-w-[88px]">
                  <p className="text-xl font-black text-teal-300 tabular-nums leading-none">{deltaOf(score.overall, prevEntry?.overall)! > 0 ? '+' : ''}{deltaOf(score.overall, prevEntry?.overall)}</p>
                  <p className="text-[11px] text-[#93ADA8] mt-1">Since last check-in</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="grid gap-5 min-w-0">

              {/* ── Score rings ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <RingCard label="Body" score={score.body} delta={deltaOf(score.body, prevEntry?.body)} note={scoreLabel(score.body)} />
                <RingCard label="Mind" score={score.mind} delta={deltaOf(score.mind, prevEntry?.mind)} note={scoreLabel(score.mind)} />
                <RingCard label="Wealth" score={score.wealth} delta={deltaOf(score.wealth, prevEntry?.wealth)} note={scoreLabel(score.wealth)} />
                <RingCard label="Life" score={score.life} delta={deltaOf(score.life, prevEntry?.life)} note={scoreLabel(score.life)} />
              </div>

              <CheckinCard initial={todayCheckin} />

              {/* ── Today's actions — real roadmap checklist ── */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Today's actions</p>
                  <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Full roadmap →</Link>
                </div>
                {!roadmapStarted ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-400 mb-3">You haven't started your roadmap yet.</p>
                    <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Start your roadmap →</Link>
                  </div>
                ) : roadmapProgress && roadmapProgress.activePhaseActions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {roadmapProgress.activePhaseActions.map(a => (
                        <label key={a.id} className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={a.checked} onChange={() => toggleCheck(a.id)}
                            className="w-[18px] h-[18px] mt-0.5 accent-teal-600 flex-shrink-0" />
                          <p className={`text-sm font-medium leading-tight ${a.checked ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{a.title}</p>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-4 mb-1.5">
                      <span>Phase {roadmapProgress.activePhaseNum} of your roadmap</span>
                      <span>{roadmapProgress.activePhaseChecked} of {roadmapProgress.activePhaseTotal} done</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${roadmapProgress.activePhaseTotal > 0 ? (roadmapProgress.activePhaseChecked / roadmapProgress.activePhaseTotal) * 100 : 0}%` }} /></div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 py-2">No active phase yet — take your score to build a roadmap.</p>
                )}
              </div>

              {/* ── Health ── */}
              <div id="health" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 scroll-mt-16">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Health</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Metric label="Sleep" value={rawInputs?.body?.sleepHours != null ? `${rawInputs.body.sleepHours} h` : '—'}
                    pct={rawInputs?.body?.sleepHours != null ? (rawInputs.body.sleepHours / 8) * 100 : 0} color="#a78bfa"
                    note={rawInputs?.body?.sleepHours != null ? (rawInputs.body.sleepHours >= 7.5 ? 'On target' : `${(7.5 - rawInputs.body.sleepHours).toFixed(1)}h below your goal`) : 'Add on the score'} />
                  <Metric label="Movement" value={rawInputs?.body?.exerciseDays != null ? `${rawInputs.body.exerciseDays} days` : '—'}
                    pct={rawInputs?.body?.exerciseDays != null ? (rawInputs.body.exerciseDays / 4) * 100 : 0} color="#0d9488"
                    note="Goal is 4 days a week" />
                  <Metric label="Stress" value={rawInputs?.body?.stressLevel != null ? `${rawInputs.body.stressLevel} / 10` : '—'}
                    pct={rawInputs?.body?.stressLevel != null ? rawInputs.body.stressLevel * 10 : 0} color={rawInputs?.body?.stressLevel != null && rawInputs.body.stressLevel >= 7 ? '#ef4444' : '#f59e0b'}
                    note={rawInputs?.body?.stressLevel != null && rawInputs.body.stressLevel >= 7 ? 'High. Fix this first' : 'Manageable'} />
                  <Metric label="Weight" value={weight != null ? `${weight} kg` : '—'}
                    pct={weightGoal && weight != null ? Math.min(100, Math.max(0, ((weightGoal.startValue - weight) / (weightGoal.startValue - weightGoal.target || 1)) * 100)) : 0}
                    color="#f59e0b"
                    note={weightGoal ? `Goal: ${weightGoal.target} kg` : weight != null ? 'No weight goal set' : 'Add on the score'} />
                </div>
              </div>

              {/* ── Money ── */}
              <div id="money" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 scroll-mt-16">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Money</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3.5 bg-gray-50 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-400">Net worth</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white my-0.5">{latestNetWorth ? fmtINR(latestNetWorth.netWorth) : '—'}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{netWorthDelta != null ? `${netWorthDelta >= 0 ? '+' : ''}${fmtINR(netWorthDelta)} this period` : 'Add a snapshot'}</p>
                  </div>
                  <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3.5 bg-gray-50 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-400">Saved each month</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white my-0.5">{savedPerMonth != null ? fmtINR(savedPerMonth) : '—'}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">{savingsRatePct != null ? `${savingsRatePct}% of income` : 'Add on the score'}</p>
                  </div>
                  <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3.5 bg-gray-50 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-400">Monthly SIP</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white my-0.5">{rawInputs?.finance?.monthlyInvestments != null ? fmtINR(rawInputs.finance.monthlyInvestments) : '—'}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{sipGoal ? `Target ${fmtINR(sipGoal.target)}` : 'No SIP goal set'}</p>
                  </div>
                </div>

                {netWorthChart.length > 1 && (
                  <div className="mb-5">
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Net worth, last {netWorthChart.length} snapshots</p>
                    </div>
                    <div className="flex items-end gap-2" style={{ height: 70 }}>
                      {netWorthChart.map((s, i) => {
                        const max = Math.max(...netWorthChart.map(x => x.netWorth), 1);
                        return (
                          <div key={s.id} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="w-full rounded-t-sm bg-teal-500 transition-all duration-500" style={{ height: `${Math.max(4, (s.netWorth / max) * 100)}%`, opacity: i === netWorthChart.length - 1 ? 1 : 0.55 }} />
                            <span className="text-[9px] text-gray-400">{new Date(s.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {latestNetWorth && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center py-2.5">
                      <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Assets</p></div>
                      <p className="font-bold text-gray-900 dark:text-white">{fmtINR(latestNetWorth.assets)}</p>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Liabilities</p></div>
                      <p className="font-bold text-red-400">−{fmtINR(latestNetWorth.liabilities)}</p>
                    </div>
                    {emergencyGoal && (
                      <div className="flex justify-between items-center py-2.5">
                        <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Emergency fund</p><p className="text-xs text-gray-400">Goal progress</p></div>
                        <p className="font-bold text-gray-900 dark:text-white">{Math.round((emergencyGoal.current / emergencyGoal.target) * 100)}% of {fmtINR(emergencyGoal.target)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <GoalProgressCard goals={goals} />
              <RiskAlertsCard alerts={getRiskAlerts(rawInputs?.body ?? null, rawInputs?.finance ?? null)} />
            </div>

            {/* ── Sidebar — Coach + real detail, no fabricated AI reasoning
                 or integrations (Connect Accounts intentionally deferred). ── */}
            <div className="grid gap-5 content-start">
              <div className="bg-[#0F2A27] rounded-xl p-5">
                <p className="text-sm font-bold text-white mb-2.5">Coach</p>
                {coachLine ? (
                  <p className="text-sm text-[#C5D6D2] leading-relaxed">{coachLine}</p>
                ) : (
                  <p className="text-sm text-[#C5D6D2] leading-relaxed">No real drop to flag right now — keep checking in to build a trend worth reading.</p>
                )}
                <div className="grid gap-2 mt-4">
                  <Link href="/roadmap" className="block text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white transition-colors">What should I fix first?</Link>
                  <Link href="/history" className="block text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white transition-colors">Show my score history</Link>
                </div>
              </div>

              <AchievementsCard achievements={getAchievements(score, history ?? [], roadmapProgress, goals)} />
            </div>
          </div>

          {/* ── Secondary detail — trend chart, next steps, monthly review ── */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-5">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Health vs. Wealth trend</p>
              <HealthWealthTrendChart history={history ?? []} limit={10} />
              <Link href="/history" className="block text-center text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-3">Full history →</Link>
            </div>

            <NextStepsCard
              dimensions={(() => {
                const focused = score.dimensions.filter(d => dimMatchesFocus(d.id, 'both'));
                return focused.length > 0 ? focused : score.dimensions;
              })()}
              body={rawInputs?.body ?? null} finance={rawInputs?.finance ?? null}
            />

            <MonthlyReviewBand score={score} />
          </div>

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Your data is private, encrypted, and synced to your account only — sign in on any device and it's all here. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
        </>
      )}
    </div>
  );
}
