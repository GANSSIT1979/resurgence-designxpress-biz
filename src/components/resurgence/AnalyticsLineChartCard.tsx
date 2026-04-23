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
import { formatCompactNumber, formatDateLabel } from '@/lib/creator-analytics/format';
import type { DailySeriesPoint } from '@/lib/creator-analytics/types';

type MetricKey =
  | 'views'
  | 'uniqueViews'
  | 'watchTimeSeconds'
  | 'completedViews'
  | 'completionRate'
  | 'avgWatchTimeSeconds';

const metricColors: Record<MetricKey, string> = {
  views: '#f59e0b',
  uniqueViews: '#f97316',
  watchTimeSeconds: '#38bdf8',
  completedViews: '#22c55e',
  completionRate: '#f472b6',
  avgWatchTimeSeconds: '#a78bfa',
};

export default function AnalyticsLineChartCard({
  title,
  subtitle,
  data,
  metric,
  valueFormatter,
}: {
  title: string;
  subtitle: string;
  data: DailySeriesPoint[];
  metric: MetricKey;
  valueFormatter?: (value: number) => string;
}) {
  const color = metricColors[metric];

  return (
    <article className="rounded-[32px] border border-white/10 bg-slate-950/88 p-5 text-white shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-white/55">{subtitle}</p>
        </div>
        <div
          className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]"
          style={{
            borderColor: `${color}55`,
            color,
            background: `${color}14`,
          }}
        >
          {metric.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              stroke="rgba(255,255,255,0.45)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.45)"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                valueFormatter ? valueFormatter(Number(value)) : formatCompactNumber(Number(value))
              }
            />
            <Tooltip
              formatter={(value) =>
                valueFormatter ? valueFormatter(Number(value)) : formatCompactNumber(Number(value))
              }
              labelFormatter={(value) => formatDateLabel(String(value))}
              contentStyle={{
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(8,10,17,0.96)',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
