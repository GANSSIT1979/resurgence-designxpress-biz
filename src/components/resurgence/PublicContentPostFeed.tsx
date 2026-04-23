'use client';

import type { FeedPost } from '@/lib/feed/types';
import InteractiveFeedViewport from './InteractiveFeedViewport';

export default function PublicContentPostFeed({
  items,
  viewer = null,
  initialCursor = null,
  surface = 'feed',
}: {
  items: FeedPost[];
  viewer?: {
    id: string;
    role: string;
    displayName?: string | null;
  } | null;
  initialCursor?: string | null;
  surface?: 'home' | 'feed';
}) {
  return (
    <InteractiveFeedViewport
      items={items}
      viewer={viewer}
      initialCursor={initialCursor}
      source="content-post"
      surface={surface}
    />
  );
}
