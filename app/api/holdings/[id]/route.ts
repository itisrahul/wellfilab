import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { holdings } from '@/lib/db/schema';
import { HOLDING_TYPES } from '@/lib/holdingsStorage';

export const dynamic = 'force-dynamic';

interface Params { params: { id: string } }

const patchHoldingSchema = z.object({
  category: z.enum(['asset', 'liability']).optional(),
  type: z.enum(HOLDING_TYPES).optional(),
  subType: z.string().min(1).max(100).optional(),
  currentValue: z.number().optional(),
  investedAmount: z.number().optional(),
  monthlyContribution: z.number().optional(),
  // The client (lib/holdingsStorage.ts's updateHolding) computes the full
  // appended history itself and sends it whenever currentValue actually
  // changed — this route just needs to not strip it.
  history: z.array(z.object({ date: z.string(), value: z.number() })).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = patchHoldingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload.', details: parsed.error.flatten() }, { status: 400 });

  await db.update(holdings).set({ ...parsed.data, lastUpdated: new Date() })
    .where(and(eq(holdings.id, params.id), eq(holdings.userId, userId)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(holdings).where(and(eq(holdings.id, params.id), eq(holdings.userId, userId)));
  return NextResponse.json({ ok: true });
}
