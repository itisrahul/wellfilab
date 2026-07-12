import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Coach — generates a genuinely personalised analysis from the user's
 * real WellFiLab Score via the Claude API. This is real model generation,
 * distinct from the rule-based insights/actions in lib/wellfilab-score.ts.
 *
 * The score lives in the browser's localStorage (see lib/scoreStorage.ts),
 * not a database, so the client sends its own summary — nothing is looked
 * up server-side.
 */

interface CoachRequest {
  overall?: number;
  body?: number;
  mind?: number;
  wealth?: number;
  life?: number;
  level?: 'quick' | 'body' | 'full';
  archetypeName?: string;
  trend?: number;
  topInsights?: { headline: string; detail: string }[];
}

export async function POST(req: Request) {
  const reqBody = (await req.json().catch(() => null)) as CoachRequest | null;
  if (!reqBody) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      analysis:
        "AI Coach isn't configured yet — add an ANTHROPIC_API_KEY to enable personalised, AI-generated analysis of your score.",
      configured: false,
    });
  }

  const { overall, body, mind, wealth, life, level, archetypeName, trend, topInsights } = reqBody;

  if (overall == null) {
    return NextResponse.json({
      analysis: 'Take the WellFiLab Score quiz first — the AI Coach analyzes your real numbers, so there\'s nothing to look at yet.',
      configured: true,
    });
  }

  const summaryLines = [
    `Overall WellFiLab Score: ${overall}/100`,
    body != null && mind != null && wealth != null && life != null
      ? `Breakdown — Body: ${body}, Mind: ${mind}, Wealth: ${wealth}, Life: ${life}`
      : null,
    archetypeName ? `Archetype: ${archetypeName}` : null,
    level ? `Data depth: ${level === 'quick' ? 'quick self-rating only' : level === 'body' ? 'quick + body details' : 'quick + body + finance details (full)'}` : null,
    trend != null && trend !== 0 ? `Trend vs their last check-in: ${trend > 0 ? '+' : ''}${trend} points` : null,
    topInsights?.length
      ? `Their top flagged insights:\n${topInsights.map(i => `- ${i.headline}: ${i.detail}`).join('\n')}`
      : null,
  ].filter(Boolean).join('\n');

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 500,
      system:
        "You are WellFiLab's AI Coach. You are given one user's real WellFiLab Score data — a combined health-and-finance score with an archetype. Write a short, warm, specific, encouraging analysis — 120 to 180 words, plain conversational prose, no markdown headers or bullet lists. Reference their actual numbers directly. Explicitly connect their health and financial situation to each other where the data supports it. If their data is only a quick self-rating (not full body/finance details), acknowledge that and encourage adding more for a sharper picture — but still give a genuinely useful read on what they've shared. End with exactly one clear, concrete next step. Respond with only the analysis text, nothing else.",
      messages: [{ role: 'user', content: summaryLines }],
    });

    const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    return NextResponse.json({ analysis: textBlock?.text ?? '', configured: true });
  } catch (err) {
    console.error('AI Coach error:', err);
    return NextResponse.json({ error: 'Could not generate your analysis right now. Please try again shortly.' }, { status: 500 });
  }
}
