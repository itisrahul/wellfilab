'use client';
import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Root error boundary — catches any unhandled render/runtime error below
 * the root layout so a visitor sees a branded "something broke" page
 * (Navbar/Footer stay, since they render above this boundary) instead of
 * Next.js's generic crash screen.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          This page hit an unexpected error. It's not something you did — try again, or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            Try again
          </button>
          <Link href="/"
            className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:border-teal-400 dark:hover:border-teal-600 transition-all">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
