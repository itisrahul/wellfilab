'use client';

import { useState } from 'react';
import type { ScoreResult, Profile } from './types';
import { percentileMessage } from './percentile';
import { downloadShareCard, shareCardAsFile } from './shareCard';

interface Props {
  result: ScoreResult;
  profile: Profile;
}

export function ResultsShare({ result, profile }: Props) {
  const [copied, setCopied]   = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const date = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const percentLine = percentileMessage(result.overall);

  // ── Share text ─────────────────────────────────────────────────────────────
  const shareText = `My Health-Wealth Score: ${result.overall}/100 (${profile.name} ${profile.emoji})
${percentLine}

❤️ Health: ${result.health}/100
💰 Wealth: ${result.wealth}/100
⚖️ Balance: ${result.balance}/100

Assessed on WellFiLab · ${date}
Get your score at wellfilab.com/score`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback: noop */ }
  };

  // ── Native share ───────────────────────────────────────────────────────────
  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'My Health-Wealth Score', text: shareText, url: 'https://wellfilab.com/score' }).catch(() => {});
    } else {
      copy();
    }
  };

  // ── Share as image card — the highest-leverage free distribution mechanic
  //    on the site (see ROADMAP.md Layer 2). Tries native share-with-file
  //    first (works on most mobile browsers), falls back to a direct PNG
  //    download everywhere else. ──────────────────────────────────────────
  const shareCard = async () => {
    setCardBusy(true);
    try {
      const file = await shareCardAsFile(result, profile);
      const canShareFiles =
        file && navigator.canShare && navigator.canShare({ files: [file] });

      if (canShareFiles && navigator.share) {
        await navigator.share({
          files: [file!],
          title: 'My Health-Wealth Score',
          text: shareText,
        });
      } else {
        downloadShareCard(result, profile);
      }
    } catch {
      downloadShareCard(result, profile);
    } finally {
      setCardBusy(false);
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const print = () => window.print();

  // ── Download as text ───────────────────────────────────────────────────────
  const download = () => {
    const fullText = `HEALTH-WEALTH SCORE REPORT
Generated: ${date}
Platform: WellFiLab (wellfilab.com/score)
${'─'.repeat(50)}

OVERALL SCORE: ${result.overall}/100 — ${profile.name} ${profile.emoji}

${profile.summary}

${'─'.repeat(50)}
DIMENSION BREAKDOWN
${'─'.repeat(50)}
${result.dims.map(d => `${d.dim.icon} ${d.dim.label.padEnd(25)} ${d.pct}/100  ${d.label}`).join('\n')}

${'─'.repeat(50)}
HEALTH SCORE:  ${result.health}/100
WEALTH SCORE:  ${result.wealth}/100
BALANCE SCORE: ${result.balance}/100

${'─'.repeat(50)}
YOUR PRIORITY
${'─'.repeat(50)}
${profile.action}

${'─'.repeat(50)}
Reassess every 90 days to track your progress.
wellfilab.com/score
`;

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `health-wealth-score-${date.replace(/ /g,'-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color:'#64748b' }}>
          Share Your Score
        </p>
        <p className="text-xs" style={{ color:'#475569' }}>{date}</p>
      </div>

      {/* Score summary pill */}
      <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-2xl">{profile.emoji}</span>
        <div>
          <p className="text-sm font-bold text-white">{profile.name} · {result.overall}/100</p>
          <p className="text-xs" style={{ color:'#64748b' }}>❤️ {result.health}  💰 {result.wealth}  ⚖️ {result.balance} balance</p>
        </div>
      </div>

      {/* Percentile callout — the share-trigger framing, see percentile.ts for the honesty note on what this estimate is */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
        style={{ background:'rgba(20,184,166,0.08)', border:'1px solid rgba(20,184,166,0.2)' }}>
        <span className="text-base">📊</span>
        <p className="text-xs font-semibold" style={{ color:'#5eead4' }}>{percentLine}</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button onClick={shareCard} disabled={cardBusy}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', color:'#fcd34d' }}>
          <span className="text-lg">{cardBusy ? '⏳' : '🖼️'}</span>
          {cardBusy ? 'Preparing…' : 'Share as image'}
        </button>

        <button onClick={share}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
          style={{ background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.25)', color:'#5eead4' }}>
          <span className="text-lg">📤</span>
          Share text
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={copy}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
          style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#a5b4fc' }}>
          <span className="text-lg">{copied ? '✅' : '📋'}</span>
          {copied ? 'Copied!' : 'Copy text'}
        </button>

        <button onClick={download}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
          style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#6ee7b7' }}>
          <span className="text-lg">⬇️</span>
          Download report
        </button>
      </div>

      {/* Print hint */}
      <button onClick={print}
        className="w-full mt-2 py-2 rounded-xl text-xs transition-all hover:opacity-80 text-center"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', color:'#475569' }}>
        🖨️ Print / Save as PDF
      </button>
    </div>
  );
}
