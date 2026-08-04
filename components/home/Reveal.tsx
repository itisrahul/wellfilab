'use client';
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/** Fades + slides a section in the first time it scrolls into view.
 * Renders visible immediately under prefers-reduced-motion, and if
 * JS hasn't hydrated yet content still shows (no FOUC of empty space).
 * `as` lets it render a real <section>/<div>/etc. instead of always
 * wrapping in an extra div. */
export function Reveal({ children, className = '', delayMs = 0, as: Tag = 'div' }: {
  children: ReactNode; className?: string; delayMs?: number; as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
