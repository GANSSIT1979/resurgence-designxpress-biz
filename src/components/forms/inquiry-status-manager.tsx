'use client';

import { useState } from 'react';

type Inquiry = {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  inquiryType: string;
  message: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'CONTACTED' | 'QUALIFIED' | 'PENDING_RESPONSE' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
};

const statuses: Inquiry['status'][] = ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE', 'CLOSED', 'ARCHIVED'];

export function InquiryStatusManager({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [items, setItems] = useState(initialInquiries);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: Inquiry['status']) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update inquiry.');
      return;
    }

    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    setNotice('Inquiry updated successfully.');
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete inquiry.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    setNotice('Inquiry deleted successfully.');
  }

  return (
    <section className="card">
      <div className="section-kicker">Lead Pipeline</div>
      <h2 style={{ marginBottom: 8 }}>Manage Inquiry Status</h2>
      <p className="helper">Track leads from submission through qualification, follow-up, and closure.</p>
      {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <div className="helper">{item.organization || 'Independent / Not specified'}</div>
                  <div className="helper">{item.email}</div>
                  {item.phone ? <div className="helper">{item.phone}</div> : null}
                </td>
                <td>{item.inquiryType}</td>
                <td>
                  <div style={{ maxWidth: 360 }} className="helper">{item.message}</div>
                </td>
                <td>
                  <span className={`status-pill status-${item.status}`}>{item.status}</span>
                  <div style={{ height: 10 }} />
                  <select className="select" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as Inquiry['status'])}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
