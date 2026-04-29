'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type FunnelDatum = {
  stage: string;
  count: number;
  rate: number | null; // conversion from previous stage, 0..1
  fill: string;
};

export type FunnelChartProps = {
  saved: number;
  applied: number;
  interview: number;
  offer: number;
};

const COLORS = {
  saved: '#71717a',
  applied: '#6366f1',
  interview: '#f59e0b',
  offer: '#10b981',
};

export function FunnelChart({ saved, applied, interview, offer }: FunnelChartProps) {
  const rate = (n: number, d: number) => (d === 0 ? null : n / d);
  const data: FunnelDatum[] = [
    { stage: 'Saved', count: saved, rate: null, fill: COLORS.saved },
    { stage: 'Applied', count: applied, rate: rate(applied, saved), fill: COLORS.applied },
    {
      stage: 'Interview',
      count: interview,
      rate: rate(interview, applied),
      fill: COLORS.interview,
    },
    { stage: 'Offer', count: offer, rate: rate(offer, interview), fill: COLORS.offer },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, bottom: 8, left: 8 }}>
          <XAxis type="number" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="stage"
            stroke="#a1a1aa"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, item: any) => {
              const r = (item?.payload as FunnelDatum | undefined)?.rate;
              const pct = r === null || r === undefined ? '' : ` (${Math.round(r * 100)}%)`;
              return `${value as number}${pct}`;
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28} label={renderRateLabel as unknown as boolean}>
            {data.map((d) => (
              <Cell key={d.stage} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type LabelProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
};

function renderRateLabel(props: LabelProps) {
  const { x = 0, y = 0, width = 0, height = 0 } = props;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fill="#a1a1aa"
      fontSize={11}
      textAnchor="start"
    >
      {props.value}
    </text>
  );
}
