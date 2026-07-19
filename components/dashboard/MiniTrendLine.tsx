import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

/** Small embedded sparkline for a score card — same real history data as
 * the full Trend Analysis chart, just a compact single-series view. */
export function MiniTrendLine({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={64}>
      <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <YAxis domain={[0, 100]} hide />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
