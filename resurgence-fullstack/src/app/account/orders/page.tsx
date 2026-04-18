import { prisma } from '@/lib/prisma';
import { formatPeso } from '@/lib/shop';

export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ email?: string; placed?: string }> }) {
  const { email, placed } = await searchParams;
  const normalizedEmail = email?.trim() || '';
  const items = normalizedEmail
    ? await prisma.shopOrder.findMany({ where: { customerEmail: normalizedEmail }, include: { items: true }, orderBy: { createdAt: 'desc' } })
    : [];

  return (
    <main className="section">
      <div className="container">
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="section-kicker">Order Lookup</div>
          <h1 className="section-title" style={{ marginBottom: 12 }}>Your orders</h1>
          <p className="section-copy">Use the email address used during checkout to review your order history.</p>
          <form className="btn-row" method="get" style={{ marginTop: 18 }}>
            <input className="input" type="email" name="email" placeholder="Enter your checkout email" defaultValue={normalizedEmail} style={{ maxWidth: 420 }} required />
            <button className="btn" type="submit">View Orders</button>
          </form>
          {placed ? <div className="notice success" style={{ marginTop: 16 }}>Order {placed} placed successfully.</div> : null}
        </section>

        {normalizedEmail && !items.length ? <section className="card"><div className="empty-state">No orders found for {normalizedEmail}.</div></section> : null}

        <div className="card-grid grid-2">
          {items.map((order) => (
            <article className="card" key={order.id}>
              <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="section-kicker">{order.orderNumber}</div>
                  <h3 style={{ marginTop: 0 }}>{order.customerName}</h3>
                </div>
                <div className={`status-pill status-${order.status}`}>{order.status}</div>
              </div>
              <div className="helper">Payment: {order.paymentMethod} • {order.paymentStatus}</div>
              <div className="helper">{order.addressLine1}, {order.city}{order.province ? `, ${order.province}` : ''}</div>
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
                  <tbody>
                    {order.items.map((item) => <tr key={item.id}><td>{item.productName}</td><td>{item.quantity}</td><td>{formatPeso(item.lineTotal)}</td></tr>)}
                  </tbody>
                </table>
              </div>
              <div className="shop-summary-line"><span>Total</span><strong>{formatPeso(order.totalAmount)}</strong></div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
