type KPIItem = {
  label: string;
  value: string;
};

export function KPIGrid({ items }: { items: KPIItem[] }) {
  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <div className="card kpi-card" key={`${item.label}-${item.value}`}>
          <div className="kpi-value">{item.value}</div>
          <div className="kpi-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
