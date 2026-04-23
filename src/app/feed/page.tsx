import { CreatorCommerceFeed } from '@/components/feed/creator-commerce-feed';
import { getCurrentUser } from '@/lib/auth-server';
import { getPublicFeed } from '@/lib/feed/queries';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const user = await getCurrentUser();
  const feed = await getPublicFeed({ limit: 12, viewerId: user?.id ?? null });

  return (
    <main>
      <CreatorCommerceFeed initialItems={feed.items} initialCursor={feed.nextCursor} source={feed.source} surface="feed" />
    </main>
  );
}
