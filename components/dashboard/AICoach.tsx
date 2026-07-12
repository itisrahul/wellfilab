'use client';
import { useState } from 'react';
import type { WellFiScore } from '@/lib/wellfilab-score';

export function AICoach({ score }: { score: WellFiScore | null }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [analysis, setAnalysis] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const run = async () => {
    if (!score) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overall: score.overall,
          body: score.body,
          mind: score.mind,
          wealth: score.wealth,
          life: score.life,
          level: score.level,
          archetypeName: score.archetype.name,
          trend: score.scoreChange,
          topInsights: score.insights.slice(0, 3).map(i => ({ headline: i.headline, detail: i.detail })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }
      setAnalysis(data.analysis);
      setStatus('done');
    } catch {
      setErrorMsg('Could not reach the server. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section className="rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-teal-600 p-[1px]">
      <div className="rounded-2xl bg-white dark:bg-gray-900 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-1">
              ✨ AI Coach
            </p>
            <h2 className="font-bold text-gray-900 dark:text-white text-base">A personalised read on your numbers</h2>
          </div>
          {status !== 'loading' && (
            <button onClick={run} disabled={!score}
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 hover:opacity-90 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {status === 'done' ? 'Regenerate' : 'Get my AI analysis'}
            </button>
          )}
        </div>

        {!score && (
          <p className="text-sm text-gray-400 mt-3">Take the WellFiLab Score quiz first — the AI Coach analyzes your real numbers.</p>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Thinking about your numbers…
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-500 mt-3">{errorMsg}</p>
        )}

        {status === 'done' && (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-4">{analysis}</p>
        )}
      </div>
    </section>
  );
}
