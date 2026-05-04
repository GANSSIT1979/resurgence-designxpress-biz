'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  interestedPackage: string;
  status: string;
};

type Props = {
  initialLeads: Lead[];
};

const statuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_REVISION',
  'APPROVED',
  'REJECTED',
  'CONVERTED_TO_ACTIVE_SPONSOR',
];

const labels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  NEEDS_REVISION: 'Needs Revision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CONVERTED_TO_ACTIVE_SPONSOR: 'Converted',
};

export function EventCrmKanban({ initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const columns = useMemo(() => {
    return statuses.map((status) => ({
      status,
      label: labels[status],
      leads: leads.filter((lead) => lead.status === status),
    }));
  }, [leads]);

  async function moveLead(leadId: string, nextStatus: string) {
    const previous = leads;
    setError('');
    setSavingId(leadId);
    setLeads((items) => items.map((lead) => (lead.id === leadId ? { ...lead, status: nextStatus } : lead)));

    try {
      const res = await fetch(`/api/admin/sponsor-crm/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        setLeads(previous);
        setError('Unable to update lead status. Changes were reverted.');
      }
    } catch (err) {
      console.error(err);
      setLeads(previous);
      setError('Unable to update lead status. Changes were reverted.');
    } finally {
      setSavingId(null);
      setDraggingId(null);
    }
  }

  return (
    <section>
      {error ? <p style={{ color: '#FCA5A5', fontWeight: 900 }}>{error}</p> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 28, alignItems: 'start' }}>
        {columns.map((column) => (
          <div
            key={column.status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const leadId = event.dataTransfer.getData('text/plain') || draggingId;
              if (leadId) moveLead(leadId, column.status);
            }}
            style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 18, padding: 16, minHeight: 220 }}
          >
            <h2 style={{ marginTop: 0 }}>{column.label}</h2>
            <p style={{ color: '#D4AF37', fontWeight: 900 }}>{column.leads.length} lead(s)</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {column.leads.map((lead) => (
                <article
                  key={lead.id}
                  draggable
                  onDragStart={(event) => {
                    setDraggingId(lead.id);
                    event.dataTransfer.setData('text/plain', lead.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  style={{ background: '#0F172A', borderRadius: 16, padding: 14, cursor: 'grab', opacity: savingId === lead.id ? 0.55 : 1 }}
                >
                  <strong>{lead.companyName}</strong>
                  <p style={{ margin: '6px 0' }}>{lead.contactName}</p>
                  <p style={{ color: '#94A3B8', margin: '6px 0' }}>{lead.email}</p>
                  <p style={{ color: '#D4AF37', margin: '6px 0' }}>{lead.interestedPackage}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    <Action href={`/admin/sponsor-crm/proposal/${lead.id}`} label="Proposal" />
                    <button onClick={() => moveLead(lead.id, 'UNDER_REVIEW')} type="button" style={buttonStyle}>Review</button>
                    <button onClick={() => moveLead(lead.id, 'APPROVED')} type="button" style={buttonStyle}>Approve</button>
                    <button onClick={() => moveLead(lead.id, 'CONVERTED_TO_ACTIVE_SPONSOR')} type="button" style={buttonStyle}>Convert</button>
                  </div>
                </article>
              ))}
              {column.leads.length === 0 ? <p style={{ color: '#94A3B8' }}>Drop leads here.</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ color: '#0B0E14', background: '#D4AF37', borderRadius: 999, padding: '7px 10px', fontWeight: 900, textDecoration: 'none', fontSize: 12 }}>
      {label}
    </Link>
  );
}

const buttonStyle = {
  color: '#0B0E14',
  background: '#D4AF37',
  border: 0,
  borderRadius: 999,
  padding: '7px 10px',
  fontWeight: 900,
  fontSize: 12,
  cursor: 'pointer',
};
