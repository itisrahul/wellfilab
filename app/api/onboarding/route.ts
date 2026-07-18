import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { onboarding } from '@/lib/db/schema';
import type { OnboardingRecord } from '@/lib/onboardingStorage';

/**
 * Account-level plan onboarding answers, keyed by Clerk userId + plan —
 * mirrors lib/onboardingStorage.ts's shape. The real delivery mechanism is
 * still the email sent at submit time; this just makes the same answers
 * durable/queryable instead of living only in that one browser.
 */

export const dynamic = 'force-dynamic';

const onboardingSchema = z.object({
  plan: z.enum(['diet', 'finance', 'bundle']),
  email: z.string().email(),
  answers: z.record(z.string(), z.unknown()),
  submittedAt: z.string(),
});

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const plan = new URL(req.url).searchParams.get('plan');
  if (!plan) return NextResponse.json({ error: 'Missing plan query param.' }, { status: 400 });

  const [row] = await db.select().from(onboarding).where(and(eq(onboarding.userId, userId), eq(onboarding.plan, plan as OnboardingRecord['plan'])));
  if (!row) return NextResponse.json({ record: null });

  const record: OnboardingRecord = { plan: row.plan, email: row.email, answers: row.answers, submittedAt: row.submittedAt.toISOString() };
  return NextResponse.json({ record });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = onboardingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload.', details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  await db.insert(onboarding)
    .values({ userId, plan: input.plan, email: input.email, answers: input.answers, submittedAt: new Date(input.submittedAt) })
    .onConflictDoUpdate({
      target: [onboarding.userId, onboarding.plan],
      set: { email: input.email, answers: input.answers, submittedAt: new Date(input.submittedAt) },
    });

  return NextResponse.json({ ok: true });
}
