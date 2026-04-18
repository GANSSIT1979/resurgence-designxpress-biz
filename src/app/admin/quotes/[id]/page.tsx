import { notFound } from "next/navigation";
import { db } from "@/lib/db";

async function getQuote(id: string) {
  return db.quote.findUnique({
    where: { id },
    include: { items: true },
  });
}

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) return notFound();

  return (
    <main className="print-sheet">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>RESURGENCE</h1>
            <div>Powered by DesignXpress</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><strong>Quote No:</strong> {quote.quoteNumber}</div>
            <div><strong>Date:</strong> {new Date(quote.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            <strong>Bill To</strong>
            <div>{quote.customerName}</div>
            {quote.companyName && <div>{quote.companyName}</div>}
            {quote.email && <div>{quote.email}</div>}
            {quote.phone && <div>{quote.phone}</div>}
            {quote.address && <div>{quote.address}</div>}
          </div>

          <div>
            <strong>Company</strong>
            <div>RESURGENCE Powered by DesignXpress</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>Item</th>
              <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>Qty</th>
              <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>Unit Price</th>
              <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>{item.itemName}</td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>{item.qty}</td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>₱{Number(item.unitPrice).toFixed(2)}</td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>₱{Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginLeft: "auto", maxWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Subtotal</span>
            <strong>₱{Number(quote.subtotal).toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Discount</span>
            <strong>₱{Number(quote.discount).toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>VAT</span>
            <strong>₱{Number(quote.vatAmount).toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20 }}>
            <span>Total</span>
            <strong>₱{Number(quote.total).toFixed(2)}</strong>
          </div>
        </div>

        {quote.notes && (
          <div style={{ marginTop: 32 }}>
            <strong>Notes</strong>
            <p>{quote.notes}</p>
          </div>
        )}
      </div>
    </main>
  );
}