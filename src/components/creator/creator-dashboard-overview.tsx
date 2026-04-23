import Link from 'next/link';
import { KpiStatCard } from '@/components/kpi-stat-card';
import { ProfileCompletionMeter } from '@/components/profile-completion-meter';

type RecentPost = {
  id: string;
  caption: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
    shares: number;
  };
  productTagCount: number;
};

type TaggedProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  tagCount: number;
};

function formatShortDate(value: string | null) {
  if (!value) return 'Draft only';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Draft only';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function CreatorDashboardOverview({
  profileCompleteness,
  totalFollowersLabel,
  linkedPlatformCount,
  totalPosts,
  publishedCount,
  draftCount,
  taggedProductsCount,
  unreadAlerts,
  recentPosts,
  taggedProducts,
}: {
  profileCompleteness: number;
  totalFollowersLabel: string;
  linkedPlatformCount: number;
  totalPosts: number;
  publishedCount: number;
  draftCount: number;
  taggedProductsCount: number;
  unreadAlerts: number;
  recentPosts: RecentPost[];
  taggedProducts: TaggedProduct[];
}) {
  return (
    <section className="creator-dashboard-overview">
      <div className="creator-dashboard-kpis">
        <KpiStatCard
          label="Feed posts"
          value={totalPosts}
          delta={`${publishedCount} live now`}
          helper="Published and draft content"
          href="/creator/posts"
          icon="01"
        />
        <KpiStatCard
          label="Draft queue"
          value={draftCount}
          delta={draftCount ? 'Ready to refine' : 'No pending drafts'}
          helper="Save ideas before review"
          href="/creator/posts"
          icon="02"
        />
        <KpiStatCard
          label="Tagged merch"
          value={taggedProductsCount}
          delta={taggedProducts.length ? `${taggedProducts.length} products linked` : 'No merch linked yet'}
          helper="Commerce connected to content"
          href="/shop"
          icon="03"
        />
        <KpiStatCard
          label="Unread alerts"
          value={unreadAlerts}
          delta={unreadAlerts ? 'Check inbox below' : 'Inbox is clear'}
          helper="Notifications and automation"
          icon="04"
        />
      </div>

      <div className="creator-dashboard-grid">
        <article className="card creator-dashboard-panel">
          <div className="section-kicker">Creator Readiness</div>
          <h2>Channel health and next steps</h2>
          <ProfileCompletionMeter
            title="Creator channel completion"
            percent={profileCompleteness}
            missingItems={profileCompleteness >= 100 ? [] : ['Add more profile detail', 'Refresh creator story', 'Connect more platforms']}
            ctaHref="/contact"
            ctaLabel="Request profile update"
          />

          <div className="creator-dashboard-fact-row">
            <div>
              <span>Visible reach</span>
              <strong>{totalFollowersLabel}</strong>
            </div>
            <div>
              <span>Connected platforms</span>
              <strong>{linkedPlatformCount}</strong>
            </div>
          </div>

          <div className="creator-dashboard-action-list">
            <Link className="button-link" href="/creator/posts">Create or edit posts</Link>
            <Link className="button-link btn-secondary" href="/feed">Open live feed</Link>
            <Link className="button-link btn-secondary" href="/creators">View public directory</Link>
          </div>

          <div className="creator-dashboard-scheduler">
            <div className="section-kicker">Scheduling-ready UI</div>
            <strong>Draft now, publish after review.</strong>
            <p className="helper">This studio is ready for future scheduling support without changing the current moderation workflow.</p>
          </div>
        </article>

        <article className="card creator-dashboard-panel">
          <div className="section-kicker">Recent Performance</div>
          <h2>What your latest posts are doing</h2>
          {recentPosts.length ? (
            <div className="creator-dashboard-post-stack">
              {recentPosts.map((post) => (
                <article className="creator-dashboard-post-row" key={post.id}>
                  <div className="creator-dashboard-post-row-top">
                    <span className={`creator-post-status status-${post.status.toLowerCase().replace(/_/g, '-')}`}>{formatStatus(post.status)}</span>
                    <span>{formatShortDate(post.publishedAt || post.updatedAt)}</span>
                  </div>
                  <h3>{post.caption}</h3>
                  <div className="creator-dashboard-post-metrics">
                    <span>{post.metrics.views} views</span>
                    <span>{post.metrics.likes} likes</span>
                    <span>{post.metrics.comments} comments</span>
                    <span>{post.productTagCount} merch tags</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="creator-dashboard-empty">
              <strong>No creator posts yet.</strong>
              <p className="helper">Start with a game highlight, merch story, or sponsor-ready reel to activate performance tracking.</p>
            </div>
          )}
        </article>
      </div>

      <article className="card creator-dashboard-panel">
        <div className="section-kicker">Tagged Product Performance</div>
        <h2>Merch connected to your content</h2>
        {taggedProducts.length ? (
          <div className="creator-dashboard-product-grid">
            {taggedProducts.map((product) => (
              <Link className="creator-dashboard-product-card" href={`/shop/product/${product.slug}`} key={product.id}>
                <div className="creator-dashboard-product-media">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>No image</span>}
                </div>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.tagCount} post tag{product.tagCount === 1 ? '' : 's'}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="creator-dashboard-empty">
            <strong>No merch tags yet.</strong>
            <p className="helper">Attach official drops to your posts so members can move from content into commerce without leaving the experience.</p>
          </div>
        )}
      </article>
    </section>
  );
}
