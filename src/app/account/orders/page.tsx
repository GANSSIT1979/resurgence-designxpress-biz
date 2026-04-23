import Link from 'next/link';
import { StickyMobileActionBar } from '@/components/sticky-mobile-action-bar';
import { prisma } from '@/lib/prisma';
import { formatPaymentMethod, formatPeso } from '@/lib/shop';

export const dynamic = 'force-dynamic';

function buildOrderTimeline(status: string, paymentStatus: string) {
  return [
    { label: 'Placed', active: true },
    { label: paymentStatus === 'PAID' ? 'Paid' : 'Payment review', active: paymentStatus !== 'PENDING' },
    { label: 'Fulfillment', active: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) },
    { label: 'Delivered', active: status === 'DELIVERED' },
  ];
}

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
          <p className="section-copy">Use the email address from checkout to review official merch orders, payment status, and fulfillment progress.</p>
          <form className="btn-row" method="get" style={{ marginTop: 18 }}>
            <input className="input" type="email" name="email" placeholder="Enter your checkout email" defaultValue={normalizedEmail} style={{ maxWidth: 420 }} required />
            <button className="btn" type="submit">View Orders</button>
          </form>
          {placed ? <div className="notice success" style={{ marginTop: 16 }}>Order {placed} placed successfully.</div> : null}
          {normalizedEmail ? <div className="helper" style={{ marginTop: 12 }}>Order lookup is currently filtered to <strong>{normalizedEmail}</strong>.</div> : null}
          <div className="btn-row" style={{ marginTop: 16 }}>
            <Link className="button-link btn-secondary" href="/support">Need order help</Link>
            <Link className="button-link btn-secondary" href="/shop">Shop more drops</Link>
          </div>
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
              <div className="helper">Payment: {formatPaymentMethod(order.paymentMethod)} - {order.paymentStatus}</div>
              <div className="helper">{order.addressLine1}, {order.city}{order.province ? `, ${order.province}` : ''}</div>
              <div className="order-status-timeline">
                {buildOrderTimeline(order.status, order.paymentStatus).map((step) => (
                  <div className={step.active ? 'active' : ''} key={`${order.id}-${step.label}`}>
                    <span />
                    <strong>{step.label}</strong>
                  </div>
                ))}
              </div>
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.productName}<div className="helper">{item.variantLabel || 'Standard item'}</div></td>
                        <td>{item.quantity}</td>
                        <td>{formatPeso(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="shop-summary-line"><span>Subtotal</span><strong>{formatPeso(order.subtotal)}</strong></div>
              <div className="shop-summary-line"><span>Shipping</span><strong>{formatPeso(order.shippingFee)}</strong></div>
              <div className="shop-summary-line shop-summary-total"><span>Total</span><strong>{formatPeso(order.totalAmount)}</strong></div>
              <div className="btn-row" style={{ marginTop: 16 }}>
                <Link className="button-link btn-secondary" href="/support">Support this order</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <StickyMobileActionBar
        primaryHref="/shop"
        primaryLabel="Shop new drops"
        secondaryHref="/support"
        secondaryLabel="Need help?"
        note="Track current orders, then jump back into merch or support."
      />
    </main>
  );
}
