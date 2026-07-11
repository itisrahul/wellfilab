// ─── Score types ─────────────────────────────────────────────────────────────

export interface Dim {
  id: string;
  label: string;
  icon: string;
  type: 'health' | 'wealth';
  barColor: string;
  textColor: string;
  description: string;
}

export interface Question {
  id: string;
  dimension: Dim;
  text: string;
  subtitle?: string;
  weight: number;
  hwtLink?: { label: string; url: string };
  options: { label: string; value: number; icon: string }[];
}

export interface Answer {
  qid: string;
  value: number;
}

export interface DimResult {
  dim: Dim;
  pct: number;
  label: string;
}

export interface ScoreResult {
  health: number;
  wealth: number;
  overall: number;
  balance: number;
  dims: DimResult[];
}

export interface Profile {
  name: string;
  emoji: string;
  gradient: string;
  summary: string;
  action: string;
}

export interface Action {
  title: string;
  body: string;
  link?: { label: string; url: string };
  urgent: boolean;
  /** e.g. "Weeks 1–2" — turns the action list into an actual sequence rather than 4 unordered tips */
  weekRange: string;
}

export type Screen = 'landing' | 'quiz' | 'results';
