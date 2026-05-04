'use client';

import { useMemo, useState } from 'react';

type PartnerCampaignItem = {
  id: string;
  title: string;
  campaignType: string;
  status: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  contributionValue: number | null;
  assetLink: string | null;
};

const initialState = {
  title: '',
  campaignType: '',
  status: 'PLANNING',
  description: '',
  startDate: '',
  endDate: '',
  contributionValue: '',
  assetLink: '',
};

export function PartnerCampaignManager({ initialItems }: { initialItems: PartnerCampaignItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.title, item.campaignType, item.status, item.description || ''].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function hydrateForm(item: PartnerCampaignItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      campaignType: item.campaignType,
      status: item.status,
      description: item.description || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      contributionValue: item.contributionValue?.toString() || '',
      assetLink: item.assetLink || '',
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

    const response = await fetch(editingId ? `/api/partner/campaigns/${editingId}` : '/api/partner/campaigns', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save campaign.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Campaign updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Campaign created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/partner/campaigns/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete campaign.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Campaign deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Campaign Workspace</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Campaign' : 'Create Campaign'}</h2>
        <p className="helper">Track active partner campaigns, timelines, contribution values, and collaboration assets.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Campaign type" value={form.campaignType} onChange={(e) => setForm({ ...form, campaignType: e.target.value })} required />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <textarea className="textarea" placeholder="Campaign description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <input className="input" type="number" min="0" placeholder="Contribution value (PHP)" value={form.contributionValue} onChange={(e) => setForm({ ...form, contributionValue: e.target.value })} />
          <input className="input" placeholder="Asset / campaign link" value={form.assetLink} onChange={(e) => setForm({ ...form, assetLink: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Campaign' : 'Create Campaign'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Campaign Register</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search title, type, or status" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Timeline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.campaignType}</div>
                    {item.contributionValue ? <div className="helper">PHP {item.contributionValue.toLocaleString()}</div> : null}
                  </td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>{item.startDate ? item.startDate.slice(0, 10) : '—'} → {item.endDate ? item.endDate.slice(0, 10) : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No campaigns found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
