import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

type Gradient = [string, string];

export const CATEGORY_GRADIENT: Record<string, Gradient> = {
  health:    ['#0f766e', '#06b6d4'],
  finance:   ['#d97706', '#f97316'],
  nutrition: ['#16a34a', '#10b981'],
  lifestyle: ['#9333ea', '#ec4899'],
};

export function renderOGImage({ icon, title, subtitle, gradient }: {
  icon: string;
  title: string;
  subtitle: string;
  gradient: Gradient;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
            }}
          >
            W
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>WellFiLab</span>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Measure What Matters.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 100, lineHeight: 1 }}>{icon}</div>
          <div style={{ display: 'flex', fontSize: 54, fontWeight: 800, color: 'white', lineHeight: 1.15, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.85)', maxWidth: 920 }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, emoji: 'twemoji' }
  );
}
