'use client';

import { useEffect, useMemo, useState } from 'react';

const STAGES = ['LEAD', 'CONTACTED', 'NEGOTIATING', 'INVOICE_SENT', 'PAID', 'ACTIVE'] as const;

type SponsorLead = {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  amount?: number | null;
  stage: string;
  status?: string | null;
};

export default function SponsorCrmPage() {
  const [items, setItems] = useState<SponsorLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sponsor/list', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => setItems(json.data || []))
      .finally(() => setLoading(false));
  }, []);

  async function moveLead(id: string, stage: string) {
    const previous = items;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, stage } : item)));

    const res = await fetch('/api/sponsor/update-stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage, triggerFollowUp: ['CONTACTED', 'NEGOTIATING', 'INVOICE_SENT'].includes(stage) }),
    });

    if (!res.ok) setItems(previous);
  }

  const totalPipeline = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items],
  );

  if (loading) return <main style={{ padding: 24 }}>Loading Sponsor CRM...</main>;

  return (
    <main style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <p style={{ margin: 0, color: '#666', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12 }}>Admin / Sponsor CRM</p>
      <h1 style={{ marginTop: 6, fontSize: 36 }}>Sponsor CRM Pipeline</h1>
      <p style={{ color: '#555' }}>Pipeline value: PHP {totalPipeline.toLocaleString('en-PH')}</p>

      <section style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))`, gap: 14, overflowX: 'auto' }}>
        {STAGES.map((stage) => {
          const columnItems = items.filter((item) => item.stage === stage || (!item.stage && stage === 'LEAD'));
          return (
            <div key={stage} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fafafa', minHeight: 360 }}>
              <h2 style={{ fontSize: 15, marginTop: 0 }}>{stage}</h2>
              <strong>{columnItems.length} leads</strong>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {columnItems.map((item) => (
                  <article key={item.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: '#fff' }}>
                    <strong>{item.company || item.name}</strong>
                    <p style={{ margin: '4px 0', color: '#555' }}>{item.email || 'No email'}</p>
                    <p style={{ margin: '4px 0' }}>PHP {Number(item.amount || 0).toLocaleString('en-PH')}</p>
                    <select value={item.stage || 'LEAD'} onChange={(event) => moveLead(item.id, event.target.value)} style={{ width: '100%', padding: 8 }}>
                      {STAGES.map((targetStage) => <option key={targetStage} value={targetStage}>{targetStage}</option>)}
                    </select>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
