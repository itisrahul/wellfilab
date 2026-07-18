'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestScore, getScoreHistory } from '@/lib/scoreStorage';
import { loadRawInputs } from '@/lib/scoreInputs';
import { CALCULATORS, getBySlug } from '@/config/tools';
import { calculateFullScore, type WellFiScore, type Dimension, type BodyInputs, type FinanceInputs } from '@/lib/wellfilab-score';
import { getRelevantAffiliates, type Affiliate } from '@/lib/affiliates';
import {
  DUMMY_QUICK, fmtINR, getDimActions, DIM_CATEGORY_TITLE, HEALTH_TOOL_SLUGS, FINANCE_TOOL_SLUGS,
  BOOK_REC, howEasyTime,
} from '@/lib/roadmapActions';

const CHECKS_KEY = 'wfl_roadmap_checks';
const START_KEY = 'wfl_roadmap_start';

function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export default function RoadmapPage() {
  const [score, setScore] = useState<WellFiScore | null>(null);
  const [history, setHistory] = useState<WellFiScore[]>([]);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [rawInputs, setRawInputs] = useState<{ body: BodyInputs; finance: FinanceInputs } | null>(null);

  useEffect(() => {
    setChecks(loadJSON(CHECKS_KEY, {}));
    setRawInputs(loadRawInputs());
    let started = window.localStorage.getItem(START_KEY);
    Promise.all([getLatestScore(), getScoreHistory()]).then(([s, h]) => {
      setScore(s);
      setHistory(h);
      if (s && !started) {
        started = new Date().toISOString();
        window.localStorage.setItem(START_KEY, started);
      }
      setStartedAt(started);
      setLoading(false);
    });
  }, []);

  const toggleCheck = (id: string) => {
    setChecks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { window.localStorage.setItem(CHECKS_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!score) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
          <p className="text-4xl mb-4">🗺️</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your roadmap needs a score first</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Built from your actual health and financial data. Takes 5 minutes.</p>
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            Get my score →
          </Link>
        </div>
      </div>
    );
  }

  const daysSinceStart = startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 86400000)) : 0;

  const sortedDims = [...score.dimensions].sort((a, b) => a.score - b.score);
  const lowestDim = sortedDims[0];
  const secondDim: Dimension | undefined = sortedDims[1];
  const thirdDim: Dimension | undefined = sortedDims[2];

  const findDim = (id: string) => score.dimensions.find(d => d.id === id);
  const rBody = rawInputs?.body ?? null;
  const rFinance = rawInputs?.finance ?? null;

  // ── Phase 1 actions: algorithm's top actions + 1-2 dimension-specific extras
  const phase1Extras = getDimActions(lowestDim.id, lowestDim, rBody, rFinance).slice(0, 2);
  const phase1AlgoActions = score.actions.slice(0, 3);
  const phase1Total = phase1AlgoActions.length + phase1Extras.length;
  const phase1CheckedCount = phase1AlgoActions.map((_, i) => checks[`p1-alg-${i}`]).filter(Boolean).length
    + phase1Extras.map((_, i) => checks[`p1-extra-${i}`]).filter(Boolean).length;

  const phase2Actions = secondDim ? getDimActions(secondDim.id, secondDim, rBody, rFinance) : [];
  const phase2CheckedCount = phase2Actions.map((_, i) => checks[`p2-${i}`]).filter(Boolean).length;
  const phase2Unlocked = phase1CheckedCount >= 2;

  const phase3Actions = thirdDim ? getDimActions(thirdDim.id, thirdDim, rBody, rFinance) : [];
  const phase3Unlocked = phase2CheckedCount >= 2;

  const totalActions = phase1Total + phase2Actions.length + phase3Actions.length;
  const totalChecked = Object.values(checks).filter(Boolean).length;

  // Only genuinely-annual, non-overlapping impactValue figures — never mixed with
  // the long-term corpus numbers below (those come from trajectories, a separate
  // single source of truth, to avoid two different "what investing is worth" numbers).
  const totalAnnualImpact = [...phase1Extras, ...phase2Actions, ...phase3Actions]
    .reduce((sum, a) => sum + (a.impactValue ?? 0), 0);

  // Estimated score after completing this roadmap — real algorithm, real inputs,
  // targets matched to the actual actions shown above (sleep 7.5h, 4 days/week
  // movement, stress brought down, emergency fund + insurance in place, SIP
  // raised to 15% of income) rather than an invented "your score will improve" claim.
  const projectedScore = rBody && rFinance ? calculateFullScore(
    DUMMY_QUICK,
    { ...rBody, sleepHours: 7.5, exerciseDays: Math.max(rBody.exerciseDays, 4), stressLevel: Math.min(rBody.stressLevel, 4) },
    { ...rFinance, hasEmergencyFund: true, hasInsurance: true, monthlyInvestments: Math.max(rFinance.monthlyInvestments, rFinance.monthlyIncome * 0.15) },
    []
  ) : null;
  const scoreGain = projectedScore ? projectedScore.overall - score.overall : 0;

  // Per-phase score gain — each phase's OWN target lever only, computed independently
  // against the real score (not cumulative), using the same real algorithm as above.
  const scoreGainForDim = (dimId?: string): number | null => {
    if (!dimId || !rBody || !rFinance) return null;
    let adjBody = rBody, adjFinance = rFinance;
    if (dimId === 'sleep') adjBody = { ...rBody, sleepHours: 7.5 };
    else if (dimId === 'movement') adjBody = { ...rBody, exerciseDays: Math.max(rBody.exerciseDays, 4) };
    else if (dimId === 'stress') adjBody = { ...rBody, stressLevel: Math.min(rBody.stressLevel, 4) };
    else if (dimId === 'savings') adjFinance = { ...rFinance, hasEmergencyFund: true };
    else if (dimId === 'investing') adjFinance = { ...rFinance, monthlyInvestments: Math.max(rFinance.monthlyInvestments, rFinance.monthlyIncome * 0.15) };
    else if (dimId === 'debt') adjFinance = { ...rFinance, totalDebt: rFinance.totalDebt * 0.5 };
    else return null;
    const projected = calculateFullScore(DUMMY_QUICK, adjBody, adjFinance, []);
    const gain = projected.overall - score.overall;
    return gain > 0 ? gain : null;
  };
  const phase1ScoreGain = scoreGainForDim(lowestDim.id);
  const phase2ScoreGain = scoreGainForDim(secondDim?.id);
  const phase3ScoreGain = scoreGainForDim(thirdDim?.id);

  const activePhaseNum: 1 | 2 | 3 = phase3Unlocked ? 3 : phase2Unlocked ? 2 : 1;
  const relevantAffiliates = getRelevantAffiliates(score, activePhaseNum, 2);
  const affiliatesForPhase = (n: 1 | 2 | 3) => relevantAffiliates.filter(a => a.showWhen.minPhase === n);

  const trajectories = score.trajectories;
  const current = trajectories?.find(t => t.scenario === 'current');
  const improved = trajectories?.find(t => t.scenario === 'improved');
  const optimal = trajectories?.find(t => t.scenario === 'optimal');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* SECTION 1: Header */}
      <div className="bg-gradient-to-br from-teal-800 to-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-2">Personalised Roadmap</p>
              <h1 className="text-3xl font-extrabold text-white mb-3">Your 90-Day Roadmap</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-2">
                <span className="text-sm font-bold text-white">{score.overall}/100</span>
                <span className="text-white/40">·</span>
                <span className="text-sm">{score.archetype.emoji} {score.archetype.name}</span>
              </div>
              {score.date && <p className="text-xs text-white/40">Last updated: {new Date(score.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
            </div>
            <div className="flex gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[110px]">
                <p className="text-lg font-black text-white">Day {daysSinceStart} <span className="text-xs font-normal text-white/40">of 90</span></p>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (daysSinceStart / 90) * 100)}%` }} />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[110px] text-center">
                <p className="text-lg font-black text-white">{totalChecked} <span className="text-xs font-normal text-white/40">of {totalActions}</span></p>
                <p className="text-[10px] text-white/40">Actions completed</p>
              </div>
              <button onClick={() => window.print()} className="print:hidden self-start bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white/70 hover:text-white transition-colors">
                🖨️ Download / print
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            {score.level === 'full' ? (
              <p className="text-xs text-white/50">Based on your complete health + finance data</p>
            ) : score.level === 'body' ? (
              <>
                <p className="text-xs text-white/50 mb-2">Based on health data</p>
                <Link href="/score" className="inline-block text-xs font-bold text-amber-300 hover:underline">Add finances for full roadmap →</Link>
              </>
            ) : (
              <>
                <p className="text-xs text-white/50 mb-2">Based on quick assessment</p>
                <Link href="/score" className="inline-block text-xs font-bold text-amber-300 hover:underline">Complete your profile for an accurate roadmap →</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* SECTION 2: Root cause diagnosis */}
        <RootCauseCard lowestDim={lowestDim} findDim={findDim} annualHealthCost={score.annualHealthCost} />

        {/* SECTION 2B: What completing this roadmap could do to your score */}
        {projectedScore && scoreGain > 0 && (
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">If you complete this roadmap</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-4xl font-black">{score.overall} → {projectedScore.overall}</p>
                <p className="text-sm text-white/80 mt-1">+{scoreGain} points — from sleeping 7.5h, moving 4 days/week, lower stress, an emergency fund, insurance, and a SIP at 15% of income.</p>
              </div>
            </div>
            <p className="text-[11px] text-white/60 mt-3">Computed with the exact same scoring formula as your real score — not a promise, a projection from these specific target values.</p>
          </div>
        )}

        {/* SECTION 3: Dimension scores */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your dimensions</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {score.dimensions.map(d => (
              <div key={d.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-lg font-black" style={{ color: d.score >= 75 ? '#0d9488' : d.score >= 50 ? '#f59e0b' : '#ef4444' }}>{d.score}</span>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{d.label}</p>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.score}%`, background: d.score >= 75 ? '#0d9488' : d.score >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
                {d.insight && <p className="text-[11px] text-gray-400">{d.insight}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: 90-day roadmap */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your 90-day roadmap</p>

          <PhaseBlock
            label="Right Now" weeks="Weeks 1-2: Start Here" status="active"
            focusLabel={lowestDim.label} subtitle={lowestDim.insight} scoreGain={phase1ScoreGain}
          >
            {phase1AlgoActions.map((a, i) => (
              <ActionCard key={`alg-${i}`} id={`p1-alg-${i}`} checked={!!checks[`p1-alg-${i}`]} onToggle={toggleCheck}
                title={a.title} why={a.why} impact={a.impact} priority={a.howEasy === 'today' ? 'Today' : 'This week'}
                category={a.category === 'health' ? 'Health' : a.category === 'finance' ? 'Finance' : a.category === 'mind' ? 'Mind' : 'Health'}
                timeEstimate={howEasyTime(a.howEasy)}
                toolSlug={a.toolSlug} toolCat={a.toolCat as 'health' | 'finance' | undefined} />
            ))}
            {phase1Extras.map((a, i) => (
              <ActionCard key={`extra-${i}`} id={`p1-extra-${i}`} checked={!!checks[`p1-extra-${i}`]} onToggle={toggleCheck}
                title={a.title} why={a.why} impact={a.impact}
                priority={a.priority} category={a.category} timeEstimate={a.timeEstimate} toolSlug={a.toolSlug} toolCat={a.toolCat} />
            ))}
            {affiliatesForPhase(1).map(a => <AffiliateCard key={a.id} affiliate={a} score={score} />)}
            <PhaseProgress checked={phase1CheckedCount} total={phase1Total} complete={phase1CheckedCount >= phase1Total} nextLabel="Phase 2 is now active." />
          </PhaseBlock>

          <PhaseBlock
            label="Building" weeks="Weeks 3-6: Build On It" status={phase2Unlocked ? 'active' : 'locked'}
            focusLabel={secondDim?.label ?? '—'} subtitle={phase2Unlocked ? secondDim?.insight : 'Complete at least 2 actions in Phase 1 to unlock'} scoreGain={phase2ScoreGain}
          >
            {secondDim && phase2Actions.map((a, i) => (
              <ActionCard key={i} id={`p2-${i}`} checked={!!checks[`p2-${i}`]} onToggle={toggleCheck} disabled={!phase2Unlocked}
                title={a.title} why={a.why} impact={a.impact}
                priority={a.priority} category={a.category} timeEstimate={a.timeEstimate} toolSlug={a.toolSlug} toolCat={a.toolCat} />
            ))}
            {phase2Unlocked && affiliatesForPhase(2).map(a => <AffiliateCard key={a.id} affiliate={a} score={score} />)}
            {secondDim && <PhaseProgress checked={phase2CheckedCount} total={phase2Actions.length} complete={phase2CheckedCount >= phase2Actions.length} nextLabel="Phase 3 is now active." />}
          </PhaseBlock>

          <PhaseBlock
            label="Growing" weeks="Month 2-3: Grow" status={phase3Unlocked ? 'active' : 'locked'}
            focusLabel={thirdDim?.label ?? '—'} subtitle={phase3Unlocked ? 'Strengthening and growth' : 'Complete at least 2 actions in Phase 2 to unlock'} scoreGain={phase3ScoreGain}
            isLast
          >
            {thirdDim && phase3Actions.map((a, i) => (
              <ActionCard key={i} id={`p3-${i}`} checked={!!checks[`p3-${i}`]} onToggle={toggleCheck} disabled={!phase3Unlocked}
                title={a.title} why={a.why} impact={a.impact}
                priority={a.priority} category={a.category} timeEstimate={a.timeEstimate} toolSlug={a.toolSlug} toolCat={a.toolCat} />
            ))}
            {phase3Unlocked && thirdDim && (
              <div className="space-y-3">
                <GrowthRecCard type="book" dim={lowestDim.id} />
                <GrowthRecCard type="tool" dim={lowestDim.id} />
                {affiliatesForPhase(3).map(a => <AffiliateCard key={a.id} affiliate={a} score={score} />)}
              </div>
            )}
          </PhaseBlock>
        </div>

        {/* SECTION 5: Financial impact */}
        {score.level === 'full' && totalAnnualImpact > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">If you complete this roadmap</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">~{fmtINR(totalAnnualImpact)}<span className="text-sm font-normal text-gray-400"> recovered or saved per year</span></p>
            <p className="text-xs text-gray-400">Sum of the recurring annual impacts on the actions above — sleep, movement, stress and subscription savings. Estimates based on your actual income and spending, not averages. Long-term retirement impact from investing is shown separately below, since that's a different kind of number entirely.</p>
          </div>
        )}
        {score.level === 'full' && trajectories && current && improved && optimal && (
          <FinancialImpact current={current} improved={improved} optimal={optimal} score={score} />
        )}

        {/* SECTION 6: Score history */}
        {history.length > 1 && <ScoreHistorySection history={history} />}

        {/* SECTION 7: 90-day timeline */}
        <NinetyDayTimeline daysSinceStart={daysSinceStart} lowestLabel={lowestDim.label} />

        {/* SECTION 7B: Turn this into a tracked goal */}
        <Link href="/goals" className="print:hidden flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 p-5 transition-all group">
          <span className="text-3xl flex-shrink-0">🎯</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Turn this roadmap into a tracked goal</p>
            <p className="text-xs text-gray-400 mt-0.5">Set a target for {lowestDim.label.toLowerCase()} (or anything else) and check your progress monthly.</p>
          </div>
          <span className="flex-shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">Set a goal →</span>
        </Link>

        {/* SECTION 8: Tools for your roadmap */}
        <div className="print:hidden"><ToolsSection lowestDim={lowestDim} secondDim={secondDim} /></div>

        {/* SECTION 9: Upgrade (subtle) */}
        <div className="print:hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">Want this taken further?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto mb-3">
            This roadmap is generated from your score. A personalised plan is created specifically for you — built by a real person, not an algorithm. You can ask questions.
          </p>
          <p className="text-[11px] text-gray-400 mb-4">₹149/month · 48hr delivery · 30-day refund guarantee</p>
          <Link href="/plan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all">
            Get personalised plan →
          </Link>
          <p className="text-[10px] text-gray-400 mt-3">This roadmap is free forever</p>
        </div>

      </div>
    </div>
  );
}

