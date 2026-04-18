'use client';

import { useState } from 'react';

type PartnerProfileItem = {
  id: string;
  partnerId: string | null;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string | null;
  websiteUrl: string | null;
  address: string | null;
  companySummary: string | null;
  assetLink: string | null;
  preferredServices: string | null;
};

type PartnerOption = { id: string; name: string; category: string };

export function PartnerProfileForm({
  initialItem,
  partners,
}: {
  initialItem: PartnerProfileItem;
  partners: PartnerOption[];
}) {
  const [form, setForm] = useState({
    partnerId: initialItem.partnerId || '',
    companyName: initialItem.companyName,
    contactName: initialItem.contactName,
    contactEmail: initialItem.contactEmail,
    phone: initialItem.phone || '',
    websiteUrl: initialItem.websiteUrl || '',
    address: initialItem.address || '',
    companySummary: initialItem.companySummary || '',
    assetLink: initialItem.assetLink || '',
    preferredServices: initialItem.preferredServices || '',
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch('/api/partner/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update partner profile.');
      return;
    }

    setNotice('Partner profile updated.');
    setForm({
      partnerId: data.item.partnerId || '',
      companyName: data.item.companyName,
      contactName: data.item.contactName,
      contactEmail: data.item.contactEmail,
      phone: data.item.phone || '',
      websiteUrl: data.item.websiteUrl || '',
      address: data.item.address || '',
      companySummary: data.item.companySummary || '',
      assetLink: data.item.assetLink || '',
      preferredServices: data.item.preferredServices || '',
    });
  }

  return (
    <section className="card">
      <div className="section-kicker">Partner Identity</div>
      <h2 style={{ marginTop: 0 }}>Manage Partner Profile</h2>
      <p className="helper">Keep your collaboration profile aligned with campaigns, referrals, agreements, and partner-facing assets.</p>
      {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

      <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
        <select className="input" value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })}>
          <option value="">Link partner record (optional)</option>
          {partners.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.category}</option>)}
        </select>
        <input className="input" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
        <input className="input" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
        <input className="input" type="email" placeholder="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required />
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
        <input className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <textarea className="textarea" placeholder="Company summary" value={form.companySummary} onChange={(e) => setForm({ ...form, companySummary: e.target.value })} />
        <textarea className="textarea" placeholder="Preferred services / collaboration scope" value={form.preferredServices} onChange={(e) => setForm({ ...form, preferredServices: e.target.value })} />
        <input className="input" placeholder="Asset / deck / logo link" value={form.assetLink} onChange={(e) => setForm({ ...form, assetLink: e.target.value })} />
        <button className="btn" type="submit">Update Partner Profile</button>
      </form>
    </section>
  );
}
