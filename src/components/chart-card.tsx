"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

type ChartDatum = Record<string, string | number | null | undefined>;

type ChartCardProps = {
  title: string;
  subtitle?: string;
  data?: ChartDatum[];
  seriesKey?: string;
  dataKey?: string;
  xKey?: string;
  type?: "bar" | "area" | "line";
  valueFormatter?: (value: unknown) => string;
};

function defaultFormatter(value: unknown) {
  if (typeof value === "number") return value.toLocaleString();
  return String(value ?? "");
}

export function ChartCard({
  title,
  subtitle,
  data = [],
  seriesKey,
  dataKey,
  xKey = "label",
  type = "bar",
  valueFormatter = defaultFormatter,
}: ChartCardProps) {
  const yKey = seriesKey || dataKey || "value";

  const chart = (() => {
    if (type === "area") {
      return (
        <AreaChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey={xKey} stroke="rgba(159,177,207,0.8)" />
          <YAxis stroke="rgba(159,177,207,0.8)" />
          <Tooltip formatter={(value) => valueFormatter(value)} />
          <Area type="monotone" dataKey={yKey} stroke="#39b5ff" fill="#39b5ff33" />
        </AreaChart>
      );
    }

    if (type === "line") {
      return (
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey={xKey} stroke="rgba(159,177,207,0.8)" />
          <YAxis stroke="rgba(159,177,207,0.8)" />
          <Tooltip formatter={(value) => valueFormatter(value)} />
          <Line type="monotone" dataKey={yKey} stroke="#ffd34d" strokeWidth={3} dot={false} />
        </LineChart>
      );
    }

    return (
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey={xKey} stroke="rgba(159,177,207,0.8)" />
        <YAxis stroke="rgba(159,177,207,0.8)" />
        <Tooltip formatter={(value) => valueFormatter(value)} />
        <Bar dataKey={yKey} fill="#39b5ff" radius={[10, 10, 0, 0]} />
      </BarChart>
    );
  })();

  return (
    <section className="card">
      <div style={{ marginBottom: 16 }}>
        <div className="card-title">{title}</div>
        {subtitle ? <div className="muted">{subtitle}</div> : null}
      </div>

      {data.length ? (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">No chart data available yet.</div>
      )}
    </section>
  );
}
