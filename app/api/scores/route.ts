import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, desc, and, notInArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { scores } from '@/lib/db/schema';
import type { WellFiScore } from '@/lib/wellfilab-score';

export const dynamic = 'force-dynamic';

/**
 * Account-level WellFiLab Score history, keyed by Clerk userId.
 * Mirrors lib/scoreStorage.ts's localStorage shape exactly (same stamped
 * record, same MAX_HISTORY cap) so that file's function bodies can become
 * thin fetch() wrappers around this route without changing its exported
 * signatures or any call site.
 *
 * Uses auth() rather than currentUser() — only userId is ever needed here,
 * and auth() verifies the session locally (JWT/JWKS) with no outbound call
 * to Clerk's API, unlike currentUser() which always makes one.
 */

const MAX_HISTORY = 30;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const rows = await db.select().from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date))
    .limit(MAX_HISTORY);

  return NextResponse.json({ history: rows.map(r => r.data) });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const score = (await req.json().catch(() => null)) as WellFiScore | null;
  if (!score) return NextResponse.json({ error: 'Invalid score payload.' }, { status: 400 });

  // A normal save passes an unstamped score — id/date get generated here.
  // The one-time local→account import (lib/accountImport.ts) passes an
  // already-stamped score with its real original id/date, which must be
  // preserved rather than overwritten with "now".
  const stamped: WellFiScore = {
    ...score,
    id: score.id ?? crypto.randomUUID(),
    date: score.date ?? new Date().toISOString(),
  };

  await db.insert(scores).values({
    id: stamped.id!,
    userId,
    date: new Date(stamped.date!),
    data: stamped,
  });

  // Prune to the most recent MAX_HISTORY rows for this user.
  const keep = await db.select({ id: scores.id }).from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date))
    .limit(MAX_HISTORY);
  const keepIds = keep.map(r => r.id);
  if (keepIds.length > 0) {
    await db.delete(scores).where(and(eq(scores.userId, userId), notInArray(scores.id, keepIds)));
  }

  return NextResponse.json({ score: stamped });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(scores).where(eq(scores.userId, userId));
  return NextResponse.json({ ok: true });
}
