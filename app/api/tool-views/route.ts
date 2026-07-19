import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql, gte, and, lt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { toolViews } from '@/lib/db/schema';
import { CALCULATORS } from '@/config/tools';

/**
 * Anonymous tool-view counters — see the schema comment on `toolViews`.
 * POST increments today's count for a real calculator slug (no auth, no
 * personal data — a plain aggregate). GET returns the data the tools
 * discovery page actually renders: real trending/popular numbers, never
 * fabricated ones.
 */

export const dynamic = 'force-dynamic';

const VALID_SLUGS = new Set(CALCULATORS.map(c => c.slug));

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const postSchema = z.object({ slug: z.string() });

export async function POST(req: Request) {
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !VALID_SLUGS.has(parsed.data.slug)) {
    return NextResponse.json({ error: 'Unknown tool.' }, { status: 400 });
  }
  const { slug } = parsed.data;
  const today = dateStr(new Date());

  await db.insert(toolViews)
    .values({ slug, date: today, count: 1 })
    .onConflictDoUpdate({ target: [toolViews.slug, toolViews.date], set: { count: sql`${toolViews.count} + 1` } });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const now = new Date();
  const todayStr     = dateStr(now);
  const weekAgoStr    = dateStr(new Date(now.getTime() - 6 * 86400000));
  const twoWeeksStr   = dateStr(new Date(now.getTime() - 13 * 86400000));

  const [thisWeekRows, lastWeekRows, allTimeRows] = await Promise.all([
    db.select({ slug: toolViews.slug, total: sql<string>`sum(${toolViews.count})` })
      .from(toolViews).where(gte(toolViews.date, weekAgoStr)).groupBy(toolViews.slug),
    db.select({ slug: toolViews.slug, total: sql<string>`sum(${toolViews.count})` })
      .from(toolViews).where(and(gte(toolViews.date, twoWeeksStr), lt(toolViews.date, weekAgoStr))).groupBy(toolViews.slug),
    db.select({ slug: toolViews.slug, total: sql<string>`sum(${toolViews.count})` })
      .from(toolViews).groupBy(toolViews.slug),
  ]);

  const lastWeekBySlug = Object.fromEntries(lastWeekRows.map(r => [r.slug, Number(r.total)]));

  const trending = thisWeekRows
    .map(r => {
      const thisWeek = Number(r.total);
      const lastWeek = lastWeekBySlug[r.slug] ?? 0;
      // Meaningful trend needs both a real prior baseline and real current
      // volume — a jump from 1 view to 3 views is not "200% trending", it's
      // noise. Require at least 5 views last week to compute a % change.
      const pctChange = lastWeek >= 5 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
      return { slug: r.slug, thisWeek, lastWeek, pctChange };
    })
    .filter(r => r.pctChange !== null && r.pctChange > 0)
    .sort((a, b) => (b.pctChange ?? 0) - (a.pctChange ?? 0));

  const popular = allTimeRows
    .map(r => ({ slug: r.slug, total: Number(r.total) }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ date: todayStr, trending, popular });
}
