async function getQuotes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/quotes/list`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.quotes || [];
}

export default async function AdminQuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="dashboard-main">
      <div className="dashboard-page-title">Quotes Dashboard</div>

      {quotes.length === 0 ? (
        <div className="empty-state">No quotations yet.</div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote: any) => (
                <tr key={quote.id}>
                  <td>{quote.quoteNumber}</td>
                  <td>{quote.customerName}</td>
                  <td>{quote.status}</td>
                  <td>₱{Number(quote.total).toFixed(2)}</td>
                  <td>{new Date(quote.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}