// ── Section 2: Root cause ────────────────────────────────────────────────

function RootCauseCard({ lowestDim, findDim, annualHealthCost }: { lowestDim: Dimension; findDim: (id: string) => Dimension | undefined; annualHealthCost?: number }) {
  const category = ['sleep', 'movement'].includes(lowestDim.id) ? 'body' : lowestDim.id === 'stress' ? 'stress' : 'finance';
  const title = DIM_CATEGORY_TITLE[lowestDim.id] ?? 'Your Starting Point';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-4 border-l-teal-500 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Your starting point</p>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-lg font-black" style={{ color: lowestDim.score >= 50 ? '#f59e0b' : '#ef4444' }}>{lowestDim.score}/100</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{lowestDim.insight}</p>

      {category === 'body' && (
        <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-bold text-gray-800 dark:text-gray-200">Why physical health is your starting point:</p>
          {findDim('stress') && <p>Sleep → Stress: poor sleep raises cortisol. Your stress score of {findDim('stress')!.score}/100 reflects this.</p>}
          {annualHealthCost != null && annualHealthCost > 0 && <p>Sleep → Finances: this costs approximately {fmtINR(annualHealthCost)}/year. Your roadmap fixes this.</p>}
          <p>Sleep → Decisions: sleep deficit increases impulsive decisions by roughly 29%. This directly affects spending patterns.</p>
        </div>
      )}
      {category === 'stress' && (
        <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-bold text-gray-800 dark:text-gray-200">Why stress is your starting point:</p>
          <p>Stress → Spending: high cortisol increases impulse purchases by an estimated 37%.</p>
          <p>Stress → Sleep: {lowestDim.insight} — they reinforce each other in both directions.</p>
          {annualHealthCost != null && annualHealthCost > 0 && <p>Stress → Productivity: estimated financial impact of {fmtINR(annualHealthCost)}/year.</p>}
        </div>
      )}
      {category === 'finance' && (
        <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-bold text-gray-800 dark:text-gray-200">Why financial foundation is your starting point:</p>
          <p>Finance → Sleep: financial stress causes an estimated 40% more night waking. Your sleep score of {findDim('sleep')?.score ?? 'N/A'}/100 may be partially financial in origin.</p>
          <p>Finance → Health decisions: financial pressure leads to cheaper food choices and skipped checkups.</p>
          <p>Finance → Stress: {lowestDim.insight}. Building stability removes background anxiety from everything else.</p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-500 dark:text-gray-400">If this stays unaddressed:</strong>{' '}
        {category === 'body' && 'nothing dramatic happens overnight — the cost compounds quietly, in energy, decisions, and the everyday cortisol load on your other scores, not in a single event.'}
        {category === 'stress' && 'the connection to your sleep and spending tends to stay a closed loop, each one keeping the other from improving on its own.'}
        {category === 'finance' && "the buffer stays thin, so the next unplanned expense lands as a shock instead of an inconvenience — that's the actual risk, not a specific number."}
        {' '}This isn't urgent in a crisis sense — it's worth starting because it compounds, same as the fixes below.
      </div>
    </div>
  );
}

// ── Section 4 pieces ──────────────────────────────────────────────────────

function PhaseBlock({ label, weeks, status, focusLabel, subtitle, scoreGain, children, isLast }: {
  label: string; weeks: string; status: 'active' | 'locked'; focusLabel: string; subtitle?: string;
  scoreGain?: number | null; children: React.ReactNode; isLast?: boolean;
}) {
  const dotColor = status === 'active' ? (label === 'Building' ? 'bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-900/40' : label === 'Growing' ? 'bg-green-500 ring-4 ring-green-100 dark:ring-green-900/40' : 'bg-teal-600 ring-4 ring-teal-100 dark:ring-teal-900/40') : 'bg-gray-300 dark:bg-gray-700';
  const borderColor = status !== 'active' ? 'border-gray-100 dark:border-gray-800' : label === 'Building' ? 'border-amber-300 dark:border-amber-700' : label === 'Growing' ? 'border-green-300 dark:border-green-700' : 'border-teal-300 dark:border-teal-700';

  return (
    <div className="flex gap-4 sm:gap-6">
      <div className="flex flex-col items-center flex-shrink-0 w-4 sm:w-24">
        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${dotColor}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 my-1" />}
        <div className="text-center mt-1 hidden sm:block">
          <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{label}</p>
          <p className="text-[10px] text-gray-400">{weeks.split(':')[0]}</p>
        </div>
      </div>
      <div className={`flex-1 rounded-2xl border p-5 mb-6 bg-white dark:bg-gray-900 ${borderColor} ${status === 'locked' ? 'opacity-60' : ''}`}>
        <p className="sm:hidden text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{weeks}</p>
        <p className="hidden sm:block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{weeks}</p>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Focus: {focusLabel}</p>
          {scoreGain != null && scoreGain > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">+{scoreGain} score pts</span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
        {status === 'locked' ? (
          <p className="text-xs text-gray-400 italic">🔒 Locked — {subtitle}</p>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ id, checked, onToggle, disabled, title, why, impact, priority, category, timeEstimate, toolSlug, toolCat }: {
  id: string; checked: boolean; onToggle: (id: string) => void; disabled?: boolean;
  title: string; why: string; impact: string; priority: 'Today' | 'This week'; category: 'Health' | 'Finance' | 'Mind';
  timeEstimate?: string; toolSlug?: string; toolCat?: 'health' | 'finance';
}) {
  const catStyle = category === 'Health' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
    : category === 'Finance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
  return (
    <label className={`flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:border-teal-300 dark:hover:border-teal-700'} transition-colors`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(id)}
        className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">{priority}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${catStyle}`}>{category}</span>
          {timeEstimate && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500">⏱ {timeEstimate}</span>}
        </div>
        <p className={`text-sm font-bold ${checked ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{why}</p>
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">{impact}</p>
        {toolSlug && toolCat && (
          <Link href={`/tools/${toolCat}/${toolSlug}`} onClick={e => e.stopPropagation()} className="inline-block text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 underline mt-1.5">
            Try the tool →
          </Link>
        )}
      </div>
    </label>
  );
}

function PhaseProgress({ checked, total, complete, nextLabel }: { checked: number; total: number; complete: boolean; nextLabel: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-gray-400">{checked} of {total} actions done</p>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${total ? (checked / total) * 100 : 0}%` }} />
      </div>
      {complete && total > 0 && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-bold">
          Phase complete 🎉 {nextLabel}
        </div>
      )}
    </div>
  );
}

function GrowthRecCard({ type, dim }: { type: 'book' | 'tool'; dim: string }) {
  const isFinance = ['savings', 'investing', 'debt'].includes(dim);
  const isStress = dim === 'stress';

  if (type === 'book') {
    const book = isStress ? BOOK_REC.stress : isFinance ? BOOK_REC.finance : BOOK_REC.body;
    return (
      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">📖 Recommended reading</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{book.title} — {book.author}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{book.note}</p>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">🔧 Recommended next step</p>
      {isFinance ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">A broker or investing app for index fund SIPs — see the tools section below.</p>
      ) : isStress ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">10-minute morning walks — no app needed.</p>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Track your nutrition alongside your training.</p>
          <Link href="/tools/health/calories" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Try the Calorie Calculator →</Link>
        </>
      )}
    </div>
  );
}

// ── Affiliate card ─────────────────────────────────────────────────────

function AffiliateCard({ affiliate, score }: { affiliate: Affiliate; score: WellFiScore }) {
  const dim = score.dimensions.find(d => d.id === affiliate.showWhen.dimensionId);
  return (
    <div className="print:hidden bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 border-l-4 border-l-teal-500 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-lg">{affiliate.logo}</span>
        <span className="font-bold text-sm text-gray-900 dark:text-white">{affiliate.name}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">Recommended tool</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{affiliate.tagline}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
        {dim ? `Your ${dim.label.toLowerCase()} score is ${dim.score}/100. ` : ''}{affiliate.whyRecommend}
      </p>
      <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all">
        {affiliate.cta}
      </a>
      <p className="text-[10px] text-gray-400 mt-2">
        This is an affiliate link — we earn a small commission if you sign up, at no cost to you. We only recommend tools we believe in.
      </p>
    </div>
  );
}

// ── Section 5: Financial impact ─────────────────────────────────────────

function FinancialImpact({ current, improved, optimal, score }: {
  current: { netWorthAt60: number; monthlyPassiveIncome: number }; improved: { netWorthAt60: number; monthlyPassiveIncome: number; keyChange: string };
  optimal: { netWorthAt60: number; monthlyPassiveIncome: number }; score: WellFiScore;
}) {
  const [open, setOpen] = useState(false);
  const maxNW = Math.max(current.netWorthAt60, improved.netWorthAt60, optimal.netWorthAt60, 1);
  const diff = improved.netWorthAt60 - current.netWorthAt60;

  return (
    <div className="bg-gray-950 rounded-2xl p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">What following this roadmap is worth</p>
      <p className="text-2xl font-black mt-3 mb-6">Following this roadmap = {fmtINR(diff)} more at retirement</p>

      <div className="space-y-4 mb-4">
        {[
          { label: 'Current path', nw: current.netWorthAt60, pi: current.monthlyPassiveIncome, bar: 'bg-gray-600', width: (current.netWorthAt60 / maxNW) * 100 },
          { label: 'Follow roadmap', nw: improved.netWorthAt60, pi: improved.monthlyPassiveIncome, bar: 'bg-teal-500', width: (improved.netWorthAt60 / maxNW) * 100 },
          { label: 'Full potential', nw: optimal.netWorthAt60, pi: optimal.monthlyPassiveIncome, bar: 'bg-green-500', width: (optimal.netWorthAt60 / maxNW) * 100 },
        ].map(row => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/70">{row.label}</span>
              <span className="font-bold">{fmtINR(row.nw)} · {fmtINR(row.pi)}/mo passive</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.width}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setOpen(!open)} className="text-xs font-bold text-white/70 hover:text-white underline">
        How is this calculated? {open ? '▲' : '▼'}
      </button>
      {open && (
        <p className="text-xs text-white/60 mt-2 bg-white/5 rounded-lg p-3">
          Based on your income, current savings, and {improved.keyChange.toLowerCase()}, projected at 12% average annual return over your remaining working years.
        </p>
      )}
    </div>
  );
}

// ── Section 6: Score history ─────────────────────────────────────────────

function ScoreHistorySection({ history }: { history: WellFiScore[] }) {
  const sorted = [...history].filter(h => h.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  const [latest, prev] = sorted;
  const change = latest && prev ? latest.overall - prev.overall : null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Score history</p>
      {change != null && change !== 0 && (
        <div className={`mb-3 px-4 py-2.5 rounded-xl text-sm font-bold ${change > 0 ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'}`}>
          {change > 0 ? `↑ +${change} points since your last assessment` : `↓ ${Math.abs(change)} points. Check which dimension changed and why.`}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
        {sorted.slice(0, 6).map((h, i) => {
          const next = sorted[i + 1];
          const delta = next ? h.overall - next.overall : null;
          return (
            <div key={h.id ?? i} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-gray-400">{new Date(h.date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{h.overall}/100</span>
                {delta != null && delta !== 0 && (
                  <span className={`text-xs font-bold ${delta > 0 ? 'text-green-500' : 'text-red-500'}`}>{delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section 7: 90-day timeline ────────────────────────────────────────────

function NinetyDayTimeline({ daysSinceStart, lowestLabel }: { daysSinceStart: number; lowestLabel: string }) {
  const pct = Math.min(100, (daysSinceStart / 90) * 100);
  const milestone = (day: number, threshold: number, label: string) =>
    daysSinceStart >= threshold
      ? <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">{label} →</Link>
      : <p className="text-xs text-gray-400">In {day - daysSinceStart} days</p>;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your 90-day journey</p>
      <div className="relative h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-2">
        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-teal-600 border-2 border-white dark:border-gray-950" style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-6">
        <span>Day 1</span><span>Day {daysSinceStart}</span><span>Day 90</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">Day 1-14 · Phase 1</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Working on: {lowestLabel}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">In progress</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Day 30 · First check-in</p>
          {milestone(30, 28, 'Retake score now')}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Day 60 · Mid-point</p>
          {milestone(60, 58, 'Mid-point check-in')}
        </div>
      </div>
      <div className="mt-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Day 90 · Full review</p>
        {milestone(90, 88, '90-day review')}
      </div>
    </div>
  );
}

// ── Section 8: Tools ───────────────────────────────────────────────────

function ToolsSection({ lowestDim, secondDim }: { lowestDim: Dimension; secondDim?: Dimension }) {
  const isHealthDim = (id: string) => ['sleep', 'movement', 'stress'].includes(id);
  const healthNeeded = isHealthDim(lowestDim.id) || (secondDim && isHealthDim(secondDim.id));
  const financeNeeded = !isHealthDim(lowestDim.id) || (secondDim && !isHealthDim(secondDim.id));

  const slugs = [
    ...(healthNeeded ? HEALTH_TOOL_SLUGS : []),
    ...(financeNeeded ? FINANCE_TOOL_SLUGS : []),
  ].slice(0, 6);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tools for your roadmap</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slugs.map(slug => {
          const tool = getBySlug(slug) ?? CALCULATORS.find(c => c.slug === slug);
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
  );
}
