'use client';

import { useMemo, useState } from 'react';

type InquiryItem = {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  inquiryType: string;
  message: string;
  status: string;
  internalNotes: string | null;
  followUpAt: string | null;
  assignedStaffProfileId: string | null;
  createdAt: string;
};

const initialState = {
  status: 'NEW',
  internalNotes: '',
  followUpAt: '',
};

export function StaffInquiryManager({ initialItems }: { initialItems: InquiryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialState);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.name, item.organization ?? '', item.email, item.inquiryType, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function hydrateForm(item: InquiryItem) {
    setEditingId(item.id);
    setForm({
      status: item.status,
      internalNotes: item.internalNotes || '',
      followUpAt: item.followUpAt ? item.followUpAt.slice(0, 10) : '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialState);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/staff/inquiries/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update inquiry.');
      return;
    }

    setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
    setNotice('Inquiry updated and assigned to your queue.');
    resetForm();
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Inquiry Queue</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search name, organization, email, type, or status" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Inquiry</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="helper">{item.organization || item.email}</div>
                    <div className="helper">{item.inquiryType}</div>
                  </td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>{item.followUpAt ? item.followUpAt.slice(0, 10) : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>
                        {item.assignedStaffProfileId ? 'Update' : 'Claim'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No inquiries found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-kicker">Inquiry Status Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Inquiry' : 'Select an inquiry'}</h2>
        <p className="helper">Claim unassigned inquiries, update statuses, and log notes for the next follow-up touchpoint.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} disabled={!editingId}>
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PENDING_RESPONSE">Pending Response</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <input className="input" type="date" value={form.followUpAt} onChange={(e) => setForm({ ...form, followUpAt: e.target.value })} disabled={!editingId} />
          <textarea className="textarea" placeholder="Internal notes" value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} disabled={!editingId} />
          <div className="btn-row">
            <button className="btn" type="submit" disabled={!editingId}>Save Inquiry</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
      </section>
    </div>
  );
}
