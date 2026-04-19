'use client';

import Link from 'next/link';

export default function FeedError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="feed-route-state">
      <section className="feed-route-card" role="alert">
        <div className="section-kicker">Feed Recovery</div>
        <h1>The feed hit a timeout.</h1>
        <p>Creator posts could not load right now. Your account, cart, checkout, and sponsor pages are still available.</p>
        <div className="btn-row">
          <button className="button-link" type="button" onClick={reset}>Try Again</button>
          <Link className="button-link btn-secondary" href="/shop">Open Merch</Link>
          <Link className="button-link btn-secondary" href="/">Back Home</Link>
        </div>
      </section>
    </main>
  );
}
