'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeShippingFee, formatPaymentMethod, formatPeso } from '@/lib/shop';

type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantLabel?: string;
};

const paymentMethods = ['COD', 'GCASH_MANUAL', 'MAYA_MANUAL', 'BANK_TRANSFER', 'CARD_MANUAL', 'CASH'];

function cartKey(item: CartItem) {
  return `${item.productId}:${item.variantLabel || 'standard'}`;
}

export function CheckoutClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'COD',
  });

  useEffect(() => {
    const raw = window.localStorage.getItem('resurgence_cart');
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shippingFee = useMemo(() => computeShippingFee(subtotal), [subtotal]);
  const total = subtotal + shippingFee;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, variantLabel: item.variantLabel || '' })),
      }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error || 'Unable to place order.');
      return;
    }
    window.localStorage.removeItem('resurgence_cart');
    window.dispatchEvent(new Event('resurgence-cart-updated'));
    router.push(`/account/orders?email=${encodeURIComponent(form.customerEmail)}&placed=${encodeURIComponent(data.orderNumber)}`);
  }

  if (!items.length) {
    return <div className="card"><h2 style={{ marginTop: 0 }}>No items in cart.</h2><p className="helper">Add products first before checkout.</p></div>;
  }

  return (
    <div className="split">
      <form className="card form-grid" onSubmit={onSubmit}>
        <div className="section-kicker">Shipping & Payment</div>
        <h2 style={{ marginTop: 0 }}>Checkout</h2>
        {error ? <div className="notice error">{error}</div> : null}
        <input className="input" placeholder="Full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
        <input className="input" placeholder="Email" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required />
        <input className="input" placeholder="Phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required />
        <input className="input" placeholder="Address line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required />
        <input className="input" placeholder="Address line 2" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
        <div className="card-grid grid-2">
          <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <input className="input" placeholder="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
        </div>
        <input className="input" placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
        <select className="select" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
          {paymentMethods.map((method) => <option key={method} value={method}>{formatPaymentMethod(method)}</option>)}
        </select>
        <div className="notice success">
          Manual payment orders are created safely first. The team can confirm proof, update payment status, and move the order through packing and delivery in the admin orders dashboard.
        </div>
        <textarea className="textarea" placeholder="Order notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Placing Order...' : 'Place Order'}</button>
      </form>

      <aside className="card">
        <div className="section-kicker">Order Review</div>
        <h2 style={{ marginTop: 0 }}>Summary</h2>
        <div className="form-grid">
          {items.map((item) => (
            <div key={cartKey(item)} className="shop-checkout-item">
              <img src={item.imageUrl} alt={item.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover' }} />
              <div>
                <strong>{item.name}</strong>
                <div className="helper">{item.variantLabel || 'Standard item'}<br />Qty {item.quantity}</div>
              </div>
              <strong>{formatPeso(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="shop-summary-line"><span>Subtotal</span><strong>{formatPeso(subtotal)}</strong></div>
          <div className="shop-summary-line"><span>Shipping</span><strong>{formatPeso(shippingFee)}</strong></div>
          <div className="shop-summary-line shop-summary-total"><span>Total</span><strong>{formatPeso(total)}</strong></div>
        </div>
      </aside>
    </div>
  );
}
