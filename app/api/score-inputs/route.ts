import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { scoreInputs } from '@/lib/db/schema';

/**
 * Account-level raw score inputs (body/finance/age), keyed by Clerk userId
 * — mirrors lib/scoreInputs.ts's shape. One row per user; POST does a
 * partial merge (only overwrites fields actually present in the payload)
 * since body/finance/age are saved independently at different points in
 * the intake flow — see saveRawInputs vs. saveAge in lib/scoreInputs.ts.
 */

export const dynamic = 'force-dynamic';

const bodyInputsSchema = z.object({
  age: z.number(), weight: z.number(), height: z.number(), sleepHours: z.number(),
  exerciseDays: z.number(), stressLevel: z.number(), dietQuality: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  waterLiters: z.number(),
});
const financeInputsSchema = z.object({
  monthlyIncome: z.number(), monthlyExpenses: z.number(), totalSavings: z.number(), totalDebt: z.number(),
  monthlyInvestments: z.number(), hasEmergencyFund: z.boolean(), hasInsurance: z.boolean(),
  hasLifeInsurance: z.boolean().optional(), equityAllocationPct: z.number().optional(),
  riskTolerance: z.enum(['sell', 'hold', 'buy-more']).optional(),
});
const patchSchema = z.object({
  body: bodyInputsSchema.nullable().optional(),
  finance: financeInputsSchema.optional(),
  age: z.number().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const [row] = await db.select().from(scoreInputs).where(eq(scoreInputs.userId, userId));
  return NextResponse.json({
    body: row?.body ?? null,
    finance: row?.finance ?? null,
    age: row?.age ?? null,
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload.', details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const [existing] = await db.select().from(scoreInputs).where(eq(scoreInputs.userId, userId));
  const merged: typeof scoreInputs.$inferInsert = {
    userId,
    body: (input.body !== undefined ? input.body : existing?.body ?? null) as typeof scoreInputs.$inferInsert.body,
    finance: (input.finance !== undefined ? input.finance : existing?.finance ?? null) as typeof scoreInputs.$inferInsert.finance,
    age: input.age !== undefined ? input.age : input.body?.age ?? existing?.age ?? null,
    updatedAt: new Date(),
  };

  await db.insert(scoreInputs).values(merged)
    .onConflictDoUpdate({ target: scoreInputs.userId, set: merged });

  return NextResponse.json({ body: merged.body, finance: merged.finance, age: merged.age });
}
