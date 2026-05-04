'use client';

import { useMemo, useState } from 'react';

const orderStatuses = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

function formatMoney(value: number) {
  return `PHP ${value.toLocaleString()}`;
}

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    COD: 'Cash on Delivery',
    GCASH_MANUAL: 'GCash manual payment',
    MAYA_MANUAL: 'Maya manual payment',
    BANK_TRANSFER: 'Bank transfer',
    CARD_MANUAL: 'Credit/Debit Card',
    CASH: 'Cash',
  };
  return labels[value] || value.replace(/_/g, ' ');
}

export function ShopOrderManager({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [
        item.orderNumber,
        item.customerName,
        item.customerEmail,
        item.customerPhone,
        item.city,
        item.paymentMethod,
        ...item.items.map((line: any) => `${line.productName} ${line.sku || ''} ${line.variantLabel || ''}`),
      ].join(' ').toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter || item.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  async function updateItem(id: string, field: 'status' | 'paymentStatus', value: string) {
    setNotice(null);
    setError(null);
    const response = await fetch(`/api/admin/shop-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update order.');
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? data.item : item));
    setNotice('Order updated successfully.');
  }

  return (
    <section className="card">
      <div className="section-kicker">Official Merch Orders</div>
      <h2 style={{ marginTop: 0 }}>Commerce fulfillment workflow</h2>
      <p className="helper">Review order lines, selected sizes/colors, customer delivery details, payment method, and fulfillment status.</p>
      {notice ? <div className="notice success" style={{ marginTop: 16 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 16 }}>{error}</div> : null}

      <div className="merch-admin-toolbar" style={{ marginTop: 16 }}>
        <input className="input" placeholder="Search order, customer, product, SKU, variant" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All order and payment statuses</option>
          {[...orderStatuses, ...paymentStatuses].filter((value, index, list) => list.indexOf(value) === index).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      <div className="shop-order-list">
        {filtered.map((item) => (
          <article className="shop-order-card" key={item.id}>
            <div className="shop-order-header">
              <div>
                <div className="section-kicker">{item.orderNumber}</div>
                <h3>{item.customerName}</h3>
                <div className="helper">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <div className="shop-order-total">{formatMoney(item.totalAmount)}</div>
            </div>

            <div className="card-grid grid-3">
              <div className="panel">
                <strong>Customer</strong>
                <div className="helper">{item.customerEmail}</div>
                <div className="helper">{item.customerPhone}</div>
              </div>
              <div className="panel">
                <strong>Delivery</strong>
                <div className="helper">{item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}</div>
                <div className="helper">{item.city}{item.province ? `, ${item.province}` : ''}{item.postalCode ? ` ${item.postalCode}` : ''}</div>
              </div>
              <div className="panel">
                <strong>Payment</strong>
                <div className="helper">{formatPaymentMethod(item.paymentMethod)}</div>
                <div className="helper">Subtotal {formatMoney(item.subtotal)} - Shipping {formatMoney(item.shippingFee)}</div>
              </div>
            </div>

            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>Item</th><th>Variant</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {item.items.map((line: any) => (
                    <tr key={line.id}>
                      <td><strong>{line.productName}</strong><div className="helper">{line.sku || 'No SKU'}</div></td>
                      <td>{line.variantLabel || 'Standard item'}</td>
                      <td>{line.quantity}</td>
                      <td>{formatMoney(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {item.notes ? <div className="notice" style={{ marginTop: 14 }}>Customer notes: {item.notes}</div> : null}

            <div className="shop-order-actions">
              <label>
                <span className="label">Order status</span>
                <select className="select" value={item.status} onChange={(event) => updateItem(item.id, 'status', event.target.value)}>
                  {orderStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <span className="label">Payment status</span>
                <select className="select" value={item.paymentStatus} onChange={(event) => updateItem(item.id, 'paymentStatus', event.target.value)}>
                  {paymentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            </div>
          </article>
        ))}
        {!filtered.length ? <div className="empty-state">No merch orders match your filters.</div> : null}
      </div>
    </section>
  );
}
