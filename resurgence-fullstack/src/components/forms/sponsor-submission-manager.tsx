'use client';

import { useMemo, useState } from 'react';

type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_ACTIVE_SPONSOR';

type SponsorSubmission = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  websiteUrl: string | null;
  category: string;
  interestedPackage: string;
  budgetRange: string;
  timeline: string | null;
  message: string;
  status: SubmissionStatus;
  internalNotes: string | null;
  createdAt: string;
};

const statuses: SubmissionStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED', 'CONVERTED_TO_ACTIVE_SPONSOR'];

export function SponsorSubmissionManager({ initialSubmissions }: { initialSubmissions: SponsorSubmission[] }) {
  const [items, setItems] = useState(initialSubmissions);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(() => items.find((i) => i.id === activeId) || null, [items, activeId]);

  async function updateSubmission(id: string, update: Partial<Pick<SponsorSubmission, 'status' | 'internalNotes'>>) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/sponsor-submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update submission.');
      return;
    }

    setItems((current) => current.map((item) => (item.id === id ? data.item : item)));
    setNotice('Submission updated successfully.');
  }

  async function deleteSubmission(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/sponsor-submissions/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete submission.');
      return;
    }

    const remaining = items.filter((item) => item.id !== id);
    setItems(remaining);
    if (activeId === id) {
      setActiveId(remaining[0]?.id ?? null);
    }
    setNotice('Submission removed.');
  }

  return (
    <div className="card-grid" style={{ gridTemplateColumns: '340px 1fr' }}>
      <section className="card">
        <div className="section-kicker">2026 Sponsor Pipeline</div>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Sponsor Submissions</h2>
        <p className="helper">Review applications submitted from the public sponsorship form and manage the deck-aligned approval workflow.</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <div className="table-wrap" style={{ marginTop: 18 }}>
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ cursor: 'pointer', background: item.id === activeId ? 'rgba(77,192,255,0.08)' : 'transparent' }} onClick={() => setActiveId(item.id)}>
                  <td>
                    <strong>{item.companyName}</strong>
                    <div className="helper">{item.interestedPackage} • {item.budgetRange}</div>
                  </td>
                  <td>
                    <span className={`status-pill status-${item.status}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-kicker">Submission Details</div>
        {active ? (
          <>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>{active.companyName}</h2>
            <div className="helper" style={{ marginBottom: 14 }}>Submitted by {active.contactName} • {new Date(active.createdAt).toLocaleString()}</div>

            <div className="card-grid grid-2">
              <div className="panel">
                <div className="helper">Email</div>
                <strong>{active.email}</strong>
                {active.phone ? <div className="helper" style={{ marginTop: 8 }}>Phone: {active.phone}</div> : null}
                {active.websiteUrl ? <div className="helper" style={{ marginTop: 8 }}>Website: {active.websiteUrl}</div> : null}
              </div>
              <div className="panel">
                <div className="helper">Category</div>
                <strong>{active.category}</strong>
                <div className="helper" style={{ marginTop: 8 }}>Package: {active.interestedPackage}</div>
                <div className="helper">Budget: {active.budgetRange}</div>
                {active.timeline ? <div className="helper">Timeline: {active.timeline}</div> : null}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 18 }}>
              <div className="helper" style={{ marginBottom: 10 }}>Message</div>
              <div className="section-copy" style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{active.message}</div>
            </div>

            <div className="split" style={{ marginTop: 18 }}>
              <div className="panel">
                <div className="helper" style={{ marginBottom: 10 }}>Status</div>
                <select className="select" value={active.status} onChange={(e) => updateSubmission(active.id, { status: e.target.value as SubmissionStatus })}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="panel">
                <div className="helper" style={{ marginBottom: 10 }}>Internal notes</div>
                <textarea
                  className="textarea"
                  placeholder="Add follow-up notes, next steps, missing requirements, or approval guidance."
                  value={active.internalNotes || ''}
                  onChange={(e) => updateSubmission(active.id, { internalNotes: e.target.value })}
                />
              </div>
            </div>

            <div className="btn-row" style={{ marginTop: 18 }}>
              <button className="btn btn-secondary" type="button" onClick={() => deleteSubmission(active.id)}>
                Delete submission
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">No sponsor submissions yet.</div>
        )}
      </section>
    </div>
  );
}
