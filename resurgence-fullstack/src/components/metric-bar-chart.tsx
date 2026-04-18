'use client';

type ChartItem = {
  label: string;
  value: number;
  helper?: string;
};

export function MetricBarChart({
  title,
  items,
  valueFormatter = (value: number) => String(value),
}: {
  title: string;
  items: ChartItem[];
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = items.reduce((current, item) => Math.max(current, item.value), 0) || 1;

  return (
    <section className="card">
      <div className="section-kicker">Chart</div>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div className="metric-bar-chart">
        {items.map((item) => (
          <div className="metric-bar-row" key={item.label}>
            <div className="metric-bar-meta">
              <strong>{item.label}</strong>
              <span>{valueFormatter(item.value)}</span>
            </div>
            <div className="metric-bar-track">
              <div className="metric-bar-fill" style={{ width: `${item.value > 0 ? Math.max(6, (item.value / maxValue) * 100) : 0}%` }} />
            </div>
            {item.helper ? <div className="helper">{item.helper}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
