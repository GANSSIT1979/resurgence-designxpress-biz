'use client';

import { useState } from 'react';

type SponsorInventoryCategory = {
  id: string;
  name: string;
  description: string;
  examples: string;
  sortOrder: number;
  isActive: boolean;
};

const initialState = {
  name: '',
  description: '',
  examples: '',
  sortOrder: 0,
  isActive: true,
};

export function SponsorInventoryManager({ initialItems }: { initialItems: SponsorInventoryCategory[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: SponsorInventoryCategory) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      examples: item.examples,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/admin/sponsor-inventory/${editingId}` : '/api/admin/sponsor-inventory', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save sponsor inventory category.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Inventory category updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Inventory category created.');
    }
    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/sponsor-inventory/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete inventory category.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Inventory category deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Sponsor Inventory CMS</div>
        <h2 style={{ marginTop: 0 }}>Manage Inventory Categories</h2>
        <p className="helper">These sections map directly to the 2026 proposal deck and sponsor package presentation.</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <textarea className="textarea" placeholder="Examples (one per line)" value={form.examples} onChange={(e) => setForm({ ...form, examples: e.target.value })} required />
          <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Category is active
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Category' : 'Create Category'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Current Inventory Structure</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Examples</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="helper">{item.description}</div>
                  </td>
                  <td><div className="helper" style={{ whiteSpace: 'pre-wrap' }}>{item.examples}</div></td>
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
