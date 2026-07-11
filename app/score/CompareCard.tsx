'use client';

import { useState } from 'react';
import { DIMS } from './data';
import { buildCompareUrl, type CompareSnapshot } from './compareLink';
import type { ScoreResult, Profile } from './types';
import { Card, SectionLabel } from './components';

interface Props {
  result: ScoreResult;
  profile: Profile;
}

/** Shown on the results screen so the current user can generate their own comparison link to send. */
export function CompareInvite({ result }: Props) {
  const [name, setName] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => setLink(buildCompareUrl(result, name || 'A friend'));

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <Card>
      <SectionLabel>🤝 Compare With a Friend</SectionLabel>
      <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
        Generate a link that carries your score with it. When a friend opens it and takes their own
        quiz, they will see a side-by-side comparison. Nothing is stored anywhere — the score lives
        entirely inside the link itself.
      </p>
      {!link ? (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your first name (optional)"
            maxLength={24}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-transparent text-white placeholder:text-gray-500"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          />
          <button
            onClick={generate}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(90deg,#0d9488,#0891b2)' }}
          >
            Get my link
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl text-xs truncate" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
              {link}
            </div>
            <button
              onClick={copy}
              className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
              style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)', color: '#5eead4' }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] mt-2" style={{ color: '#334155' }}>Send this to a friend on WhatsApp, email, anywhere.</p>
        </div>
      )}
    </Card>
  );
}

/** Shown when the page loads with a ?vs= param — renders the decoded friend's score against the current user's. */
export function CompareResult({ result, friend }: { result: ScoreResult; friend: CompareSnapshot }) {
  const rows = [
    { label: 'Overall', you: result.overall, friend: friend.overall },
    { label: 'Health',  you: result.health,  friend: friend.health },
    { label: 'Wealth',  you: result.wealth,  friend: friend.wealth },
    { label: 'Balance', you: result.balance, friend: friend.balance },
  ];

  return (
    <Card>
      <SectionLabel>🤝 You vs {friend.name}</SectionLabel>
      <div className="space-y-3 mb-5">
        {rows.map(r => {
          const max = Math.max(r.you, r.friend, 1);
          return (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#94a3b8' }}>
                <span className="font-semibold">{r.label}</span>
                <span>{r.you} vs {r.friend}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(r.you / max) * 100}%`, background: '#5eead4', marginLeft: 'auto' }} />
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(r.friend / max) * 100}%`, background: '#fbbf24' }} />
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex justify-between text-[10px] uppercase tracking-widest pt-1" style={{ color: '#475569' }}>
          <span>● You</span>
          <span>● {friend.name}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {DIMS.map(d => {
          const you = result.dims.find(rd => rd.dim.id === d.id)?.pct ?? 0;
          const them = friend.dims[d.id] ?? 0;
          const diff = you - them;
          return (
            <div key={d.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-base">{d.icon}</span>
              <span className="text-xs flex-1" style={{ color: '#94a3b8' }}>{d.label}</span>
              <span className="text-xs font-bold" style={{ color: diff > 0 ? '#34d399' : diff < 0 ? '#f87171' : '#94a3b8' }}>
                {diff > 0 ? '+' : ''}{diff}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] mt-4 leading-relaxed" style={{ color: '#334155' }}>
        {friend.name}&apos;s score came from a link they shared, not a live account — it reflects whenever they generated it, not necessarily today.
      </p>
    </Card>
  );
}
