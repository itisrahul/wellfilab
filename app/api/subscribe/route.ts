import { NextResponse } from 'next/server';

/**
 * Email subscription API
 * Used by: Score result page, future newsletter captures
 * When RESEND_API_KEY is set → sends real welcome email via Resend
 * Without key → still saves to local JSON (dev fallback)
 */

export async function POST(req: Request) {
  const body   = await req.json().catch(() => null);
  const email  = body?.email?.trim()?.toLowerCase();
  const source = body?.source ?? 'unknown';

  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  // ── PRODUCTION: Send via Resend ──────────────────────────────────────────
  if (apiKey) {
    try {
      // 1. Send welcome email
      const welcomeRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'WellFiLab <hello@wellfilab.com>',
          to:      [email],
          subject: 'Welcome to WellFiLab 👋',
          html: buildWelcomeEmail({ email }),
        }),
      });

      if (!welcomeRes.ok) {
        const err = await welcomeRes.json();
        console.error('Resend error:', err);
        return NextResponse.json({ error: 'Failed to send welcome email.' }, { status: 500 });
      }

      console.log(`✅ Welcome email sent to ${email}`);
      return NextResponse.json({ ok: true });

    } catch (err) {
      console.error('Subscribe error:', err);
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
  }

  // ── DEV FALLBACK: save to local JSON ────────────────────────────────────
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs   = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const DATA_DIR  = path.join(process.cwd(), 'data');
    const DATA_FILE = path.join(DATA_DIR, 'subscribers.json');

    let subs: any[] = [];
    try { subs = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch {}

    const already = subs.some((s: any) => s.email === email);
    if (!already) {
      subs.push({ email, source, capturedAt: new Date().toISOString() });
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
    }
    return NextResponse.json({ ok: true, alreadySubscribed: already });
  } catch {
    return NextResponse.json({ ok: true }); // silent fail in dev
  }
}

// ── Email template ────────────────────────────────────────────────────────────
function buildWelcomeEmail({ email }: { email: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wellfilab.com';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:32px 40px;text-align:center">
      <div style="background:rgba(255,255,255,0.15);display:inline-block;padding:10px 16px;border-radius:10px;margin-bottom:12px">
        <span style="color:white;font-size:20px;font-weight:800;letter-spacing:-0.5px">WellFiLab</span>
      </div>
      <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px">Measure What Matters.</p>
    </div>

    <!-- Body -->
    <div style="padding:40px">
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#111827">
        Welcome to WellFiLab 👋
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6">
        Here's what you can do right now — all free, no signup needed:
      </p>

      <!-- 4 CTAs -->
      <div style="space-y:12px">
        <a href="${siteUrl}/score" style="display:block;padding:14px 20px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;text-decoration:none;margin-bottom:10px">
          <span style="font-size:18px">🎯</span>
          <strong style="color:#0f766e;font-size:14px;margin-left:10px">Get your WellFiLab Score</strong>
          <p style="margin:4px 0 0 28px;font-size:12px;color:#6b7280">3 quick questions, 60 seconds — one score for your whole life</p>
        </a>
        <a href="${siteUrl}/tools" style="display:block;padding:14px 20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;text-decoration:none;margin-bottom:10px">
          <span style="font-size:18px">🧮</span>
          <strong style="color:#111827;font-size:14px;margin-left:10px">Browse 60+ free calculators</strong>
          <p style="margin:4px 0 0 28px;font-size:12px;color:#6b7280">BMI, SIP, EMI, FIRE, calories, sleep and more</p>
        </a>
        <a href="${siteUrl}/guides" style="display:block;padding:14px 20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;text-decoration:none;margin-bottom:10px">
          <span style="font-size:18px">📚</span>
          <strong style="color:#111827;font-size:14px;margin-left:10px">Read evidence-based guides</strong>
          <p style="margin:4px 0 0 28px;font-size:12px;color:#6b7280">Health, finance, nutrition and lifestyle</p>
        </a>
        <a href="${siteUrl}/plan" style="display:block;padding:14px 20px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;text-decoration:none">
          <span style="font-size:18px">⭐</span>
          <strong style="color:#92400e;font-size:14px;margin-left:10px">See personalised plans from ₹149/mo</strong>
          <p style="margin:4px 0 0 28px;font-size:12px;color:#6b7280">7-day free trial · Cancel anytime</p>
        </a>
      </div>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6">
        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">
          You're receiving this because you signed up at <a href="${siteUrl}" style="color:#0d9488">${siteUrl}</a>.
          <br>
          <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#9ca3af">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
