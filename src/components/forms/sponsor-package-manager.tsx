'use client';

import { useState } from 'react';

type SponsorPackageTemplate = {
  id: string;
  name: string;
  tier: string;
  rangeLabel: string;
  summary: string;
  benefits: string;
  sortOrder: number;
  isActive: boolean;
};

const initialState = {
  name: '',
  tier: '',
  rangeLabel: '',
  summary: '',
  benefits: '',
  sortOrder: 0,
  isActive: true,
};

export function SponsorPackageManager({ initialItems }: { initialItems: SponsorPackageTemplate[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttonLabel = editingId ? 'Update Package Template' : 'Create Package Template';

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: SponsorPackageTemplate) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      tier: item.tier,
      rangeLabel: item.rangeLabel,
      summary: item.summary,
      benefits: item.benefits,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/admin/sponsor-packages/${editingId}` : '/api/admin/sponsor-packages', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save package template.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Package template updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Package template created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/sponsor-packages/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete package template.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Package template deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Tier-Based Package Templates</div>
        <h2 style={{ marginTop: 0 }}>Manage Sponsor Package Templates</h2>
        <p className="helper">Use these templates to keep the admin CMS, sponsor application, and public deck aligned.</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Tier label" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} required />
          <input className="input" placeholder="Budget range label" value={form.rangeLabel} onChange={(e) => setForm({ ...form, rangeLabel: e.target.value })} required />
          <textarea className="textarea" placeholder="Short summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required />
          <textarea className="textarea" placeholder="Benefits (one per line)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} required />
          <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Template is active
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{buttonLabel}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Current Templates</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Template</th>
                <th>Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="helper">{item.summary}</div>
                  </td>
                  <td>{item.rangeLabel}</td>
                  <td>{item.isActive ? 'Active' : 'Draft'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
