import Link from 'next/link';

import { CreatorCommerceFeed } from '@/components/feed/creator-commerce-feed';
import { getCurrentUser } from '@/lib/auth-server';
import { getPublicFeed } from '@/lib/feed/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Creator Feed | RESURGENCE',
  description:
    'Watch RESURGENCE creator-commerce posts, sponsor moments, merch drops, basketball activations, and community stories.',
};

export default async function FeedPage() {
  const user = await getCurrentUser();
  const feed = await getPublicFeed({ limit: 12, viewerId: user?.id ?? null });

  return (
    <main className="feed-route-shell">
      <section className="feed-route-hero">
        <div>
          <p className="section-kicker">RESURGENCE For You</p>
          <h1>Creator commerce, sponsor moments, and basketball culture in one vertical feed.</h1>
          <p>
            Swipe through creator stories, shoppable drops, event highlights, and sponsor activations.
            Likes, comments, shares, saves, follows, cart actions, and analytics stay connected to the
            existing RESURGENCE feed system.
          </p>
        </div>

        <div className="feed-route-hero-actions">
          <Link href="/creator/posts/new" className="button-link">
            Create Post
          </Link>
          <Link href="/shop" className="button-link btn-secondary">
            Shop Drops
          </Link>
          <Link href="/events" className="button-link btn-secondary">
            Events
          </Link>
        </div>
      </section>

      <CreatorCommerceFeed
        initialItems={feed.items}
        initialCursor={feed.nextCursor}
        source={feed.source}
        surface="feed"
        viewer={user ? { id: user.id, role: user.role, displayName: user.displayName } : null}
      />
    </main>
  );
}