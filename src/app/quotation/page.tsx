import Link from 'next/link';

export default function QuotationPage() {
  return (
    <main className="section">
      <div className="container">
        <section className="card">
          <div className="section-kicker">Quotation Requests</div>
          <h1 style={{ marginTop: 0 }}>Formal quotation requests now route through support.</h1>
          <p className="section-copy">
            The old quotation builder is not part of the current build. For pricing, package estimates, or
            custom apparel quotations, use the live support desk or contact form so the RESURGENCE team can
            respond with current details.
          </p>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link href="/support" className="button-link">Open Support Desk</Link>
            <Link href="/contact" className="button-link btn-secondary">Contact the Team</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
