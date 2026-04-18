'use client';

import { useMemo, useState } from 'react';

type DeliverableItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  dueDate: string | null;
  assetLink: string | null;
  sponsorNotes: string | null;
  adminNotes: string | null;
};

type CategoryOption = { id: string; name: string };

const statusOptions = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION', 'COMPLETED'];

const initialState = {
  title: '',
  category: '',
  status: 'PENDING',
  dueDate: '',
  assetLink: '',
  sponsorNotes: '',
};

export function SponsorDeliverableManager({
  initialItems,
  categories,
}: {
  initialItems: DeliverableItem[];
  categories: CategoryOption[];
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ ...initialState, category: categories[0]?.name || '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.title, item.category, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm({ ...initialState, category: categories[0]?.name || '' });
    setEditingId(null);
  }

  function hydrateForm(item: DeliverableItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      status: item.status,
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      assetLink: item.assetLink || '',
      sponsorNotes: item.sponsorNotes || '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/sponsor/deliverables/${editingId}` : '/api/sponsor/deliverables', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save deliverable.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Deliverable updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Deliverable created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);
    const response = await fetch(`/api/sponsor/deliverables/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete deliverable.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Deliverable removed.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Deliverable Tracker</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Deliverable' : 'Create Deliverable'}</h2>
        <p className="helper">Track branding, digital, on-ground, and commercial support items assigned to your sponsor account.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Deliverable title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <input className="input" placeholder="Asset link" value={form.assetLink} onChange={(e) => setForm({ ...form, assetLink: e.target.value })} />
          <textarea className="textarea" placeholder="Sponsor notes / submission notes" value={form.sponsorNotes} onChange={(e) => setForm({ ...form, sponsorNotes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Deliverable' : 'Create Deliverable'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Deliverable Register</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search title, category, or status" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Deliverable</th>
                <th>Status</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.category}</div>
                    {item.adminNotes ? <div className="helper">Admin: {item.adminNotes}</div> : null}
                  </td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>{item.dueDate ? item.dueDate.slice(0, 10) : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No deliverables found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
