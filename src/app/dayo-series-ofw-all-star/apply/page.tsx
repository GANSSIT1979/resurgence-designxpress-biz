'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SponsorApplyPage() {
  const params = useSearchParams();
  const preselectedPackage = params.get('package') || '';

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    interestedPackage: preselectedPackage,
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/sponsor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main style={{ padding: 40, textAlign: 'center' }}>
        <h1>Application Submitted</h1>
        <p>Our team will contact you shortly.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1>Sponsor Application</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Company Name" required onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <input placeholder="Contact Name" required onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        <input placeholder="Email" required type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input value={form.interestedPackage} placeholder="Package" onChange={(e) => setForm({ ...form, interestedPackage: e.target.value })} />
        <textarea placeholder="Message" onChange={(e) => setForm({ ...form, message: e.target.value })} />

        <button disabled={loading} type="submit">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </main>
  );
}
