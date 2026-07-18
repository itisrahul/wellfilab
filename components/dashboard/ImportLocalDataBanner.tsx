'use client';
import { useState } from 'react';
import { importLocalDataToAccount, dismissImportOffer, type ImportSummary } from '@/lib/accountImport';

/**
 * One-time nudge for a returning visitor whose score/goal/net-worth/roadmap
 * history is sitting in this browser's localStorage from before the account
 * backend existed. Only rendered when lib/accountImport.ts's
 * hasUnimportedLocalData() is true — see MemberDashboardClient.
 */
export function ImportLocalDataBanner({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<'idle' | 'importing' | 'done'>('idle');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const handleImport = async () => {
    setStatus('importing');
    const result = await importLocalDataToAccount();
    setSummary(result);
    setStatus('done');
    onDone();
  };

  const handleDismiss = () => {
    dismissImportOffer();
    onDone();
  };

  if (status === 'done' && summary) {
    const total = summary.scores + summary.goals + summary.netWorthSnapshots + summary.roadmapChecks;
    return (
      <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-2xl p-4">
        <span className="text-2xl flex-shrink-0">✅</span>
        <p className="text-sm text-teal-800 dark:text-teal-300">
          {total > 0
            ? `Imported to your account — now available on every device you sign into.`
            : `Nothing new to import — your account was already up to date.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex-wrap">
      <span className="text-2xl flex-shrink-0">📥</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 dark:text-white text-sm">History found on this device</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Bring your existing score, goals, and net worth history into your account so it follows you to any device.
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleDismiss}
          disabled={status === 'importing'}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
        >
          Not now
        </button>
        <button
          onClick={handleImport}
          disabled={status === 'importing'}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50"
        >
          {status === 'importing' ? 'Importing…' : 'Import to my account'}
        </button>
      </div>
    </div>
  );
}
