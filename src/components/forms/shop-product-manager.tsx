'use client';

import { useMemo, useState } from 'react';
import { ImageUploadField } from '@/components/image-upload-field';

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
  badgeLabel: string | null;
  material: string | null;
  fitNotes: string | null;
  careInstructions: string | null;
  availableSizes: string | null;
  availableColors: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  isOfficialMerch: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
};

const emptyForm = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  shortDescription: '',
  price: 0,
  compareAtPrice: '',
  stock: 0,
  imageUrl: '/assets/resurgence-poster.jpg',
  badgeLabel: 'Official Drop',
  material: '',
  fitNotes: '',
  careInstructions: '',
  availableSizes: 'XS, S, M, L, XL, 2XL',
  availableColors: 'Black/Red',
  sortOrder: 0,
  isActive: true,
  isFeatured: false,
  isOfficialMerch: true,
  categoryId: '',
};

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function formatMoney(value: number) {
  return `PHP ${value.toLocaleString()}`;
}

export function ShopProductManager({ initialItems, categories }: { initialItems: Item[]; categories: { id: string; name: string }[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || [
        item.name,
        item.slug,
        item.sku || '',
        item.badgeLabel || '',
        item.category?.name || '',
      ].join(' ').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'published' && item.isActive)
        || (statusFilter === 'hidden' && !item.isActive)
        || (statusFilter === 'featured' && item.isFeatured)
        || (statusFilter === 'official' && item.isOfficialMerch);
      const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, items, search, statusFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function setName(name: string) {
    setForm((current: any) => ({
      ...current,
      name,
      slug: editingId || current.slug ? current.slug : toSlug(name),
    }));
  }

  function hydrate(item: Item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      sku: item.sku || '',
      description: item.description,
      shortDescription: item.shortDescription || '',
      price: item.price,
      compareAtPrice: item.compareAtPrice || '',
      stock: item.stock,
      imageUrl: item.imageUrl || '/assets/resurgence-poster.jpg',
      badgeLabel: item.badgeLabel || '',
      material: item.material || '',
      fitNotes: item.fitNotes || '',
      careInstructions: item.careInstructions || '',
      availableSizes: item.availableSizes || '',
      availableColors: item.availableColors || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      isFeatured: item.isFeatured,
      isOfficialMerch: item.isOfficialMerch,
      categoryId: item.categoryId || '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);
    const payload = { ...form, slug: form.slug || toSlug(form.name) };
    const response = await fetch(editingId ? `/api/admin/shop-products/${editingId}` : '/api/admin/shop-products', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save product.');
      return;
    }
    if (editingId) {
      setItems((current) => current.map((item) => item.id === editingId ? data.item : item));
      setNotice('Official merch product updated successfully.');
    } else {
      setItems((current) => [...current, data.item].sort((a, b) => a.sortOrder - b.sortOrder));
      setNotice('Official merch product created successfully.');
    }
    resetForm();
  }

  async function removeItem(id: string) {
    if (!window.confirm('Delete this merch product? Existing order history will keep its copied item details.')) return;
    const response = await fetch(`/api/admin/shop-products/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete product.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Product deleted successfully.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Official Merch CMS</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Merch Product' : 'Create Merch Product'}</h2>
        <p className="helper">Manage product copy, variants, pricing, stock, upload-ready images, and official Resurgence drop metadata.</p>
        {notice ? <div className="notice success" style={{ marginTop: 16 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 16 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 16 }} onSubmit={onSubmit}>
          <div className="card-grid grid-2">
            <input className="input" placeholder="Product name" value={form.name} onChange={(event) => setName(event.target.value)} required />
            <input className="input" placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: toSlug(event.target.value) })} required />
          </div>
          <div className="card-grid grid-2">
            <input className="input" placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
            <input className="input" placeholder="Badge label" value={form.badgeLabel} onChange={(event) => setForm({ ...form, badgeLabel: event.target.value })} />
          </div>
          <select className="select" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">No category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>

          <ImageUploadField
            label="Product image"
            scope="merch"
            value={form.imageUrl}
            helper="Use a square or landscape merch mockup. Vercel uploads are stored durably in the database and served through the upload API."
            onChange={(value) => setForm({ ...form, imageUrl: value })}
          />

          <textarea className="textarea" placeholder="Full product description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <input className="input" placeholder="Short product card description" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} />

          <div className="card-grid grid-2">
            <input className="input" type="number" min="1" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required />
            <input className="input" type="number" min="1" placeholder="Compare-at price" value={form.compareAtPrice} onChange={(event) => setForm({ ...form, compareAtPrice: event.target.value })} />
          </div>
          <div className="card-grid grid-2">
            <input className="input" type="number" min="0" placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} required />
            <input className="input" type="number" min="0" placeholder="Sort order" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} required />
          </div>

          <div className="card-grid grid-2">
            <input className="input" placeholder="Available sizes, comma-separated" value={form.availableSizes} onChange={(event) => setForm({ ...form, availableSizes: event.target.value })} />
            <input className="input" placeholder="Available colors, comma-separated" value={form.availableColors} onChange={(event) => setForm({ ...form, availableColors: event.target.value })} />
          </div>
          <div className="card-grid grid-2">
            <input className="input" placeholder="Material" value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} />
            <input className="input" placeholder="Fit notes" value={form.fitNotes} onChange={(event) => setForm({ ...form, fitNotes: event.target.value })} />
          </div>
          <textarea className="textarea" placeholder="Care instructions" value={form.careInstructions} onChange={(event) => setForm({ ...form, careInstructions: event.target.value })} />

          <div className="merch-admin-flags">
            <label className="helper"><input type="checkbox" checked={form.isOfficialMerch} onChange={(event) => setForm({ ...form, isOfficialMerch: event.target.checked })} /> Official Resurgence merch</label>
            <label className="helper"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} /> Feature on storefront</label>
            <label className="helper"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Publish product</label>
          </div>

          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Save Merch Product' : 'Create Merch Product'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Merch Catalog</div>
        <h2 style={{ marginTop: 0 }}>Published and draft drops</h2>
        <div className="merch-admin-toolbar">
          <input className="input" placeholder="Search products, SKUs, badges, categories" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
            <option value="featured">Featured</option>
            <option value="official">Official merch</option>
          </select>
          <select className="select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="merch-admin-product-cell">
                      <img src={item.imageUrl || '/assets/resurgence-poster.jpg'} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <div className="helper">{item.category?.name || 'Uncategorized'} - {item.slug}</div>
                        <div className="helper">{item.badgeLabel || 'Official Drop'} - {item.sku || 'No SKU'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatMoney(item.price)}{item.compareAtPrice ? <div className="helper">Was {formatMoney(item.compareAtPrice)}</div> : null}</td>
                  <td>{item.stock}</td>
                  <td>
                    <div className="helper">{item.isActive ? 'Published' : 'Hidden'}</div>
                    <div className="helper">{item.isFeatured ? 'Featured' : 'Standard'} - {item.isOfficialMerch ? 'Official merch' : 'External item'}</div>
                  </td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrate(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <div className="empty-state">No merch products match your filters.</div> : null}
        </div>
      </section>
    </div>
  );
}
