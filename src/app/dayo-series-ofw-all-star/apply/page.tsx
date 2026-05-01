'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type SubmissionResult = {
  id: string;
  companyName: string;
  interestedPackage: string;
};

function SponsorApplyForm() {
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
  const [paying, setPaying] = useState(false);
  const [manualReference, setManualReference] = useState('');
  const [manualStatus, setManualStatus] = useState('');
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/sponsor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data?.id) {
        setSubmission({
          id: data.id,
          companyName: form.companyName,
          interestedPackage: form.interestedPackage || 'Custom Sponsorship',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function startPayPalCheckout() {
    if (!submission) return;
    setPaying(true);

    try {
      const res = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id, paymentMethod: 'PAYPAL' }),
      });
      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      }
    } finally {
      setPaying(false);
    }
  }

  async function submitManualPayment() {
    if (!submission || !manualReference.trim()) return;
    setPaying(true);

    try {
      const res = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          paymentMethod: 'GCASH',
          referenceNumber: manualReference,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setManualStatus('GCash payment reference received. Your sponsorship slot is pending manual verification.');
      }
    } finally {
      setPaying(false);
    }
  }

  if (submission) {
    return (
      <main style={{ maxWidth: 760, margin: '40px auto', padding: 20 }}>
        <h1>Application Submitted</h1>
        <p>Thank you, {submission.companyName}. Continue with your preferred payment option for {submission.interestedPackage}.</p>

        <section style={{ border: '1px solid #ddd', borderRadius: 16, padding: 20, marginTop: 24 }}>
          <h2>Pay Online</h2>
          <p>Proceed to secure checkout via PayPal.</p>
          <button disabled={paying} onClick={startPayPalCheckout} type="button">
            {paying ? 'Redirecting to PayPal...' : 'Pay with PayPal'}
          </button>
        </section>

        <section style={{ border: '1px solid #ddd', borderRadius: 16, padding: 20, marginTop: 24 }}>
          <h2>GCash / Manual Payment</h2>
          <p>Send payment to the official RESURGENCE/DesignXpress GCash account, then enter the reference number below.</p>
          <input
            value={manualReference}
            placeholder="GCash reference number"
            onChange={(e) => setManualReference(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 12 }}
          />
          <button disabled={paying || !manualReference.trim()} onClick={submitManualPayment} type="button">
            Submit GCash Reference
          </button>
          {manualStatus ? <p>{manualStatus}</p> : null}
        </section>
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

function SponsorApplyFallback() {
  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1>Sponsor Application</h1>
      <p>Loading application form...</p>
    </main>
  );
}

export default function SponsorApplyPage() {
  return (
    <Suspense fallback={<SponsorApplyFallback />}>
      <SponsorApplyForm />
    </Suspense>
  );
}
