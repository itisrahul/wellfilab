import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Life Coach — generates a genuinely personalised health-and-finance
 * analysis from the user's own Score/Life ROI numbers via the Claude API.
 * This is real model generation, distinct from the rule-based
 * recommendations in lib/lifeROI.ts.
 *
 * Data lives in the browser's localStorage (see lib/dashboardData.ts), not
 * a database, so the client sends its own summary — nothing is looked up
 * server-side.
 */

interface CoachRequest {
  healthWealthScore?: number;
  lifeROIScore?: number;
  healthScore?: number;
  financeScore?: number;
  trend?: 'up' | 'down' | 'same' | null;
  topInsights?: { title: string; description: string }[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CoachRequest | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      analysis:
        "AI Coach isn't configured yet — add an ANTHROPIC_API_KEY to enable personalised, AI-generated analysis of your health and finance numbers.",
      configured: false,
    });
  }

  const { healthWealthScore, lifeROIScore, healthScore, financeScore, trend, topInsights } = body;

  const summaryLines = [
    healthWealthScore != null ? `Health-Wealth Score: ${healthWealthScore}/100` : null,
    lifeROIScore != null ? `Life ROI Score: ${lifeROIScore}/100` : null,
    healthScore != null && financeScore != null ? `Breakdown — Health: ${healthScore}/100, Finance: ${financeScore}/100` : null,
    trend ? `Trend vs their last check-in: ${trend}` : null,
    topInsights?.length
      ? `Their top flagged areas:\n${topInsights.map(i => `- ${i.title}: ${i.description}`).join('\n')}`
      : null,
  ].filter(Boolean).join('\n');

  if (!summaryLines) {
    return NextResponse.json({
      analysis: 'Take the Health-Wealth Score or Life ROI quiz first — the AI Coach analyzes your real numbers, so there\'s nothing to look at yet.',
      configured: true,
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 500,
      system:
        "You are WellFiLab's AI health-and-finance coach. You are given one user's real Health-Wealth Score and/or Life ROI Score data. Write a short, warm, specific, encouraging analysis — 120 to 180 words, plain conversational prose, no markdown headers or bullet lists. Reference their actual numbers directly. Explicitly connect their health and financial situation to each other where the data supports it. End with exactly one clear, concrete next step. Respond with only the analysis text, nothing else.",
      messages: [{ role: 'user', content: summaryLines }],
    });

    const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    return NextResponse.json({ analysis: textBlock?.text ?? '', configured: true });
  } catch (err) {
    console.error('AI Coach error:', err);
    return NextResponse.json({ error: 'Could not generate your analysis right now. Please try again shortly.' }, { status: 500 });
  }
}
