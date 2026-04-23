'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { StickyMobileActionBar } from '@/components/sticky-mobile-action-bar';
import { formatPeso } from '@/lib/shop';
import { CART_UPDATED_EVENT, cartKey, readCart, StoredCartItem, writeCart } from '@/lib/shop/cart-storage';

export function CartClient() {
  const [items, setItems] = useState<StoredCartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, []);

  function persist(next: StoredCartItem[]) {
    setItems(next);
    writeCart(next);
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  if (!items.length) {
    return (
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Your cart is empty.</h2>
        <p className="helper">Start with official merch, jersey drops, hoodies, caps, and accessories.</p>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <Link href="/shop" className="button-link">Go to Shop</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="card cart-overview-card">
        <div>
          <div className="section-kicker">Cart Momentum</div>
          <h2 style={{ marginTop: 0 }}>Keep the checkout flow moving.</h2>
          <p className="helper">Review your creator-linked merch, adjust quantities fast, and head straight into the same trusted checkout path.</p>
        </div>
        <div className="cart-overview-stats">
          <div><strong>{items.length}</strong><span>Line items</span></div>
          <div><strong>{totalItems}</strong><span>Total quantity</span></div>
          <div><strong>{formatPeso(subtotal)}</strong><span>Current subtotal</span></div>
        </div>
      </section>

      <div className="split">
      <section className="card">
        <div className="section-kicker">Shopping Cart</div>
        <div className="cart-mobile-stack">
          {items.map((item) => (
            <article className="cart-mobile-card" key={`${cartKey(item)}-mobile`}>
              <img src={item.imageUrl} alt={item.name} />
              <div className="cart-mobile-card-body">
                <strong>{item.name}</strong>
                <div className="helper">{item.variantLabel || 'Standard item'}</div>
                <div className="cart-mobile-card-controls">
                  <input className="input" type="number" min="1" value={item.quantity} onChange={(e) => {
                    const next = items.map((entry) => cartKey(entry) === cartKey(item) ? { ...entry, quantity: Math.max(1, Number(e.target.value || 1)) } : entry);
                    persist(next);
                  }} />
                  <span>{formatPeso(item.price * item.quantity)}</span>
                </div>
                <button className="btn btn-secondary" type="button" onClick={() => persist(items.filter((entry) => cartKey(entry) !== cartKey(item)))}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="table-wrap cart-desktop-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={cartKey(item)}>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover' }} />
                      <div>
                        <strong>{item.name}</strong>
                        <div className="helper">{item.variantLabel || 'Standard item'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input className="input" style={{ width: 86 }} type="number" min="1" value={item.quantity} onChange={(e) => {
                      const next = items.map((entry) => cartKey(entry) === cartKey(item) ? { ...entry, quantity: Math.max(1, Number(e.target.value || 1)) } : entry);
                      persist(next);
                    }} />
                  </td>
                  <td>{formatPeso(item.price)}</td>
                  <td>{formatPeso(item.price * item.quantity)}</td>
                  <td><button className="btn btn-secondary" type="button" onClick={() => persist(items.filter((entry) => cartKey(entry) !== cartKey(item)))}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="card">
        <div className="section-kicker">Summary</div>
        <h2 style={{ marginTop: 0 }}>Ready to checkout</h2>
        <div className="shop-summary-line"><span>Subtotal</span><strong>{formatPeso(subtotal)}</strong></div>
        <div className="helper">Shipping is calculated during checkout based on order value.</div>
        <div className="notice success" style={{ marginTop: 16 }}>
          <strong>Why continue now?</strong>
          <p style={{ marginBottom: 0 }}>Your cart already keeps creator-linked merch and chosen variants together, so checkout can stay fast on mobile.</p>
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <Link href="/checkout" className="button-link">Proceed to Checkout</Link>
          <Link href="/shop" className="button-link btn-secondary">Continue Shopping</Link>
        </div>
      </aside>
      </div>
      <StickyMobileActionBar
        primaryHref="/checkout"
        primaryLabel={`Checkout ${formatPeso(subtotal)}`}
        secondaryHref="/shop"
        secondaryLabel="Keep shopping"
        note="Mobile-first checkout stays one tap away."
      />
    </>
  );
}
