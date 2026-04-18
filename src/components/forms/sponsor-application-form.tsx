'use client';

import { useState } from 'react';

const packageOptions = [
  { label: 'Supporting Sponsor', value: 'Supporting Sponsor', budget: 'PHP 15,000–50,000' },
  { label: 'Official Brand Partner', value: 'Official Brand Partner', budget: 'PHP 75,000–95,000' },
  { label: 'Major Partner', value: 'Major Partner', budget: 'PHP 120,000–150,000' },
  { label: 'Event Presenting', value: 'Event Presenting', budget: 'Custom Proposal' },
] as const;

type SponsorPackageOption = (typeof packageOptions)[number];
type SponsorApplicationFormState = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  category: string;
  interestedPackage: SponsorPackageOption['value'];
  budgetRange: SponsorPackageOption['budget'];
  timeline: string;
  message: string;
};

const initialState: SponsorApplicationFormState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  websiteUrl: '',
  category: 'Food & Beverage',
  interestedPackage: packageOptions[0].value,
  budgetRange: packageOptions[0].budget,
  timeline: '',
  message: '',
};

const categories = [
  'Food & Beverage',
  'Apparel & Footwear',
  'Sports & Fitness',
  'Telecoms & Tech',
  'Automotive',
  'Retail & E-commerce',
  'Financial Services',
  'Real Estate',
  'Education',
  'Health & Wellness',
  'Other',
] as const;

const budgets = packageOptions.map((item) => item.budget) as readonly string[];

export function SponsorApplicationForm() {
  const [form, setForm] = useState<SponsorApplicationFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function onSelectPackage(value: SponsorPackageOption['value']) {
    const match = packageOptions.find((p) => p.value === value);
    setForm((current) => ({
      ...current,
      interestedPackage: value,
      budgetRange: match?.budget ?? current.budgetRange,
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch('/api/sponsor-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit sponsor application.');
      }

      setNotice({
        type: 'success',
        message:
          'Sponsor submission received. Our team will review your selected package and respond using the contact details you provided.',
      });
      setForm(initialState);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setNotice({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {notice ? <div className={`notice ${notice.type}`}>{notice.message}</div> : null}

      <div className="split" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="label">Company / Brand</label>
          <input className="input" placeholder="Company or brand name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
        </div>
        <div>
          <label className="label">Contact Person</label>
          <input className="input" placeholder="Full name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
        </div>
      </div>

      <div className="split" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Mobile Number (optional)</label>
          <input className="input" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label">Website / Social Link (optional)</label>
        <input className="input" placeholder="https://..." value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
      </div>

      <div className="split" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="label">Industry Category</label>
          <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Preferred Package</label>
          <select className="select" value={form.interestedPackage} onChange={(e) => onSelectPackage(e.target.value as SponsorPackageOption['value'])}>
            {packageOptions.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="split" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="label">Budget Range</label>
          <select className="select" value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value as SponsorPackageOption['budget'] })}>
            {budgets.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Timeline (optional)</label>
          <input className="input" placeholder="e.g., May–June 2026" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label">Campaign Goals / Notes</label>
        <textarea className="textarea" placeholder="Tell us your goals, target audience, and what kind of branding, digital integration, on-ground activation, or commercial support you need." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
      </div>

      <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Sponsor Application'}</button>
      <div className="helper">By submitting, you agree that RESURGENCE Powered by DesignXpress may contact you regarding sponsorship opportunities.</div>
    </form>
  );
}
