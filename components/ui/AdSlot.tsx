'use client';
import { useEffect, useRef } from 'react';

interface AdSlotProps {
  /** CSS height class, e.g. "h-60" or "h-20" */
  h?: string;
  /** Ad format label shown in placeholder */
  label?: string;
  /** Google AdSense ad slot ID — get from your AdSense account */
  slot?: string;
  /** AdSense publisher ID — set via NEXT_PUBLIC_ADSENSE_PUB_ID env var */
  format?: 'auto' | 'rectangle' | 'horizontal';
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

/**
 * AdSlot component.
 *
 * In development (no PUB_ID set): shows a labelled placeholder.
 * In production (PUB_ID set): renders a real Google AdSense ad unit.
 *
 * Setup:
 *   1. Add NEXT_PUBLIC_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXX to .env.local
 *   2. Add your ad slot IDs from AdSense dashboard to the `slot` prop
 *   3. Add the AdSense script to app/layout.tsx head section
 */
export function AdSlot({ h = 'h-60', label = '300×250', slot, format = 'auto' }: AdSlotProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!PUB_ID || !slot) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  // Development / no pub ID: show placeholder
  if (!PUB_ID || !slot) {
    return (
      <div className={`w-full ${h} flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700`}>
        <p className="text-xs text-gray-400 font-medium">Advertisement</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">{label}</p>
      </div>
    );
  }

  // Production: real AdSense unit
  return (
    <div className={`w-full ${h} overflow-hidden`}>
      <ins
        ref={ref as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
