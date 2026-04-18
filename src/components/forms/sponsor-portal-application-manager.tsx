'use client';

import { useMemo, useState } from 'react';

type SponsorApplicationItem = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  websiteUrl: string | null;
  category: string;
  interestedPackage: string;
  budgetRange: string;
  timeline: string | null;
  message: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
};

type PackageOption = { id: string; name: string; rangeLabel: string };
type ProfileSeed = { companyName: string; contactName: string; contactEmail: string; phone?: string | null; websiteUrl?: string | null; preferredPackageName?: string | null };

const initialState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  websiteUrl: '',
  category: 'Brand Collaboration',
  interestedPackage: '',
  budgetRange: '',
  timeline: '',
  message: '',
};

export function SponsorPortalApplicationManager({
  initialItems,
  packages,
  profile,
}: {
  initialItems: SponsorApplicationItem[];
  packages: PackageOption[];
  profile: ProfileSeed;
}) {
  const defaultPackage = packages.find((item) => item.name === profile.preferredPackageName) || packages[0];
  const seededState = {
    ...initialState,
    companyName: profile.companyName || '',
    contactName: profile.contactName || '',
    email: profile.contactEmail || '',
    phone: profile.phone || '',
    websiteUrl: profile.websiteUrl || '',
    interestedPackage: defaultPackage?.name || '',
    budgetRange: defaultPackage?.rangeLabel || '',
  };

  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(seededState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.companyName, item.interestedPackage, item.status, item.category].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm(seededState);
    setEditingId(null);
  }

  function onSelectPackage(value: string) {
    const match = packages.find((item) => item.name === value);
    setForm((current) => ({
      ...current,
      interestedPackage: value,
      budgetRange: match?.rangeLabel || current.budgetRange,
    }));
  }

  function hydrateForm(item: SponsorApplicationItem) {
    setEditingId(item.id);
    setForm({
      companyName: item.companyName,
      contactName: item.contactName,
      email: item.email,
      phone: item.phone || '',
      websiteUrl: item.websiteUrl || '',
      category: item.category,
      interestedPackage: item.interestedPackage,
      budgetRange: item.budgetRange,
      timeline: item.timeline || '',
      message: item.message,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/sponsor/applications/${editingId}` : '/api/sponsor/applications', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save application.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Application updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Application created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);
    const response = await fetch(`/api/sponsor/applications/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete application.');
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Application removed.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Sponsor Application Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Sponsor Application' : 'Create Sponsor Application'}</h2>
        <p className="helper">Submit and manage your sponsor-side package requests using the same naming and budget ranges as the 2026 deck.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Company / brand" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <input className="input" placeholder="Contact person" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Website / social link" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <input className="input" placeholder="Industry category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <select className="input" value={form.interestedPackage} onChange={(e) => onSelectPackage(e.target.value)} required>
            <option value="">Select package</option>
            {packages.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <input className="input" placeholder="Budget range" value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} required />
          <input className="input" placeholder="Timeline" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
          <textarea className="textarea" placeholder="Campaign goals / package notes" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Application' : 'Create Application'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Application Register</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search package, status, category, or company" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Package</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.companyName}</strong>
                    <div className="helper">{item.contactName}</div>
                    <div className="helper">{item.category}</div>
                  </td>
                  <td>{item.interestedPackage}<div className="helper">{item.budgetRange}</div></td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No sponsor applications found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
