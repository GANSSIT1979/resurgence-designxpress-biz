type SummaryItem = {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning";
};

export function WorkflowSummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <section className="dashboard-surface" style={{ padding: 18 }}>
      <div className="workflow-summary-grid">
        {items.map((item) => (
          <div key={item.label} className={`workflow-summary-card workflow-summary-${item.tone || "default"}`}>
            <div className="workflow-summary-value">{item.value}</div>
            <div className="workflow-summary-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
