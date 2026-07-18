import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { roadmapChecks } from '@/lib/db/schema';
import type { RoadmapChecks } from '@/lib/roadmapChecks';

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

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const checks = (await req.json().catch(() => null)) as RoadmapChecks | null;
  if (!checks) return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });

  await db.insert(roadmapChecks)
    .values({ userId, checks, updatedAt: new Date() })
    .onConflictDoUpdate({ target: roadmapChecks.userId, set: { checks, updatedAt: new Date() } });

  return NextResponse.json({ checks });
}
