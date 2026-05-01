'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('token'); // PayPal returns orderId as token
  const submissionId = params.get('submissionId');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finalizing your payment...');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setMessage('Missing PayPal order reference.');
      return;
    }

    async function capture() {
      try {
        const res = await fetch('/api/sponsor/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, submissionId }),
        });

        const data = await res.json();

        if (res.ok && data?.success) {
          setStatus('success');
          setMessage('Payment confirmed! Your sponsorship is now approved.');
        } else {
          setStatus('error');
          setMessage(data?.error || 'Payment verification failed.');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage('Unexpected error while verifying payment.');
      }
    }

    capture();
  }, [orderId, submissionId]);

  return (
    <main style={{ maxWidth: 640, margin: '80px auto', padding: 20, textAlign: 'center' }}>
      <h1>{status === 'success' ? 'Payment Successful' : status === 'error' ? 'Payment Error' : 'Processing Payment'}</h1>
      <p>{message}</p>
    </main>
  );
}
