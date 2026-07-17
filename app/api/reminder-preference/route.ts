import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

/**
 * Monthly email reminder opt-in, stored in the signed-in user's Clerk
 * publicMetadata — same pattern as app/api/subscription/route.ts.
 *
 * Why account-level, not localStorage: score/goals/roadmap state lives only
 * in the browser (see lib/scoreStorage.ts's honesty note), so a server-side
 * cron job has no way to know a specific user's score is 30 days stale. The
 * reminder this enables is deliberately generic ("time for your monthly
 * check-in") rather than pretending to know content a server can't see.
 */

interface ReminderPrefs {
  optedIn: boolean;
  lastSentAt?: string;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ optedIn: false }, { status: 401 });

  const prefs = (user.publicMetadata?.reminderPrefs as ReminderPrefs | undefined) ?? { optedIn: false };
  return NextResponse.json(prefs);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to manage email reminders.' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { optedIn: boolean } | null;
  if (body == null || typeof body.optedIn !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const existing = (user.publicMetadata?.reminderPrefs as ReminderPrefs | undefined) ?? {};
  const prefs: ReminderPrefs = { ...existing, optedIn: body.optedIn };

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { ...user.publicMetadata, reminderPrefs: prefs },
  });

  return NextResponse.json(prefs);
}
