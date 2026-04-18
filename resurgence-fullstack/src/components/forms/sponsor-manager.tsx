'use client';

import { useMemo, useState } from 'react';
import { ImageUploadField } from '@/components/image-upload-field';

type Sponsor = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  shortDescription: string;
  packageValue: string;
  benefits: string;
  sortOrder: number;
  isActive: boolean;
};

type SponsorInput = Omit<Sponsor, 'id'>;

const emptyForm: SponsorInput = {
  name: '',
  slug: '',
  tier: 'Gold Sponsor',
  logoUrl: '',
  websiteUrl: '',
  shortDescription: '',
  packageValue: '',
  benefits: '',
  sortOrder: 0,
  isActive: true,
};

export function SponsorManager({ initialSponsors }: { initialSponsors: Sponsor[] }) {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [form, setForm] = useState<SponsorInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const buttonLabel = useMemo(() => (editingId ? 'Save Sponsor' : 'Add Sponsor'), [editingId]);

  function hydrateForm(item: Sponsor) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      tier: item.tier,
      logoUrl: item.logoUrl ?? '',
      websiteUrl: item.websiteUrl ?? '',
      shortDescription: item.shortDescription,
      packageValue: item.packageValue,
      benefits: item.benefits,
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

    const url = editingId ? `/api/admin/sponsors/${editingId}` : '/api/admin/sponsors';
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save sponsor.');
      return;
    }

    if (editingId) {
      setSponsors((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Sponsor updated successfully.');
    } else {
      setSponsors((current) => [data.item, ...current]);
      setNotice('Sponsor created successfully.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete sponsor.');
      return;
    }

    setSponsors((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Sponsor removed successfully.');
  }

  return (
    <div className="card-grid">
      <section className="card">
        <div className="section-kicker">Sponsor CMS</div>
        <h2 style={{ marginBottom: 8 }}>{editingId ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
        <p className="helper">Use this form to manage sponsor tiers, package values, and benefits shown on the public website.</p>
        <form className="form-grid" onSubmit={submitForm} style={{ marginTop: 18 }}>
          {notice ? <div className="notice success">{notice}</div> : null}
          {error ? <div className="notice error">{error}</div> : null}
          <input className="input" placeholder="Sponsor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <input className="input" placeholder="Tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} required />
          <ImageUploadField
            label="Sponsor logo"
            value={form.logoUrl ?? ''}
            scope="sponsor"
            helper="Upload a sponsor logo directly or keep using an existing hosted asset URL."
            onChange={(value) => setForm({ ...form, logoUrl: value })}
          />
          <input className="input" placeholder="Website URL" value={form.websiteUrl ?? ''} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <input className="input" placeholder="Package value" value={form.packageValue} onChange={(e) => setForm({ ...form, packageValue: e.target.value })} required />
          <textarea className="textarea" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} required />
          <textarea className="textarea" placeholder="Benefits (one per line)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} required />
          <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Publish this sponsor on the public site
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{buttonLabel}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Current Sponsors</div>
        {sponsors.length === 0 ? (
          <div className="empty-state">No sponsors found yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tier</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="helper">{item.shortDescription}</div>
                    </td>
                    <td>{item.tier}</td>
                    <td>{item.packageValue}</td>
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
