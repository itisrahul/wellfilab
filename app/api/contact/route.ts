import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body    = await req.json().catch(() => null);
  const { name, email, subject, message } = body ?? {};

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
  }
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const apiKey   = process.env.RESEND_API_KEY;
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wellfilab.com';

  if (!apiKey) {
    // Dev fallback — log and return success
    console.log('Contact form (no Resend key):', { name, email, subject, message });
    return NextResponse.json({ ok: true });
  }

  try {
    // 1. Notify you (the admin)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'WellFiLab Contact <hello@wellfilab.com>',
        to:      ['hello@wellfilab.com'],
        replyTo: email,
        subject: `[Contact] ${subject ?? 'New message'} — from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#0d9488">New contact form submission</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;font-weight:600;color:#6b7280;width:100px">Name</td><td style="padding:8px;color:#111">${name}</td></tr>
              <tr><td style="padding:8px;font-weight:600;color:#6b7280">Email</td><td style="padding:8px"><a href="mailto:${email}" style="color:#0d9488">${email}</a></td></tr>
              <tr><td style="padding:8px;font-weight:600;color:#6b7280">Subject</td><td style="padding:8px;color:#111">${subject ?? '—'}</td></tr>
              <tr><td style="padding:8px;font-weight:600;color:#6b7280;vertical-align:top">Message</td>
                <td style="padding:8px;color:#111;white-space:pre-wrap">${message}</td></tr>
            </table>
            <p style="margin-top:24px">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject ?? 'Your message')}" 
                style="background:#0d9488;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
                Reply to ${name}
              </a>
            </p>
          </div>`,
      }),
    });

    // 2. Confirmation to the user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'WellFiLab <hello@wellfilab.com>',
        to:      [email],
        subject: 'We got your message — reply within 24 hours',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:28px 32px">
              <span style="color:white;font-size:20px;font-weight:800">WellFiLab</span>
            </div>
            <div style="padding:32px">
              <h2 style="margin:0 0 12px;color:#111827">Thanks, ${name} 👋</h2>
              <p style="color:#4b5563;line-height:1.6">
                We received your message and will get back to you at <strong>${email}</strong> within 24 hours.
              </p>
              <div style="background:#f0fdfa;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:4px solid #0d9488">
                <p style="margin:0;font-size:13px;color:#0f766e;font-weight:600">Your message:</p>
                <p style="margin:8px 0 0;font-size:14px;color:#374151;white-space:pre-wrap">${message}</p>
              </div>
              <p style="color:#6b7280;font-size:13px">
                While you wait — explore our <a href="${siteUrl}/tools" style="color:#0d9488">free calculators</a> 
                or <a href="${siteUrl}/guides" style="color:#0d9488">read a guide</a>.
              </p>
            </div>
          </div>`,
      }),
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('Contact email error:', err);
    return NextResponse.json({ error: 'Failed to send. Please email hello@wellfilab.com directly.' }, { status: 500 });
  }
}
