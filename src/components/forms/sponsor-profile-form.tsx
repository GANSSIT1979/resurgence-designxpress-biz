'use client';

import { useState } from 'react';
import { ImageUploadField } from '@/components/image-upload-field';

type SponsorProfileItem = {
  id: string;
  sponsorId: string | null;
  preferredPackageId: string | null;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string | null;
  websiteUrl: string | null;
  address: string | null;
  brandSummary: string | null;
  assetLink: string | null;
};

type SponsorOption = { id: string; name: string; tier: string };
type PackageOption = { id: string; name: string; rangeLabel: string };

export function SponsorProfileForm({
  initialItem,
  sponsors,
  packages,
}: {
  initialItem: SponsorProfileItem;
  sponsors: SponsorOption[];
  packages: PackageOption[];
}) {
  const [form, setForm] = useState({
    sponsorId: initialItem.sponsorId || '',
    preferredPackageId: initialItem.preferredPackageId || '',
    companyName: initialItem.companyName,
    contactName: initialItem.contactName,
    contactEmail: initialItem.contactEmail,
    phone: initialItem.phone || '',
    websiteUrl: initialItem.websiteUrl || '',
    address: initialItem.address || '',
    brandSummary: initialItem.brandSummary || '',
    assetLink: initialItem.assetLink || '',
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch('/api/sponsor/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update profile.');
      return;
    }

    setNotice('Sponsor profile updated.');
    setForm({
      sponsorId: data.item.sponsorId || '',
      preferredPackageId: data.item.preferredPackageId || '',
      companyName: data.item.companyName,
      contactName: data.item.contactName,
      contactEmail: data.item.contactEmail,
      phone: data.item.phone || '',
      websiteUrl: data.item.websiteUrl || '',
      address: data.item.address || '',
      brandSummary: data.item.brandSummary || '',
      assetLink: data.item.assetLink || '',
    });
  }

  return (
    <section className="card">
      <div className="section-kicker">Sponsor Identity</div>
      <h2 style={{ marginTop: 0 }}>Manage Sponsor Profile</h2>
      <p className="helper">Update brand details, choose your preferred package tier, and keep your sponsor account aligned with billing and deliverables.</p>
      {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

      <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
        <select className="input" value={form.sponsorId} onChange={(e) => setForm({ ...form, sponsorId: e.target.value })}>
          <option value="">Link sponsor record (optional)</option>
          {sponsors.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.tier}</option>)}
        </select>
        <select className="input" value={form.preferredPackageId} onChange={(e) => setForm({ ...form, preferredPackageId: e.target.value })}>
          <option value="">Preferred package</option>
          {packages.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.rangeLabel}</option>)}
        </select>
        <input className="input" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
        <input className="input" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
        <input className="input" type="email" placeholder="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required />
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
        <input className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <textarea className="textarea" placeholder="Brand summary" value={form.brandSummary} onChange={(e) => setForm({ ...form, brandSummary: e.target.value })} />
        <ImageUploadField
          label="Brand asset image"
          value={form.assetLink}
          scope="brand-profile"
          helper="Upload a sponsor-facing brand asset for your profile, or paste a hosted asset / drive link."
          onChange={(value) => setForm({ ...form, assetLink: value })}
        />
        <button className="btn" type="submit">Update Sponsor Profile</button>
      </form>
    </section>
  );
}
