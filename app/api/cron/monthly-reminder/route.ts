import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { SITE_URL } from '@/config/site';

/**
 * Sends the monthly "time for your check-in" email to every user who has
 * opted in and hasn't been sent one in the last 28 days. Triggered by
 * Vercel Cron (see vercel.json) once a day — a daily check for "who's due"
 * is simpler and more robust than trying to schedule a once-a-month job per
 * user with staggered signup dates.
 *
 * Deliberately generic content: this route runs server-side and has no
 * access to any individual user's score/goals/roadmap state, since that
 * lives only in their browser's localStorage (see lib/scoreStorage.ts).
 * It nudges people back to /dashboard rather than pretending to know
 * what's changed for them.
 */

const THIRTY_DAYS_MS = 28 * 86400000;

interface ReminderPrefs {
  optedIn: boolean;
  lastSentAt?: string;
}

async function sendReminderEmail(apiKey: string, to: string, firstName: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'WellFiLab <hello@wellfilab.com>',
        to: [to],
        subject: 'Time for your monthly WellFiLab check-in',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <h2 style="color:#0d9488">Hi ${firstName || 'there'} 👋</h2>
            <p style="color:#374151;line-height:1.6">
              It's been about a month since you last checked in. A quick monthly review is where the WellFiLab Score
              actually pays off — retake it, see what's changed, and check your roadmap and goals.
            </p>
            <p style="margin-top:24px">
              <a href="${SITE_URL}/dashboard" style="background:#0d9488;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
                Open your dashboard →
              </a>
            </p>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px">
              You're getting this because you opted into monthly reminders. Turn it off any time from your dashboard.
            </p>
          </div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, sent: 0, note: 'No RESEND_API_KEY configured — nothing sent.' });
  }

  const client = await clerkClient();
  let sent = 0, checked = 0, offset = 0;
  const limit = 100;

  // Paginate through all users — fine at this app's current scale; would need
  // a real users table + batched job if this ever needs to scale past a few
  // thousand accounts.
  while (true) {
    const page = await client.users.getUserList({ limit, offset });
    if (page.data.length === 0) break;

    for (const user of page.data) {
      checked++;
      const prefs = user.publicMetadata?.reminderPrefs as ReminderPrefs | undefined;
      if (!prefs?.optedIn) continue;

      const lastSent = prefs.lastSentAt ? new Date(prefs.lastSentAt).getTime() : 0;
      if (Date.now() - lastSent < THIRTY_DAYS_MS) continue;

      const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      const ok = await sendReminderEmail(apiKey, email, user.firstName ?? '');
      if (ok) {
        sent++;
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, reminderPrefs: { ...prefs, lastSentAt: new Date().toISOString() } },
        });
      }
    }

    if (page.data.length < limit) break;
    offset += limit;
  }

  return NextResponse.json({ ok: true, checked, sent });
}
