'use client';
import { useState } from 'react';
import type { ComparisonPick, ComparisonQuizQuestion } from '@/lib/comparisons';

/**
 * A one-question "which one's right for you" picker — every option is one
 * of the page's own real picks, reframed as a choice (see the `quiz` field
 * on ComparisonPost). Not a hidden scoring model: picking an answer just
 * scrolls to and highlights that exact pick card, so what you see is
 * exactly why it was recommended, not a black box.
 */
export function ComparisonQuiz({ quiz, picks }: { quiz: ComparisonQuizQuestion; picks: ComparisonPick[] }) {
  const [resultId, setResultId] = useState<string | null>(null);
  const result = resultId ? picks.find(p => p.id === resultId) : null;

  const choose = (pickId: string) => {
    setResultId(pickId);
    document.getElementById(`pick-${pickId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/20 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 mb-2">Not sure which one?</p>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{quiz.question}</h2>
      <div className="flex flex-wrap gap-2">
        {quiz.options.map(o => (
          <button key={o.pickId} onClick={() => choose(o.pickId)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
              resultId === o.pickId
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-400 dark:hover:border-teal-600'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
      {result && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">
          {result.logo} <strong>{result.name}</strong> — {result.bestFor}
        </p>
      )}
    </div>
  );
}
