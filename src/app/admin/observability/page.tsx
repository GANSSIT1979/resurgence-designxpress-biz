'use client';

import { useEffect, useState } from 'react';

export default function ObservabilityDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const es = new EventSource('/api/admin/metrics/stream');

    es.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data));
      } catch {}
    };

    return () => es.close();
  }, []);

  if (!data) return <div style={{ padding: 24 }}>Loading live metrics...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Live Observability Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Card title="Revenue" value={`PHP ${data.revenue}`} />
        <Card title="Outstanding" value={`PHP ${data.outstanding}`} />
        <Card title="Invoices" value={data.invoices.total} />
        <Card title="Conversion" value={`${(data.invoices.conversionRate * 100).toFixed(1)}%`} />
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>Alerts</h2>
        {data.alerts.map((a: any) => (
          <div key={a.id}>{a.title}</div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 16 }}>
      <div>{title}</div>
      <strong>{value}</strong>
    </div>
  );
}
