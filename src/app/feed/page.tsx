import { CreatorCommerceFeed } from '@/components/feed/creator-commerce-feed';
import { getPublicFeed } from '@/lib/feed/queries';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const feed = await getPublicFeed({ limit: 12 });

  return (
    <main>
      <CreatorCommerceFeed initialItems={feed.items} initialCursor={feed.nextCursor} source={feed.source} surface="feed" />
    </main>
  );
}
