'use client';

import { useState } from 'react';

type SponsorProposalPaymentActionsProps = {
  submissionId: string;
};

export function SponsorProposalPaymentActions({ submissionId }: SponsorProposalPaymentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [manualStatus, setManualStatus] = useState('');
  const [error, setError] = useState('');

  async function startPayPalCheckout() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, paymentMethod: 'PAYPAL' }),
      });
      const data = await response.json();

      if (!response.ok || !data?.url) {
        setError(data?.error || 'Unable to start PayPal checkout.');
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError('Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitGcashReference() {
    if (!referenceNumber.trim()) return;
    setLoading(true);
    setError('');
    setManualStatus('');

    try {
      const response = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          paymentMethod: 'GCASH',
          referenceNumber: referenceNumber.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        setError(data?.error || 'Unable to submit GCash reference.');
        return;
      }

      setManualStatus('GCash reference received. Your sponsorship is pending manual verification.');
    } catch (err) {
      console.error(err);
      setError('Unable to submit reference. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.38)', borderRadius: 20, padding: 24, marginTop: 20 }}>
      <h2 style={{ color: '#D4AF37', marginTop: 0 }}>Confirm Sponsorship</h2>
      <p style={{ lineHeight: 1.7 }}>
        Ready to proceed? Confirm your sponsorship slot now through PayPal or submit your GCash reference for manual verification.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
        <button
          disabled={loading}
          onClick={startPayPalCheckout}
          type="button"
          style={{ color: '#0B0E14', background: '#D4AF37', border: 0, borderRadius: 999, padding: '12px 18px', fontWeight: 900, cursor: 'pointer' }}
        >
          {loading ? 'Preparing Checkout...' : 'Pay with PayPal'}
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 800 }}>GCash Reference Number</label>
        <input
          value={referenceNumber}
          onChange={(event) => setReferenceNumber(event.target.value)}
          placeholder="Enter GCash reference number"
          style={{ width: '100%', maxWidth: 420, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.35)', background: '#0F172A', color: '#F8FAFC' }}
        />
        <div style={{ marginTop: 12 }}>
          <button
            disabled={loading || !referenceNumber.trim()}
            onClick={submitGcashReference}
            type="button"
            style={{ color: '#F8FAFC', background: '#1F2937', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 999, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}
          >
            Submit GCash Reference
          </button>
        </div>
      </div>

      {manualStatus ? <p style={{ color: '#D4AF37', fontWeight: 800 }}>{manualStatus}</p> : null}
      {error ? <p style={{ color: '#FCA5A5', fontWeight: 800 }}>{error}</p> : null}
    </section>
  );
}
