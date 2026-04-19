import { FeedModerationManager } from '@/components/admin/feed-moderation-manager';
import { AdminShell } from '@/components/admin-shell';
import { getAdminFeedModerationData } from '@/lib/admin-feed-moderation';
import { isMissingFeedTableError } from '@/lib/feed/queries';

export const dynamic = 'force-dynamic';

export default async function AdminFeedModerationPage() {
  let posts: Awaited<ReturnType<typeof getAdminFeedModerationData>>['posts'] = [];
  let placements: Awaited<ReturnType<typeof getAdminFeedModerationData>>['placements'] = [];
  let dataError: string | null = null;

  try {
    const data = await getAdminFeedModerationData();
    posts = data.posts;
    placements = data.placements;
  } catch (error) {
    console.error('Unable to load admin feed moderation data.', error);
    dataError = isMissingFeedTableError(error)
      ? 'Feed moderation tables are not ready yet. Run the feed schema migration before using admin feed moderation.'
      : 'Unable to load feed moderation data right now.';
  }

  return (
    <main>
      <AdminShell
        title="Feed Moderation"
        description="Review creator posts, sponsor placements, featured content, promoted content, and visibility controls for the Resurgence creator-commerce feed."
        currentPath="/admin/feed"
      >
        {dataError ? (
          <section className="card">
            <div className="notice error">{dataError}</div>
            <p className="section-copy">Existing admin, sponsor, creator, shop, and checkout modules are unchanged. Apply the feed schema migration, then reload this page.</p>
          </section>
        ) : (
          <FeedModerationManager initialPosts={posts} initialPlacements={placements} />
        )}
      </AdminShell>
    </main>
  );
}
