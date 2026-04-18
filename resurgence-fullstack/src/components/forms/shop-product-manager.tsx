'use client';

import { useMemo, useState } from 'react';

type Item = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
};

const emptyForm = {
  name: '', slug: '', sku: '', description: '', shortDescription: '', price: 0, compareAtPrice: '', stock: 0, imageUrl: '/assets/resurgence-poster.jpg', sortOrder: 0, isActive: true, isFeatured: false, categoryId: ''
};

export function ShopProductManager({ initialItems, categories }: { initialItems: Item[]; categories: { id: string; name: string }[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => [item.name, item.slug, item.sku || '', item.category?.name || ''].join(' ').toLowerCase().includes(q));
  }, [items, search]);

  function resetForm() { setForm(emptyForm); setEditingId(null); }

  function hydrate(item: Item) {
    setEditingId(item.id);
    setForm({
      name: item.name, slug: item.slug, sku: item.sku || '', description: item.description, shortDescription: item.shortDescription || '', price: item.price, compareAtPrice: item.compareAtPrice || '', stock: item.stock, imageUrl: item.imageUrl || '/assets/resurgence-poster.jpg', sortOrder: item.sortOrder, isActive: item.isActive, isFeatured: item.isFeatured, categoryId: item.categoryId || ''
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null); setError(null);
    const response = await fetch(editingId ? `/api/admin/shop-products/${editingId}` : '/api/admin/shop-products', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to save product.');
    if (editingId) {
      setItems((current) => current.map((item) => item.id === editingId ? data.item : item));
      setNotice('Product updated successfully.');
    } else {
      setItems((current) => [...current, data.item].sort((a,b) => a.sortOrder - b.sortOrder));
      setNotice('Product created successfully.');
    }
    resetForm();
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/admin/shop-products/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to delete product.');
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Product deleted successfully.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Shop Product CMS</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Shop Product' : 'Add Shop Product'}</h2>
        {notice ? <div className="notice success" style={{ marginTop: 16 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 16 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 16 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <input className="input" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          <div className="card-grid grid-2">
            <input className="input" type="number" min="1" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            <input className="input" type="number" min="0" placeholder="Compare-at price" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
          </div>
          <div className="card-grid grid-2">
            <input className="input" type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            <input className="input" type="number" min="0" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} required />
          </div>
          <input className="input" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">No category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Feature on homepage and shop</label>
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Publish product</label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Save Changes' : 'Create Product'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>
      <section className="card">
        <div className="section-kicker">Published Shop Items</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong><div className="helper">{item.category?.name || 'Uncategorized'} • {item.slug}</div></td>
                  <td>₱{item.price.toLocaleString()}</td>
                  <td>{item.stock}</td>
                  <td>{item.isActive ? 'Published' : 'Hidden'}{item.isFeatured ? ' • Featured' : ''}</td>
                  <td><div className="btn-row"><button className="btn btn-secondary" type="button" onClick={() => hydrate(item)}>Edit</button><button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
