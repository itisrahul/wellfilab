/**
 * CalcActions — reusable action bar shown below every calculator.
 * Share | Print | Reset
 */
'use client';

interface CalcActionsProps {
  onReset: () => void;
  shareTitle?: string;
  shareText?: string;
}

export function CalcActions({ onReset, shareTitle = 'Calculator Result', shareText = 'Check out this calculator result' }: CalcActionsProps) {
  const handleShare = () => {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(url)
        .then(() => { alert('Link copied to clipboard!'); })
        .catch(() => {});
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
      <button onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        Share
      </button>
      <button onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        Print
      </button>
      <button onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400 text-gray-600 dark:text-gray-300 text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Start over
      </button>
    </div>
  );
}
