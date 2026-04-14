"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ChartCard({
  title,
  data,
  dataKey = "value",
  xKey = "name"
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  xKey?: string;
}) {
  return (
    <div className="card chart-card">
      <div className="card-title">{title}</div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
