'use client';

import { useState } from 'react';

type SettingsForm = {
  brandName: string;
  companyName: string;
  siteUrl: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  location: string;
  currency: string;
  paymentMethods: string;
  shippingArea: string;
  contactAddress: string;
  adminTitle: string;
  adminSubtitle: string;
  reportFooter: string;
};

export function SettingsManager({ initialSettings }: { initialSettings: SettingsForm }) {
  const [form, setForm] = useState(initialSettings);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save settings.');
      return;
    }

    setNotice('Settings saved successfully. Refresh public pages to see the updated business profile.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Business Profile</div>
        <h2 style={{ marginTop: 0 }}>Brand, support, and commercial settings</h2>
        <p className="helper">
          These values power the public contact pages, footer, support routing, and system-admin business profile.
        </p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <div className="section-kicker">Brand Identity</div>
          <input
            className="input"
            placeholder="Brand name"
            value={form.brandName}
            onChange={(e) => setForm((current) => ({ ...current, brandName: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) => setForm((current) => ({ ...current, companyName: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Website URL"
            type="url"
            value={form.siteUrl}
            onChange={(e) => setForm((current) => ({ ...current, siteUrl: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Business location"
            value={form.location}
            onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
            required
          />

          <div className="section-kicker" style={{ marginTop: 10 }}>Primary Contact</div>
          <input
            className="input"
            placeholder="Primary contact name"
            value={form.contactName}
            onChange={(e) => setForm((current) => ({ ...current, contactName: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Primary contact role"
            value={form.contactRole}
            onChange={(e) => setForm((current) => ({ ...current, contactRole: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Primary contact email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm((current) => ({ ...current, contactEmail: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Primary contact phone"
            value={form.contactPhone}
            onChange={(e) => setForm((current) => ({ ...current, contactPhone: e.target.value }))}
            required
          />
          <textarea
            className="textarea"
            placeholder="Business address or service area"
            value={form.contactAddress}
            onChange={(e) => setForm((current) => ({ ...current, contactAddress: e.target.value }))}
            required
          />

          <div className="section-kicker" style={{ marginTop: 10 }}>Support Desk</div>
          <input
            className="input"
            placeholder="Support email"
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm((current) => ({ ...current, supportEmail: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Support phone"
            value={form.supportPhone}
            onChange={(e) => setForm((current) => ({ ...current, supportPhone: e.target.value }))}
            required
          />
          <textarea
            className="textarea"
            placeholder="Business hours"
            value={form.businessHours}
            onChange={(e) => setForm((current) => ({ ...current, businessHours: e.target.value }))}
            required
          />

          <div className="section-kicker" style={{ marginTop: 10 }}>Commercial Details</div>
          <input
            className="input"
            placeholder="Currency"
            value={form.currency}
            onChange={(e) => setForm((current) => ({ ...current, currency: e.target.value }))}
            required
          />
          <textarea
            className="textarea"
            placeholder="Payment methods"
            value={form.paymentMethods}
            onChange={(e) => setForm((current) => ({ ...current, paymentMethods: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Shipping area"
            value={form.shippingArea}
            onChange={(e) => setForm((current) => ({ ...current, shippingArea: e.target.value }))}
            required
          />

          <div className="section-kicker" style={{ marginTop: 10 }}>Admin Branding</div>
          <input
            className="input"
            placeholder="Admin title"
            value={form.adminTitle}
            onChange={(e) => setForm((current) => ({ ...current, adminTitle: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Admin subtitle"
            value={form.adminSubtitle}
            onChange={(e) => setForm((current) => ({ ...current, adminSubtitle: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Report footer text"
            value={form.reportFooter}
            onChange={(e) => setForm((current) => ({ ...current, reportFooter: e.target.value }))}
            required
          />
          <button className="btn" type="submit">Save Settings</button>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Live Preview</div>
        <div className="panel">
          <strong>{form.brandName}</strong>
          <div className="helper">{form.companyName}</div>
          <div className="helper">{form.siteUrl}</div>
          <div className="helper">{form.location}</div>
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <div className="helper">Primary contact</div>
          <strong>{form.contactName}</strong>
          <div className="helper">{form.contactRole}</div>
          <div className="helper" style={{ marginTop: 8 }}>{form.contactEmail}</div>
          <div className="helper">{form.contactPhone}</div>
          <div className="helper">{form.contactAddress}</div>
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <div className="helper">Support desk</div>
          <strong>{form.supportEmail}</strong>
          <div className="helper">{form.supportPhone}</div>
          <div className="helper">{form.businessHours}</div>
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <div className="helper">Commercial details</div>
          <strong>{form.currency}</strong>
          <div className="helper">{form.paymentMethods}</div>
          <div className="helper">{form.shippingArea}</div>
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <div className="helper">Admin branding</div>
          <strong>{form.adminTitle}</strong>
          <div className="helper">{form.adminSubtitle}</div>
          <div className="helper" style={{ marginTop: 8 }}>{form.reportFooter}</div>
        </div>
      </section>
    </div>
  );
}
