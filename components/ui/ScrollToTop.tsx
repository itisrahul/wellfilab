'use client';
import { useEffect, useState } from 'react';

/** Floating scroll-to-top button — appears after scrolling 400px */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
      </svg>
    </button>
  );
}
