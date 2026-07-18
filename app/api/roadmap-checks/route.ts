import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { roadmapChecks } from '@/lib/db/schema';

/**
 * Account-level roadmap checkmarks, keyed by Clerk userId — one row per
 * user, same single-map shape as the `wfl_roadmap_checks` localStorage key.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const [row] = await db.select().from(roadmapChecks).where(eq(roadmapChecks.userId, userId));
  return NextResponse.json({ checks: row?.checks ?? {} });
}

// Values are ISO timestamp strings, or a legacy literal `true` — see
// lib/roadmapChecks.ts's RoadmapChecks type comment.
const roadmapChecksSchema = z.record(z.string(), z.union([z.string(), z.boolean()]));

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = roadmapChecksSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload.', details: parsed.error.flatten() }, { status: 400 });
  const checks = parsed.data;

  await db.insert(roadmapChecks)
    .values({ userId, checks, updatedAt: new Date() })
    .onConflictDoUpdate({ target: roadmapChecks.userId, set: { checks, updatedAt: new Date() } });

  return NextResponse.json({ checks });
}
