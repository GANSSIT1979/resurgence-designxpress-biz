export function KPIGrid({
  items
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <div className="card kpi-card" key={item.label}>
          <div className="kpi-value">{item.value}</div>
          <div className="kpi-label">{item.label}</div>
          {item.hint ? <div className="muted">{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
