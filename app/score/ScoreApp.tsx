'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HWT_URL } from '@/config/site';
import { QuizModal }     from './QuizModal';
import { ResultsShare }  from './ResultsShare';
import { EmailCapture }  from './EmailCapture';
import { TrendChart }    from './TrendChart';
import { CompareInvite, CompareResult } from './CompareCard';
import { Ring, Bar, Card, SectionLabel } from './components';
import { calcScore, getProfile, getActions } from './scoring';
import { recordScore, getTrendSummary, clearHistory, type ScoreSnapshot } from './trendTracking';
import { decodeCompareLink, type CompareSnapshot } from './compareLink';
import { DIMS, ARTICLES } from './data';
import type { Answer, ScoreResult, Profile } from './types';

type Screen = 'landing' | 'quiz' | 'results';

export function ScoreApp() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [prof,   setProf]   = useState<Profile   | null>(null);
  const [history, setHistory] = useState<ScoreSnapshot[]>([]);
  const [friend, setFriend] = useState<CompareSnapshot | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const vs = searchParams.get('vs');
    if (vs) {
      const decoded = decodeCompareLink(vs);
      if (decoded) setFriend(decoded);
    }
  }, [searchParams]);

  const handleComplete = (answers: Answer[]) => {
    const r = calcScore(answers);
    const p = getProfile(r.health, r.wealth, r.overall);
    const h = recordScore(r);
    setResult(r);
    setProf(p);
    setHistory(h);
    setScreen('results');
  };

  const restart = () => { setScreen('landing'); setResult(null); setProf(null); };

  // ── LANDING ───────────────────────────────────────────────────────────────
  if (screen === 'landing') return (
    <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#0d4a45 50%,#0f172a 100%)', minHeight:'calc(100vh - 100px)' }}>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8"
          style={{ background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.28)', color:'#5eead4' }}>
          ⭐ WellFiLab Signature Feature
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
          Check Your Life Balance Score
        </h1>

        <p className="text-lg mb-3 max-w-2xl mx-auto leading-relaxed" style={{ color:'#94a3b8' }}>
          Most people optimise either health <em>or</em> money. The truly fulfilled do both.
          Discover exactly where you stand — and what to fix first.
        </p>
        <p className="text-sm mb-12" style={{ color:'#475569' }}>24 questions · 6 dimensions · Instant results · Free · Private</p>

        {friend && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm mb-8"
            style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.28)', color:'#fcd34d' }}>
            🤝 {friend.name} sent you their score ({friend.overall}/100) — take the quiz to see how you compare.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-12">
          {DIMS.map(d => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
              <span className="text-2xl">{d.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">{d.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color:'#475569' }}>{d.type==='health'?'❤️ Health':'💰 Wealth'}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setScreen('quiz')}
          className="px-10 py-4 font-black text-lg rounded-2xl text-white transition-all hover:scale-105"
          style={{ background:'linear-gradient(90deg,#0d9488,#0891b2)', boxShadow:'0 0 40px rgba(13,148,136,0.35)' }}>
          Get My Score →
        </button>
        <p className="text-xs mt-4" style={{ color:'#334155' }}>Your quiz answers stay in your browser. Results can optionally be saved with your email for a 90-day check-in.</p>

        <div className="flex items-center justify-center gap-8 mt-16 text-sm" style={{ color:'#475569' }}>
          <span><strong className="text-teal-400">24</strong> questions</span>
          <span className="w-1 h-1 rounded-full inline-block" style={{ background:'#334155' }} />
          <span><strong className="text-teal-400">6</strong> dimensions</span>
          <span className="w-1 h-1 rounded-full inline-block" style={{ background:'#334155' }} />
          <span><strong className="text-teal-400">~5 min</strong> average</span>
        </div>
      </div>
    </div>
  );

  // ── QUIZ (full-screen modal, overlays everything) ─────────────────────────
  if (screen === 'quiz') return (
    <>
      {/* Landing stays mounted behind modal so scroll position is preserved */}
      <div style={{ background:'#0f172a', minHeight:'calc(100vh - 100px)' }} />
      <QuizModal onComplete={handleComplete} onClose={() => setScreen('landing')} />
    </>
  );

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (!result || !prof) return null;
  const acts  = getActions(result.dims);
  const worst = [...result.dims].sort((a,b) => a.pct - b.pct)[0];
  const best  = [...result.dims].sort((a,b) => b.pct - a.pct)[0];
  const scoreColor = result.overall >= 70 ? '#10b981' : result.overall >= 50 ? '#14b8a6' : result.overall >= 35 ? '#f59e0b' : '#ef4444';
  const trend = getTrendSummary(history);

  return (
    <div style={{ background:'#0f172a', minHeight:'calc(100vh - 100px)' }}>

      {/* Hero */}
      <div className="px-4 pt-12 pb-20 text-center text-white relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#0f172a,#0d4a45,#0f172a)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%,rgba(20,184,166,0.1) 0%,transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto">

          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:'rgba(255,255,255,0.35)' }}>
            Your Health-Wealth Score
          </p>

          <div className="relative inline-flex items-center justify-center mb-4">
            <Ring pct={result.overall} size={160} thick={14} color={scoreColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{result.overall}</span>
              <span className="text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>/100</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">{prof.emoji}</span>
            <h1 className="text-3xl font-black">{prof.name}</h1>
          </div>
          <p className="text-base max-w-md mx-auto mb-6 leading-relaxed" style={{ color:'rgba(255,255,255,0.6)' }}>{prof.summary}</p>

          <div className="inline-flex items-center gap-6 px-6 py-4 rounded-2xl"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
            {[
              { label:'Health', value:result.health, color: result.health>=65?'#34d399':'#fb923c' },
              { label:'Balance', value:result.balance, color:'#e2e8f0' },
              { label:'Wealth', value:result.wealth, color: result.wealth>=65?'#fbbf24':'#fb923c' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-4">
                {i>0 && <div style={{ width:1, height:32, background:'rgba(255,255,255,0.12)' }} />}
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color:item.color }}>{item.value}</p>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.35)' }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 pb-20 space-y-5">

        {/* Priority */}
        <Card>
          <SectionLabel>🎯 Priority</SectionLabel>
          <p className="text-white text-sm leading-relaxed">{prof.action}</p>
          {Math.abs(result.health - result.wealth) > 20 && (
            <div className="mt-3 px-3 py-2 rounded-xl text-xs leading-relaxed"
              style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', color:'#fcd34d' }}>
              ⚠️ Your health and wealth scores differ by {Math.abs(result.health - result.wealth)} points.
              {result.health > result.wealth ? ' Financial stress will eventually impact your health.' : ' Poor health will eventually cost you financially.'}
            </div>
          )}
        </Card>

        {/* Trend — only renders once a second result exists on this device */}
        {trend.hasHistory && trend.delta && (
          <Card>
            <SectionLabel>📈 Since Your Last Check-In{trend.daysSincePrevious !== null ? ` (${trend.daysSincePrevious} days ago)` : ''}</SectionLabel>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {([
                { label: 'Overall', value: trend.delta.overall },
                { label: 'Health',  value: trend.delta.health },
                { label: 'Wealth',  value: trend.delta.wealth },
              ] as const).map(item => (
                <div key={item.label} className="text-center rounded-xl py-3" style={{ background:'rgba(255,255,255,0.03)' }}>
                  <p className="text-xl font-black" style={{ color: item.value > 0 ? '#34d399' : item.value < 0 ? '#f87171' : '#94a3b8' }}>
                    {item.value > 0 ? '+' : ''}{item.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color:'#475569' }}>{item.label}</p>
                </div>
              ))}
            </div>
            <TrendChart history={history} />
            <p className="text-xs text-center mt-4" style={{ color:'#334155' }}>
              Stored on this device only · {history.length} check-in{history.length === 1 ? '' : 's'} ·{' '}
              <button onClick={() => { clearHistory(); setHistory([]); }} className="underline hover:opacity-70 transition-opacity">
                Clear history
              </button>
            </p>
          </Card>
        )}

        {/* Comparison — shown if this user arrived via a friend's ?vs= link */}
        {friend && <CompareResult result={result} friend={friend} />}

        {/* Invite to compare — lets this user generate their own link to send */}
        <CompareInvite result={result} profile={prof} />

        {/* Dimension breakdown */}
        <div>
          <SectionLabel>Dimension Breakdown</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {result.dims.map(d => (
              <Card key={d.dim.id} className="!p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{d.dim.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{d.dim.label}</p>
                      <p className="text-[10px]" style={{ color:'#475569' }}>{d.dim.type==='health'?'❤️ Health':'💰 Wealth'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">{d.pct}</span>
                    <span className="text-xs ml-0.5" style={{ color:'#475569' }}>/100</span>
                  </div>
                </div>
                <Bar pct={d.pct} color={d.dim.barColor} />
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs font-semibold ${d.dim.textColor}`}>{d.label}</span>
                  {d.pct < 45 && <span className="text-[10px]" style={{ color:'#f87171' }}>Needs attention</span>}
                  {d.pct >= 80 && <span className="text-[10px]" style={{ color:'#34d399' }}>Keep it up!</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Health vs Wealth visual */}
        <Card>
          <SectionLabel>Health vs Wealth Comparison</SectionLabel>
          <div className="grid grid-cols-2 gap-6">
            {(['health','wealth'] as const).map(type => {
              const ds  = result.dims.filter(d => d.dim.type===type);
              const avg = Math.round(ds.reduce((s,d)=>s+d.pct,0)/ds.length);
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white">{type==='health'?'❤️ Health':'💰 Wealth'}</span>
                    <span className="font-black text-lg" style={{ color:type==='health'?'#34d399':'#fbbf24' }}>{avg}</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-3" style={{ background:'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width:`${avg}%`, background:type==='health'?'#14b8a6':'#f59e0b', transition:'width 0.7s ease' }} />
                  </div>
                  <div className="space-y-1.5">
                    {ds.map(d => (
                      <div key={d.dim.id} className="flex items-center gap-2">
                        <span className="text-sm w-5">{d.dim.icon}</span>
                        <div className="flex-1 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.07)' }}>
                          <div className={`h-full rounded-full ${d.dim.barColor}`} style={{ width:`${d.pct}%`, transition:'width 0.7s ease' }} />
                        </div>
                        <span className="text-[10px] w-6 text-right" style={{ color:'#475569' }}>{d.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Insight cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-xs font-bold mb-2" style={{ color:'#f87171' }}>📉 Biggest Gap</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{worst.dim.icon}</span>
              <span className="text-sm font-bold text-white">{worst.dim.label}</span>
              <span className="ml-auto text-xl font-black" style={{ color:'#f87171' }}>{worst.pct}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color:'#94a3b8' }}>{worst.dim.description}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-xs font-bold mb-2" style={{ color:'#34d399' }}>🌟 Biggest Strength</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{best.dim.icon}</span>
              <span className="text-sm font-bold text-white">{best.dim.label}</span>
              <span className="ml-auto text-xl font-black" style={{ color:'#34d399' }}>{best.pct}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color:'#94a3b8' }}>{best.dim.description}</p>
          </div>
        </div>

        {/* Action plan */}
        <div>
          <SectionLabel>Your Personalised 12-Week Action Plan</SectionLabel>
          <div className="space-y-3">
            {acts.map((a, i) => (
              <div key={i} className="rounded-2xl p-4" style={{
                background: a.urgent ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.04)',
                border:     a.urgent ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.08)',
              }}>
                <div className="flex gap-3 items-start">
                  <span className="text-xl flex-shrink-0 mt-0.5">{a.urgent ? '🚨' : ['1️⃣','2️⃣','3️⃣','4️⃣'][i]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'rgba(94,234,212,0.12)', border:'1px solid rgba(94,234,212,0.25)', color:'#5eead4' }}>{a.weekRange}</span>
                      <p className="text-sm font-bold text-white">{a.title}</p>
                      {a.urgent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#ef4444', color:'#fff' }}>URGENT</span>}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color:'#94a3b8' }}>{a.body}</p>
                    {a.link && (
                      <a href={a.link.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs mt-2 hover:opacity-70 transition-opacity"
                        style={{ color:'#5eead4' }}>
                        🧮 {a.link.label} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related articles */}
        <Card>
          <SectionLabel>📖 Read Next — Based on Your Score</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-2">
            {(ARTICLES[worst.dim.id] || []).map((a, i) => (
              <Link key={i} href={`/guides/${a.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-lg">{worst.dim.icon}</span>
                <p className="text-xs font-medium leading-snug" style={{ color:'#94a3b8' }}>{a.title}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Share section */}
        <ResultsShare result={result} profile={prof} />

        {/* Email capture — the conversion point, see EmailCapture.tsx */}
        <EmailCapture result={result} profile={prof} />

        {/* CTA row */}
        <div className="grid sm:grid-cols-2 gap-3">
          <a href="/tools" target="_blank" rel="noopener noreferrer"
            className="flex flex-col p-5 rounded-2xl transition-all hover:opacity-90"
            style={{ background:'rgba(20,184,166,0.09)', border:'1px solid rgba(20,184,166,0.22)' }}>
            <p className="text-sm font-bold mb-1" style={{ color:'#5eead4' }}>🧮 Free Calculators</p>
            <p className="text-xs mb-3 leading-relaxed" style={{ color:'#64748b' }}>BMI, TDEE, SIP, EMI, FIRE number and 30+ more tools.</p>
            <span className="text-xs font-bold mt-auto" style={{ color:'#5eead4' }}>Open HealthWealthTools ↗</span>
          </a>
          <Link href="/plan"
            className="flex flex-col p-5 rounded-2xl transition-all hover:opacity-90"
            style={{ background:'rgba(139,92,246,0.09)', border:'1px solid rgba(139,92,246,0.22)' }}>
            <p className="text-sm font-bold mb-1" style={{ color:'#c4b5fd' }}>📋 Personalised Plan</p>
            <p className="text-xs mb-3 leading-relaxed" style={{ color:'#64748b' }}>Tailored health or finance plans for your exact situation.</p>
            <span className="text-xs font-bold mt-auto" style={{ color:'#c4b5fd' }}>View Plans →</span>
          </Link>
        </div>

        {/* Retake */}
        <div className="text-center pt-4 pb-8">
          <button onClick={restart}
            className="px-6 py-3 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ border:'1px solid rgba(255,255,255,0.1)', color:'#64748b', background:'rgba(255,255,255,0.03)' }}>
            ↺ Retake the Assessment
          </button>
          <p className="text-xs mt-2" style={{ color:'#334155' }}>
            Scores change as habits improve. Reassess every 90 days{history.length > 1 ? ' — your trend above updates automatically.' : ' to start tracking your trend.'}
          </p>
        </div>

      </div>
    </div>
  );
}
