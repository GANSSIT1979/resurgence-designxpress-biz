import { TikTokFeedCard } from '@/components/tiktok-feed-card';
import { tiktokFeedItems } from '@/lib/tiktok-feed-data';

export function TikTokStyleHome() {
  return (
    <main className="h-[calc(100vh-88px)] snap-y snap-mandatory overflow-y-auto bg-[#05070B]">
      {tiktokFeedItems.map((item) => (
        <TikTokFeedCard key={item.id} item={item} />
      ))}
    </main>
  );
}