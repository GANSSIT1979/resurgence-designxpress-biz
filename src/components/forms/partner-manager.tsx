'use client';

import { useMemo, useState } from 'react';

type Partner = {
  id: string;
  name: string;
  slug: string;
  category: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  shortDescription: string;
  services: string;
  sortOrder: number;
  isActive: boolean;
};

type PartnerInput = Omit<Partner, 'id'>;

const emptyForm: PartnerInput = {
  name: '',
  slug: '',
  category: 'Media',
  logoUrl: '',
  websiteUrl: '',
  shortDescription: '',
  services: '',
  sortOrder: 0,
  isActive: true,
};

export function PartnerManager({ initialPartners }: { initialPartners: Partner[] }) {
  const [partners, setPartners] = useState(initialPartners);
  const [form, setForm] = useState<PartnerInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const buttonLabel = useMemo(() => (editingId ? 'Save Partner' : 'Add Partner'), [editingId]);

  function hydrateForm(item: Partner) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      category: item.category,
      logoUrl: item.logoUrl ?? '',
      websiteUrl: item.websiteUrl ?? '',
      shortDescription: item.shortDescription,
      services: item.services,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const url = editingId ? `/api/admin/partners/${editingId}` : '/api/admin/partners';
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save partner.');
      return;
    }

    if (editingId) {
      setPartners((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Partner updated successfully.');
    } else {
      setPartners((current) => [data.item, ...current]);
      setNotice('Partner created successfully.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete partner.');
      return;
    }

    setPartners((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Partner removed successfully.');
  }

  return (
    <div className="card-grid">
      <section className="card">
        <div className="section-kicker">Partner CMS</div>
        <h2 style={{ marginBottom: 8 }}>{editingId ? 'Edit Partner' : 'Add Partner'}</h2>
        <p className="helper">Manage partner categories, descriptions, and service offerings featured on the site.</p>
        <form className="form-grid" onSubmit={submitForm} style={{ marginTop: 18 }}>
          {notice ? <div className="notice success">{notice}</div> : null}
          {error ? <div className="notice error">{error}</div> : null}
          <input className="input" placeholder="Partner name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="input" placeholder="Logo image URL or local asset path" value={form.logoUrl ?? ''} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <input className="input" placeholder="Website URL" value={form.websiteUrl ?? ''} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <textarea className="textarea" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} required />
          <textarea className="textarea" placeholder="Services (one per line)" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} required />
          <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Publish this partner on the public site
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{buttonLabel}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Current Partners</div>
        {partners.length === 0 ? (
          <div className="empty-state">No partners found yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="helper">{item.shortDescription}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.isActive ? 'Published' : 'Draft'}</td>
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
        )}
      </section>
    </div>
  );
}
