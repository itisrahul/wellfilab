'use client';

import { useState } from 'react';

interface Props {
  source: string;
  title?: string;
  description?: string;
}

/**
 * NewsletterSignup — posts to /api/subscribe (Resend-backed).
 * Used on the homepage (below Guides) and at the bottom of every guide article.
 */
export function NewsletterSignup({
  source,
  title = 'Get one useful tip a week',
  description = 'Health and finance insights, new calculators, and guide drops — straight to your inbox. No spam, unsubscribe anytime.',
}: Props) {
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
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
      <section className="rounded-3xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 p-8 text-center">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-bold text-teal-700 dark:text-teal-400">You&apos;re subscribed!</p>
        <p className="text-sm text-teal-600 dark:text-teal-500 mt-1">Check your inbox for a welcome email.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-gray-950 dark:bg-gray-900 border border-gray-800 p-8 md:p-10 text-center">
      <p className="text-2xl mb-3">📩</p>
      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-3">{errorMsg}</p>
      )}
    </section>
  );
}
