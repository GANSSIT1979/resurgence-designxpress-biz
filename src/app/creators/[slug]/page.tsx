import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CreatorAnalyticsPanel } from '@/components/creator-analytics-panel';
import { CreatorProfileDashboard } from '@/components/creator/creator-profile-dashboard';
import { EventMediaCarousel } from '@/components/event-media-carousel';
import { ProductCard } from '@/components/shop/product-card';
import { serializePublicCreatorProfile } from '@/lib/creators';
import { serializeContentPost } from '@/lib/feed/serializers';
import { prisma } from '@/lib/prisma';
import { isPrismaSchemaDriftError } from '@/lib/prisma-schema-health';
import { getCreatorBySlug } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function CreatorPublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator || !creator.isActive) notFound();

  const orderedEvents = [...creator.mediaEvents].sort((left, right) => {
    const leftDate = left.eventDate ? new Date(left.eventDate).getTime() : 0;
    const rightDate = right.eventDate ? new Date(right.eventDate).getTime() : 0;
    return rightDate - leftDate;
  });
  let channelPosts: Awaited<ReturnType<typeof prisma.contentPost.findMany>> = [];
  let taggedProducts: Awaited<ReturnType<typeof prisma.shopProduct.findMany>> = [];
  let feedDataNotice: string | null = null;

  try {
    [channelPosts, taggedProducts] = await Promise.all([
      prisma.contentPost.findMany({
        where: {
          creatorProfileId: creator.id,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
        },
        include: {
          authorUser: { select: { id: true, displayName: true, role: true } },
          creatorProfile: {
            select: {
              id: true,
              name: true,
              slug: true,
              roleLabel: true,
              imageUrl: true,
            },
          },
          mediaAssets: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
          hashtags: { include: { hashtag: true } },
          productTags: { include: { product: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
          sponsoredPlacements: {
            where: { status: { in: ['APPROVED', 'ACTIVE'] } },
            include: { sponsor: true, sponsorProfile: true },
            orderBy: [{ createdAt: 'desc' }],
          },
        },
        orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take: 4,
      }),
      prisma.shopProduct.findMany({
        where: {
          isActive: true,
          postProductTags: {
            some: {
              post: {
                creatorProfileId: creator.id,
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
              },
            },
          },
        },
        include: { category: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 4,
      }),
    ]);
  } catch (error) {
    if (!isPrismaSchemaDriftError(error)) {
      throw error;
    }

    console.error('[creator-profile] Falling back to creator-only public profile sections after a content schema drift.', error);
    feedDataNotice =
      'Creator feed posts and tagged merch are temporarily unavailable while the latest content-post migration is still being applied in production.';
  }

  const serializedChannelPosts = channelPosts.map((item) => serializeContentPost(item));

  return (
    <main>
      <CreatorProfileDashboard creator={serializePublicCreatorProfile(creator)} />

      <CreatorAnalyticsPanel creator={creator} events={orderedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        mediaItems: event.mediaItems.map((item) => ({ mediaType: item.mediaType })),
      }))} />

      <section className="section">
        <div className="container">
          <div className="section-kicker">Channel Highlights</div>
          <h2 className="section-title">Recent creator posts and tagged drops</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>
            This channel surface blends creator-led feed content, sponsor-ready highlights, and merch links without leaving the creator profile.
          </p>
          {feedDataNotice ? <div className="notice" style={{ marginTop: 18 }}>{feedDataNotice}</div> : null}

          <div className="card-grid grid-2" style={{ marginTop: 24 }}>
            <section className="card">
              <div className="section-kicker">Recent Channel Posts</div>
              <h3 style={{ marginTop: 0 }}>Published feed moments</h3>
              {!serializedChannelPosts.length ? (
                <div className="empty-state">No published creator feed posts yet.</div>
              ) : (
                <div className="panel-stack">
                  {serializedChannelPosts.map((post) => (
                    <article className="activity-item" key={post.id}>
                      <div className="activity-item-header">
                        <span className={`status-chip ${post.isFeatured ? 'tone-success' : 'tone-info'}`}>
                          {post.isFeatured ? 'Featured' : 'Live post'}
                        </span>
                        <span className="helper">{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-PH')}</span>
                      </div>
                      <strong>{post.caption}</strong>
                      <div className="helper" style={{ marginTop: 6 }}>
                        {post.metrics.views} views | {post.metrics.likes} likes | {post.productTags.length} merch tag{post.productTags.length === 1 ? '' : 's'}
                      </div>
                      <div className="btn-row" style={{ marginTop: 10 }}>
                        <Link className="button-link btn-secondary" href="/feed">Open feed</Link>
                        {post.productTags[0]?.slug ? (
                          <Link className="button-link btn-secondary" href={`/shop/product/${post.productTags[0].slug}`}>View tagged merch</Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <div className="section-kicker">Tagged Merch</div>
              <h3 style={{ marginTop: 0 }}>Products linked to this creator</h3>
              {!taggedProducts.length ? (
                <div className="empty-state">No creator-tagged merch products are live yet.</div>
              ) : (
                <div className="card-grid grid-2">
                  {JSON.parse(JSON.stringify(taggedProducts)).map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-kicker">Creator Media Gallery</div>
          <h2 className="section-title">Event-based highlights and campaign media</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>
            View creator-linked event media, native videos, and embeds managed from the Resurgence admin gallery.
          </p>
          <div className="card-grid" style={{ marginTop: 24 }}>
            {orderedEvents.map((event) => (
              <article className="card" key={event.id}>
                <div className="section-kicker">{event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-PH') : 'Gallery Event'}</div>
                <h3 style={{ marginTop: 0 }}>{event.title}</h3>
                <p className="section-copy">{event.description || 'No description available.'}</p>
                <div style={{ marginTop: 18 }}>
                  <EventMediaCarousel
                    items={event.mediaItems.map((item) => ({
                      id: item.id,
                      mediaType: item.mediaType,
                      url: item.url,
                      thumbnailUrl: item.thumbnailUrl,
                      caption: item.caption,
                    }))}
                    eventTitle={event.title}
                  />
                </div>
              </article>
            ))}
            {!orderedEvents.length ? <div className="empty-state">No media events linked yet.</div> : null}
          </div>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <Link className="button-link btn-secondary" href="/creators">Back to Creators</Link>
            <Link className="button-link" href="/contact">Contact Partnerships</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
