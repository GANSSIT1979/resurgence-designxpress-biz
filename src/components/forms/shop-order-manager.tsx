'use client';

import { useState } from 'react';

export function ShopOrderManager({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateItem(id: string, field: 'status' | 'paymentStatus', value: string) {
    setNotice(null); setError(null);
    const response = await fetch(`/api/admin/shop-orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to update order.');
    setItems((current) => current.map((item) => item.id === id ? data.item : item));
    setNotice('Order updated successfully.');
  }

  return (
    <section className="card">
      <div className="section-kicker">Shop Orders</div>
      <h2 style={{ marginTop: 0 }}>Commerce order workflow</h2>
      {notice ? <div className="notice success" style={{ marginTop: 16 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 16 }}>{error}</div> : null}
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.orderNumber}</strong><div className="helper">{new Date(item.createdAt).toLocaleString()}</div></td>
                <td><strong>{item.customerName}</strong><div className="helper">{item.customerEmail}<br />{item.customerPhone}</div></td>
                <td>₱{item.totalAmount.toLocaleString()}</td>
                <td>
                  <select className="select" value={item.status} onChange={(e) => updateItem(item.id, 'status', e.target.value)}>
                    {['PENDING','AWAITING_PAYMENT','PAID','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED','REFUNDED'].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </td>
                <td>
                  <div className="helper" style={{ marginBottom: 8 }}>{item.paymentMethod}</div>
                  <select className="select" value={item.paymentStatus} onChange={(e) => updateItem(item.id, 'paymentStatus', e.target.value)}>
                    {['PENDING','PAID','FAILED','REFUNDED'].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
