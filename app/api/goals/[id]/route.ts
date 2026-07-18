import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { goals } from '@/lib/db/schema';

/**
 * Single-goal mutations. Body carries whichever of `current` (progress
 * update — appends a history point, matching updateGoalProgress) or
 * `paused` (toggleGoalPause) the caller wants applied; either or both may
 * be present.
 */

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { current?: number; paused?: boolean } | null;
  if (!body) return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });

  const [existing] = await db.select().from(goals).where(and(eq(goals.id, params.id), eq(goals.userId, user.id)));
  if (!existing) return NextResponse.json({ error: 'Goal not found.' }, { status: 404 });

  const now = new Date();
  const update: Partial<typeof goals.$inferInsert> = {};

  if (body.current !== undefined) {
    update.current = body.current;
    update.lastUpdated = now;
    update.history = [...(existing.history ?? []), { date: now.toISOString(), value: body.current }];
  }
  if (body.paused !== undefined) {
    update.paused = body.paused;
  }

  await db.update(goals).set(update).where(eq(goals.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(goals).where(and(eq(goals.id, params.id), eq(goals.userId, user.id)));
  return NextResponse.json({ ok: true });
}
