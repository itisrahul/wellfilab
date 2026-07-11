// ─── Post ────────────────────────────────────────────────────────────────────
export type PostCategory = 'health' | 'finance' | 'nutrition' | 'lifestyle';

export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ChartBarData {
  label: string;
  value: number;
  /** Optional pre-formatted display value, e.g. "₹54,379" or "12%" */
  display?: string;
}

export interface ChartData {
  kind: 'bar' | 'line';
  title?: string;
  unit?: string;            // e.g. "₹", "%", "years"
  bars?: ChartBarData[];    // for kind: 'bar'
  /** for kind: 'line' — x labels and one or more series */
  xLabels?: string[];
  series?: { name: string; color: string; values: number[] }[];
}

export interface ComparisonData {
  title?: string;
  optionA: { label: string; points: string[]; verdict?: string };
  optionB: { label: string; points: string[]; verdict?: string };
}

export interface StepData {
  title: string;
  detail: string;
}

export interface Section {
  type: 'intro' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote' | 'callout' | 'image'
      | 'table' | 'chart' | 'comparison' | 'steps' | 'stat-row';
  text?: string;
  items?: string[];
  table?: TableData;
  chart?: ChartData;
  comparison?: ComparisonData;
  steps?: StepData[];
  /** for stat-row: quick highlight numbers, e.g. 3-4 key stats in a row */
  stats?: { label: string; value: string; color?: 'teal' | 'amber' | 'red' | 'green' }[];
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  tag: string;
  icon: string;
  readTime: number;
  date: string;
  tags: string[];
  body: Section[];
  hwtCalc?: { label: string; url: string };
}
