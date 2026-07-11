'use client';

import type { ScoreResult, Profile } from './types';
import { estimatePercentile } from './percentile';

/**
 * app/score/shareCard.ts — renders the Score result as a styled PNG image
 * using the Canvas API directly (no server-side rendering, no extra npm
 * dependency like @vercel/og or html2canvas).
 *
 * WHY AN IMAGE, NOT JUST A SHARE LINK
 * --------------------------------------
 * A link shared to WhatsApp/Instagram Stories/Twitter is low-friction to
 * ignore. An actual image people can post IS the content — this is the
 * single highest-leverage free distribution mechanic available on the
 * whole site (see ROADMAP.md Layer 2). Canvas keeps this fast and
 * dependency-free, at the cost of slightly less layout flexibility than
 * a DOM-to-image library would give — an acceptable tradeoff for a single
 * fixed-layout card.
 */

const W = 1080;
const H = 1080; // square — works for Instagram, WhatsApp Status, Twitter

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDimBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, icon: string, label: string, pct: number) {
  ctx.font = '40px sans-serif';
  ctx.fillText(icon, x, y + 32);

  ctx.font = '600 28px -apple-system, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(label, x + 56, y + 18);

  // Track
  roundRect(ctx, x + 56, y + 28, w - 56, 14, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();

  // Fill
  const fillW = ((w - 56) * pct) / 100;
  roundRect(ctx, x + 56, y + 28, Math.max(14, fillW), 14, 7);
  const grad = ctx.createLinearGradient(x + 56, 0, x + 56 + fillW, 0);
  grad.addColorStop(0, '#14b8a6');
  grad.addColorStop(1, '#5eead4');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.font = '600 24px sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.textAlign = 'right';
  ctx.fillText(`${pct}`, x + w, y + 18);
  ctx.textAlign = 'left';
}

export function buildShareCardCanvas(result: ScoreResult, profile: Profile): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#0d4a45');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Badge
  ctx.font = '600 26px -apple-system, sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.textAlign = 'center';
  ctx.fillText('⭐ WellFiLab Health-Wealth Score', W / 2, 90);

  // Big score ring (drawn as an arc)
  const cx = W / 2, cy = 320, r = 150;
  ctx.lineWidth = 22;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const pctOfCircle = (result.overall / 100) * Math.PI * 2;
  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, '#14b8a6');
  ringGrad.addColorStop(1, '#f59e0b');
  ctx.strokeStyle = ringGrad;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pctOfCircle);
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.font = '800 96px -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${result.overall}`, cx, cy + 20);
  ctx.font = '600 28px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('/ 100', cx, cy + 58);

  // Profile name
  ctx.font = '800 44px -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${profile.emoji}  ${profile.name}`, cx, 530);

  // Percentile message
  const pct = estimatePercentile(result.overall);
  ctx.font = '500 30px -apple-system, sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.fillText(pct >= 50 ? `Better than an estimated ${pct}% of people` : `Estimated ${pct}th percentile`, cx, 580);

  // Dimension bars
  ctx.textAlign = 'left';
  const barX = 110, barW = W - 220;
  let barY = 660;
  result.dims.slice(0, 4).forEach(d => {
    drawDimBar(ctx, barX, barY, barW, d.dim.icon, d.dim.label, d.pct);
    barY += 70;
  });

  // Footer
  ctx.textAlign = 'center';
  ctx.font = '500 26px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Get your free score at wellfilab.com/score', W / 2, H - 60);

  return canvas;
}

export function downloadShareCard(result: ScoreResult, profile: Profile): void {
  const canvas = buildShareCardCanvas(result, profile);
  canvas.toBlob(blob => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `health-wealth-score-${profile.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 'image/png');
}

/** Returns a File object suitable for navigator.share({ files: [...] }) on supporting mobile browsers. */
export async function shareCardAsFile(result: ScoreResult, profile: Profile): Promise<File | null> {
  const canvas = buildShareCardCanvas(result, profile);
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) return resolve(null);
      resolve(new File([blob], 'health-wealth-score.png', { type: 'image/png' }));
    }, 'image/png');
  });
}
