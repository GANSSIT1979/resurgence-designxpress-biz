'use client';

import { useMemo, useState } from 'react';

type PartnerAgreementItem = {
  id: string;
  title: string;
  agreementType: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  documentUrl: string | null;
  notes: string | null;
};

const initialState = {
  title: '',
  agreementType: '',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  documentUrl: '',
  notes: '',
};

export function PartnerAgreementManager({ initialItems }: { initialItems: PartnerAgreementItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.title, item.agreementType, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function hydrateForm(item: PartnerAgreementItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      agreementType: item.agreementType,
      status: item.status,
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      documentUrl: item.documentUrl || '',
      notes: item.notes || '',
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

    const response = await fetch(editingId ? `/api/partner/agreements/${editingId}` : '/api/partner/agreements', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save agreement.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Agreement updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Agreement created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/partner/agreements/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete agreement.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Agreement deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Agreement Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Agreement' : 'Create Agreement'}</h2>
        <p className="helper">Track partner agreement documents, commercial status, and renewal windows.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Agreement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Agreement type" value={form.agreementType} onChange={(e) => setForm({ ...form, agreementType: e.target.value })} required />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="TERMINATED">Terminated</option>
          </select>
          <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <input className="input" placeholder="Document URL" value={form.documentUrl} onChange={(e) => setForm({ ...form, documentUrl: e.target.value })} />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Agreement' : 'Create Agreement'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Agreement Register</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search title, type, or status" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agreement</th>
                <th>Status</th>
                <th>Period</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.agreementType}</div>
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
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No agreements found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
