'use client';

import { useState } from 'react';

type SettingsForm = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
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

    setNotice('Settings saved successfully. Refresh public pages to see the updated contact details.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Contact Configuration</div>
        <h2 style={{ marginTop: 0 }}>Business contact settings</h2>
        <p className="helper">These values are used across the admin shell, contact page, homepage contact block, and footer.</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
          <input className="input" placeholder="Contact email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required />
          <input className="input" placeholder="Contact phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} required />
          <textarea className="textarea" placeholder="Contact address" value={form.contactAddress} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} required />

          <div className="section-kicker" style={{ marginTop: 10 }}>Admin Branding</div>
          <input className="input" placeholder="Admin title" value={form.adminTitle} onChange={(e) => setForm({ ...form, adminTitle: e.target.value })} required />
          <input className="input" placeholder="Admin subtitle" value={form.adminSubtitle} onChange={(e) => setForm({ ...form, adminSubtitle: e.target.value })} required />
          <input className="input" placeholder="Report footer text" value={form.reportFooter} onChange={(e) => setForm({ ...form, reportFooter: e.target.value })} required />
          <button className="btn" type="submit">Save Settings</button>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Live Preview</div>
        <div className="panel">
          <strong>{form.adminTitle}</strong>
          <div className="helper">{form.adminSubtitle}</div>
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="helper">Contact name</div>
          <strong>{form.contactName}</strong>
          <div className="helper" style={{ marginTop: 8 }}>{form.contactEmail}</div>
          <div className="helper">{form.contactPhone}</div>
          <div className="helper">{form.contactAddress}</div>
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="helper">Report footer</div>
          <strong>{form.reportFooter}</strong>
        </div>
      </section>
    </div>
  );
}
