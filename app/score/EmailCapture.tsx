'use client';

import { useState } from 'react';
import type { ScoreResult, Profile } from './types';

interface Props {
  result: ScoreResult;
  profile: Profile;
}

/**
 * EmailCapture — placed on the Score results page, right after sharing.
 * This is the conversion point that turns a one-off quiz visitor into
 * someone on a list you actually own, rather than letting the
 * relationship end the moment they close the tab. Posts to
 * /api/subscribe (see that route for the honest explanation of what
 * happens to the email without a configured ESP yet).
 */
export function EmailCapture({ result, profile }: Props) {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'score-result',
          scoreOverall: result.overall,
          profileName: profile.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setErrorMsg('Could not reach the server. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)' }}>
        <p className="text-2xl mb-1">✅</p>
        <p className="text-sm font-bold text-white">You&apos;re on the list</p>
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
          We&apos;ll check in with a 90-day reminder to retake your assessment and track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-sm font-bold text-white mb-1">📩 Get a 90-day check-in reminder</p>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: '#94a3b8' }}>
        Scores change as habits change. Leave your email and we&apos;ll nudge you to retake the assessment in 90 days, plus send the occasional tip relevant to your {profile.name.toLowerCase()} profile. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#0d9488,#0891b2)' }}
        >
          {status === 'loading' ? 'Saving…' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs mt-2" style={{ color: '#f87171' }}>{errorMsg}</p>
      )}
    </div>
  );
}
