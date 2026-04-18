'use client';

import { useMemo, useState } from 'react';

type PartnerReferralItem = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  status: string;
  notes: string | null;
  estimatedValue: number | null;
};

const initialState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  status: 'NEW',
  notes: '',
  estimatedValue: '',
};

export function PartnerReferralManager({ initialItems }: { initialItems: PartnerReferralItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.companyName, item.contactName, item.email, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function hydrateForm(item: PartnerReferralItem) {
    setEditingId(item.id);
    setForm({
      companyName: item.companyName,
      contactName: item.contactName,
      email: item.email,
      phone: item.phone || '',
      status: item.status,
      notes: item.notes || '',
      estimatedValue: item.estimatedValue?.toString() || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialState);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/partner/referrals/${editingId}` : '/api/partner/referrals', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save referral.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Referral updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Referral created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/partner/referrals/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete referral.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Referral deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Referral Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Referral' : 'Create Referral'}</h2>
        <p className="helper">Capture partner leads, track their pipeline stage, and estimate contribution value.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <input className="input" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
          <input className="input" type="number" min="0" placeholder="Estimated value (PHP)" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Referral' : 'Create Referral'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Referral Pipeline</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search company, contact, or status" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Referral</th>
                <th>Status</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.companyName}</strong>
                    <div className="helper">{item.contactName} • {item.email}</div>
                  </td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>{item.estimatedValue ? `PHP ${item.estimatedValue.toLocaleString()}` : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No referrals found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
