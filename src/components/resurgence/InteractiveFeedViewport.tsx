'use client';

import { CreatorCommerceFeed } from '@/components/feed/creator-commerce-feed';
import type { FeedPost } from '@/lib/feed/types';

export default function InteractiveFeedViewport({
  items,
  viewer = null,
  initialCursor = null,
  source = 'content-post',
  surface = 'feed',
}: {
  items: FeedPost[];
  viewer?: {
    id: string;
    role: string;
    displayName?: string | null;
  } | null;
  initialCursor?: string | null;
  source?: 'content-post' | 'gallery-fallback';
  surface?: 'home' | 'feed';
}) {
  return (
    <CreatorCommerceFeed
      initialItems={items}
      initialCursor={initialCursor}
      source={source}
      surface={surface}
      viewer={viewer}
    />
  );
}
