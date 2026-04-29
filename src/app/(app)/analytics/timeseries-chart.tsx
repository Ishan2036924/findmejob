'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type TimeSeriesChartProps = {
  data: Array<{ date: string; count: number }>;
};

/**
 * Groups daily counts into ISO weeks for a smoother trend over 60d.
 * Week label = the Monday of that week (YYYY-MM-DD).
 */
function bucketByWeek(
  daily: Array<{ date: string; count: number }>,
): Array<{ week: string; count: number }> {
  const byWeek = new Map<string, number>();
  for (const row of daily) {
    const d = new Date(row.date + 'T00:00:00Z');
    const day = d.getUTCDay(); // 0=Sun..6=Sat
    const offsetToMonday = (day + 6) % 7;
    const monday = new Date(d.getTime() - offsetToMonday * 86400_000);
    const key = monday.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + row.count);
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([week, count]) => ({ week, count }));
}

function formatWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const weekly = bucketByWeek(data);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weekly} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="week"
            stroke="#52525b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatWeek}
          />
          <YAxis
            stroke="#52525b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
            contentStyle={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(label) => `Week of ${formatWeek(String(label))}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => `${v as number} applications`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
