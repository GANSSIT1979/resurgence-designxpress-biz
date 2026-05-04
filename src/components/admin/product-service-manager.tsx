'use client';

import { useMemo, useState } from 'react';

export type ProductServiceItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string;
  priceLabel: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  name: '',
  category: '',
  description: '',
  features: '',
  priceLabel: '',
  sortOrder: 0,
  isActive: true,
};

export function ProductServiceManager({ initialItems }: { initialItems: ProductServiceItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.name, item.category, item.description, item.features, item.priceLabel || '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function hydrateForm(item: ProductServiceItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      features: item.features,
      priceLabel: item.priceLabel || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/admin/product-services/${editingId}` : '/api/admin/product-services', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save product/service.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Product / service updated successfully.');
    } else {
      setItems((current) => [...current, data.item].sort((a, b) => a.sortOrder - b.sortOrder));
      setNotice('Product / service created successfully.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);
    const response = await fetch(`/api/admin/product-services/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete product/service.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Product / service deleted successfully.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Products and Services CMS</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Product / Service' : 'Add Product / Service'}</h2>
        <p className="helper">Manage the public services page with structured categories, descriptions, feature lists, ordering, and publication state.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <textarea className="textarea" placeholder="Features (one per line)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} required />
          <input className="input" placeholder="Price label / pricing note" value={form.priceLabel} onChange={(e) => setForm({ ...form, priceLabel: e.target.value })} />
          <input className="input" type="number" min="0" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} required />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Show on public Services page
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Save Changes' : 'Add New Item'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Published Service Items</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search by name, category, or content" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="helper">{item.priceLabel || 'No pricing note'}</div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.isActive ? 'Published' : 'Hidden'}</td>
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
