import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { goals } from '@/lib/db/schema';

/**
 * Single-goal mutations. Body carries whichever of `current` (progress
 * update — appends a history point, matching updateGoalProgress) or
 * `paused` (toggleGoalPause) the caller wants applied; either or both may
 * be present.
 */

export const dynamic = 'force-dynamic';

interface Params { params: { id: string } }

const patchGoalSchema = z.object({
  current: z.number().optional(),
  paused: z.boolean().optional(),
  target: z.number().optional(),
  targetDate: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  milestones: z.array(z.object({
    id: z.string(), label: z.string().min(1).max(200), value: z.number(),
    targetDate: z.string().optional(), achievedDate: z.string().optional(),
  })).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = patchGoalSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload.', details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  try {
    const [existing] = await db.select().from(goals).where(and(eq(goals.id, params.id), eq(goals.userId, userId)));
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
    if (body.target !== undefined) {
      update.target = body.target;
    }
    if (body.targetDate !== undefined) {
      update.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    }
    if (body.priority !== undefined) update.priority = body.priority;
    if (body.milestones !== undefined) update.milestones = body.milestones;
    if (body.notes !== undefined) update.notes = body.notes;

    await db.update(goals).set(update).where(eq(goals.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/goals/[id]] DB error:', err);
    return NextResponse.json({ error: 'Could not save this change to the database.', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  try {
    await db.delete(goals).where(and(eq(goals.id, params.id), eq(goals.userId, userId)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/goals/[id]] DB error:', err);
    return NextResponse.json({ error: 'Could not delete this goal from the database.', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
