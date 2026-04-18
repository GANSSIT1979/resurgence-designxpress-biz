'use client';

import { useState } from 'react';

const initialState = {
  name: '',
  organization: '',
  email: '',
  phone: '',
  inquiryType: 'Sponsorship Inquiry',
  message: '',
};

export function InquiryForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit inquiry.');
      }

      setNotice({ type: 'success', message: 'Inquiry submitted successfully. Our team can now review it inside the admin dashboard.' });
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
      <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input className="input" placeholder="Company / Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
      <input className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input className="input" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <select className="select" value={form.inquiryType} onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}>
        <option>Sponsorship Inquiry</option>
        <option>League / Event Booking</option>
        <option>Uniform / Apparel Order</option>
        <option>Coaching / Clinic Program</option>
        <option>Media Partnership</option>
      </select>
      <textarea className="textarea" placeholder="Tell us what you need" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Inquiry'}</button>
    </form>
  );
}
