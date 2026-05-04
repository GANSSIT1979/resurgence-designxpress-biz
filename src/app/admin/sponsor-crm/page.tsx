'use client';

import { useEffect, useMemo, useState } from 'react';

const stages = [
  { key: 'LEAD', label: 'Lead' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'NEGOTIATING', label: 'Negotiating' },
  { key: 'PAID', label: 'Paid' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function SponsorCRM() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/sponsor/list')
      .then(r => r.json())
      .then(d => setItems(d.data || []));
  }, []);

  async function updateStage(id: string, status: string) {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, status } : i))
    );

    await fetch('/api/sponsor/update-stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  }

  const stats = useMemo(() => ({
    total: items.length,
    approved: items.filter(i => i.status === 'APPROVED').length,
    active: items.filter(i => i.status === 'CONVERTED_TO_ACTIVE_SPONSOR').length,
  }), [items]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Sponsor CRM Pipeline</h1>

      <div style={{ display: 'flex', gap: 16 }}>
        <Stat label="Total" value={stats.total} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Active" value={stats.active} />
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
        {stages.map(stage => (
          <div key={stage.key} style={{ width: 250 }}>
            <h3>{stage.label}</h3>

            {items
              .filter(i => i.status === stage.key)
              .map(item => (
                <div key={item.id} style={{ border: '1px solid #ddd', padding: 10 }}>
                  <strong>{item.companyName || 'Sponsor'}</strong>

                  <select
                    value={item.status}
                    onChange={e => updateStage(item.id, e.target.value)}
                  >
                    {stages.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 10 }}>
      {label}: <strong>{value}</strong>
    </div>
  );
}