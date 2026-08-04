'use client';
import { useEffect, useRef } from 'react';

/**
 * A soft glow that follows the pointer within the hero — pure visual
 * polish, updated by writing CSS custom properties directly to the DOM
 * (not React state) so it doesn't re-render the section on every mouse
 * move. No-ops under prefers-reduced-motion and on touch (no pointer to
 * track), where it just stays at its initial centered position.
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const handleMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      ref.current?.style.setProperty('--spot-x', `${x}%`);
      ref.current?.style.setProperty('--spot-y', `${y}%`);
    };
    parent.addEventListener('mousemove', handleMove);
    return () => parent.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none transition-opacity duration-500"
      style={{
        background: 'radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(45,212,191,0.12), transparent 70%)',
      }}
    />
  );
}
