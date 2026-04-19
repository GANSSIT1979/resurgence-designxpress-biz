import Link from 'next/link';

export default function FeedLoading() {
  return (
    <main className="feed-route-state">
      <section className="feed-route-card" aria-busy="true" aria-live="polite">
        <div className="section-kicker">Creator Commerce Feed</div>
        <h1>Loading fresh highlights.</h1>
        <p>Preparing creator posts, sponsor placements, and official merch tags.</p>
        <div className="feed-route-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <Link className="button-link btn-secondary" href="/">Back Home</Link>
      </section>
    </main>
  );
}
