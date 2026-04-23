import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NotificationCenter } from '@/components/notification-center';
import { RoleShell } from '@/components/role-shell';
import { getLoginRedirect } from '@/lib/auth';
import { getPublicFeed } from '@/lib/feed/queries';
import { type AppRole } from '@/lib/resurgence';
import { getAutomationInbox, type AutomationInbox } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { formatDate, formatEnumLabel, getFeedSourceLabel, memberNavItems } from '@/lib/member';
import { formatPaymentMethod, formatPeso, getFeaturedShopProducts } from '@/lib/shop';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

const openOrderStatuses = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED'] as const;

const emptyInbox = {
  notifications: [],
  emails: [],
  degradedReason: null,
} satisfies AutomationInbox;

function getResultValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === 'fulfilled' ? result.value : fallback;
}

function truncateText(value: string | null | undefined, max = 140) {
  const normalized = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return 'No summary available yet.';
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 3).trim()}...`;
}

function getNextAction({
  orderCount,
  followCount,
  saveCount,
}: {
  orderCount: number;
  followCount: number;
  saveCount: number;
}) {
  if (!followCount) {
    return {
      title: 'Start by following creators',
      body: 'Build your member dashboard around the basketball personalities, coaches, and creators you want to keep tabs on.',
      href: '/creators',
      cta: 'Explore creators',
    };
  }

  if (!saveCount) {
    return {
      title: 'Save the posts you want to revisit',
      body: 'Use the community feed to bookmark drops, highlights, and creator content so your dashboard stays useful after every visit.',
      href: '/feed',
      cta: 'Open community feed',
    };
  }

  if (!orderCount) {
    return {
      title: 'Ready for merch or a custom order?',
      body: 'Browse official drops or send a quotation request when you have serious purchase intent for uniforms, jerseys, or branded merchandise.',
      href: '/quotation',
      cta: 'Request a quotation',
    };
  }

  return {
    title: 'Keep your member momentum going',
    body: 'You already have community and commerce activity in motion. Jump back into the feed, review your orders, or check the latest creator updates.',
    href: '/member',
    cta: 'Stay in your dashboard',
  };
}

export default async function MemberDashboardPage() {
  const context = await getCurrentSessionUser();

  if (!context) {
    redirect('/login');
  }

  if (context.user.role !== 'MEMBER' && context.user.role !== 'SYSTEM_ADMIN') {
    redirect(getLoginRedirect(context.user.role as AppRole));
  }

  const orderLookupHref = `/account/orders?email=${encodeURIComponent(context.user.email)}`;
  const results = await Promise.allSettled([
    prisma.shopOrder.findMany({
      where: { customerEmail: context.user.email },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.shopOrder.aggregate({
      where: { customerEmail: context.user.email },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.shopOrder.count({
      where: {
        customerEmail: context.user.email,
        status: { in: [...openOrderStatuses] },
      },
    }),
    prisma.follow.count({ where: { followerUserId: context.user.id } }),
    prisma.follow.findMany({
      where: { followerUserId: context.user.id },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        createdAt: true,
        creatorProfile: {
          select: {
            id: true,
            name: true,
            slug: true,
            roleLabel: true,
            imageUrl: true,
            platformFocus: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.postSave.count({
      where: {
        userId: context.user.id,
        post: {
          is: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
          },
        },
      },
    }),
    prisma.postSave.findMany({
      where: {
        userId: context.user.id,
        post: {
          is: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            caption: true,
            summary: true,
            publishedAt: true,
            likeCount: true,
            saveCount: true,
            viewCount: true,
            creatorProfile: {
              select: {
                name: true,
                slug: true,
              },
            },
            productTags: {
              take: 1,
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
              select: {
                ctaLabel: true,
                product: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    getFeaturedShopProducts(4),
    prisma.creatorProfile.count({ where: { isActive: true } }),
    getPublicFeed({ limit: 4, viewerId: context.user.id }),
    getAutomationInbox(context.user.role, context.user.id, 6),
  ]);

  const recentOrders = getResultValue(results[0], []);
  const orderAggregate = getResultValue(results[1], { _count: { _all: 0 }, _sum: { totalAmount: 0 } });
  const activeOrderCount = getResultValue(results[2], 0);
  const followCount = getResultValue(results[3], 0);
  const followedCreators = getResultValue(results[4], []);
  const savedPostCount = getResultValue(results[5], 0);
  const savedPosts = getResultValue(results[6], []);
  const featuredProducts = getResultValue(results[7], []);
  const creatorCount = getResultValue(results[8], 0);
  const communityFeed = getResultValue(results[9], { items: [], nextCursor: null, source: 'gallery-fallback' as const });
  const inbox = getResultValue(results[10], emptyInbox);

  const orderCount = orderAggregate._count._all;
  const totalOrderValue = orderAggregate._sum.totalAmount ?? 0;
  const unreadNotificationCount = inbox.notifications.filter((item) => !item.isRead).length;
  const feedSourceLabel = getFeedSourceLabel(communityFeed.source);
  const nextAction = getNextAction({ orderCount, followCount, saveCount: savedPostCount });
  const memberPulseData = [
    { label: 'Orders', value: orderCount },
    { label: 'Open', value: activeOrderCount },
    { label: 'Follows', value: followCount },
    { label: 'Saves', value: savedPostCount },
    { label: 'Alerts', value: unreadNotificationCount },
    { label: 'Creators', value: creatorCount },
  ].filter((item) => item.value > 0);
  const isAdminPreview = context.user.role === 'SYSTEM_ADMIN';

  return (
    <main>
      <RoleShell
        roleLabel="Member"
        title={`${context.user.displayName} Dashboard`}
        description="Track your merch orders, stay close to creator updates, save the community moments you care about, and move quickly from browsing to support or quotation workflows."
        navItems={[...memberNavItems]}
        currentPath="/member"
      >
        {isAdminPreview ? (
          <div className="notice" style={{ marginBottom: 20, background: 'rgba(77, 192, 255, 0.12)', color: '#cfeeff' }}>
            You are previewing the member dashboard with an admin account, so activity reflects the current signed-in user rather than a dedicated member profile.
          </div>
        ) : null}

        <section
          className="card"
          style={{
            background:
              'radial-gradient(circle at 12% 16%, rgba(245, 158, 11, 0.18), transparent 28%), linear-gradient(135deg, rgba(5, 16, 29, 0.98), rgba(11, 35, 53, 0.95))',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            marginBottom: 20,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)' }}>
            <div>
              <div className="section-kicker">Regular Member Dashboard</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.1rem)', lineHeight: 1, margin: '0 0 12px' }}>
                Your basketball community home base is ready.
              </h2>
              <p className="section-copy" style={{ color: 'rgba(242, 247, 255, 0.8)', marginBottom: 0 }}>
                Keep one clean view of creator movement, saved community content, official merch orders, and the next action that makes sense for your account.
              </p>

              <div className="btn-row" style={{ marginTop: 22 }}>
                <Link className="button-link" href="/feed">Open Community Feed</Link>
                <Link className="button-link btn-secondary" href="/shop">Shop Official Merch</Link>
                <Link className="button-link btn-secondary" href={orderLookupHref}>Review Orders</Link>
                <Link className="button-link btn-secondary" href="/quotation">Request Quote</Link>
              </div>
            </div>

            <div className="panel" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.14)' }}>
              <div className="section-kicker" style={{ color: '#bcecff' }}>Member Identity</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{context.user.displayName}</h3>
              <div className="helper">{context.user.email}</div>
              <div className="card-grid grid-2" style={{ marginTop: 18 }}>
                <div className="panel" style={{ padding: 16 }}>
                  <strong>{context.user.isActive ? 'Active' : 'Inactive'}</strong>
                  <div className="helper">Access state</div>
                </div>
                <div className="panel" style={{ padding: 16 }}>
                  <strong>{feedSourceLabel}</strong>
                  <div className="helper">Content source</div>
                </div>
                <div className="panel" style={{ padding: 16 }}>
                  <strong>{formatDate(context.user.createdAt)}</strong>
                  <div className="helper">Member since</div>
                </div>
                <div className="panel" style={{ padding: 16 }}>
                  <strong>{formatDate(context.user.lastLoginAt)}</strong>
                  <div className="helper">Last login</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="card-grid grid-4">
          <div className="panel"><strong>{orderCount}</strong><div className="helper">Orders tracked</div></div>
          <div className="panel"><strong>{activeOrderCount}</strong><div className="helper">Open fulfillment</div></div>
          <div className="panel"><strong>{followCount}</strong><div className="helper">Creators followed</div></div>
          <div className="panel"><strong>{savedPostCount}</strong><div className="helper">Saved posts</div></div>
          <div className="panel"><strong>{unreadNotificationCount}</strong><div className="helper">Unread alerts</div></div>
          <div className="panel"><strong>{creatorCount}</strong><div className="helper">Active creators</div></div>
          <div className="panel"><strong>{featuredProducts.length}</strong><div className="helper">Featured merch live</div></div>
          <div className="panel"><strong>{formatPeso(totalOrderValue)}</strong><div className="helper">Tracked order value</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Next Best Action</div>
            <h2 style={{ marginTop: 0 }}>{nextAction.title}</h2>
            <p className="section-copy">{nextAction.body}</p>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <Link className="button-link" href={nextAction.href}>{nextAction.cta}</Link>
              <Link className="button-link btn-secondary" href="/contact">Contact Support</Link>
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="helper">Automatic order lookup email: {context.user.email}</div>
              <div className="helper">If you checked out with a different address, use the order lookup page to search manually.</div>
            </div>
          </section>

          <section className="card">
            <div className="section-kicker">Member Activity Pulse</div>
            <h2 style={{ marginTop: 0 }}>Where your account is active</h2>
            <p className="section-copy">
              A lightweight snapshot of the touchpoints already shaping your member experience across merch, creators, and alerts.
            </p>
            {!memberPulseData.length ? (
              <div className="empty-state">Activity metrics will appear here as soon as your account starts interacting with the platform.</div>
            ) : (
              <div className="card-grid grid-3" style={{ marginTop: 18 }}>
                {memberPulseData.map((item) => (
                  <div className="panel" key={item.label}>
                    <strong>{item.value}</strong>
                    <div className="helper">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="section-kicker">Recent Orders</div>
                <h2 style={{ marginTop: 0 }}>Merch and checkout tracking</h2>
              </div>
              <Link className="button-link btn-secondary" href={orderLookupHref}>Open order history</Link>
            </div>

            {!recentOrders.length ? (
              <div className="empty-state">
                No orders matched {context.user.email} yet. Your first merch purchase will show up here automatically after checkout.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          {order.orderNumber}
                          <div className="helper">{formatDate(order.createdAt)} | {order.items.length} item(s)</div>
                          <div className="helper">
                            {order.items.slice(0, 2).map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                            {order.items.length > 2 ? ', more...' : ''}
                          </div>
                        </td>
                        <td>
                          <div className={`status-pill status-${order.status}`}>{formatEnumLabel(order.status)}</div>
                          <div className="helper" style={{ marginTop: 8 }}>{formatEnumLabel(order.paymentStatus)}</div>
                        </td>
                        <td>{formatPaymentMethod(order.paymentMethod)}</td>
                        <td>{formatPeso(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="section-kicker">Saved Posts</div>
                <h2 style={{ marginTop: 0 }}>Community moments worth revisiting</h2>
              </div>
              <Link className="button-link btn-secondary" href="/feed">Go to feed</Link>
            </div>

            {!savedPosts.length ? (
              <div className="empty-state">
                You have not saved any community posts yet. Use the feed to bookmark creator updates, event highlights, and merch-ready content.
              </div>
            ) : (
              <div className="panel-stack">
                {savedPosts.map((item) => {
                  const taggedProduct = item.post.productTags[0]?.product;

                  return (
                    <article className="activity-item" key={item.id}>
                      <div className="activity-item-header">
                        <span className="status-chip tone-info">Saved</span>
                        <span className="helper">{formatDate(item.createdAt)}</span>
                      </div>
                      <strong>{truncateText(item.post.caption, 90)}</strong>
                      <div className="helper">
                        {item.post.creatorProfile?.name ? `By ${item.post.creatorProfile.name}` : 'Community post'} | {formatDate(item.post.publishedAt)}
                      </div>
                      <div className="helper">{truncateText(item.post.summary || item.post.caption, 150)}</div>
                      <div className="helper">
                        {item.post.likeCount} likes | {item.post.saveCount} saves | {item.post.viewCount} views
                      </div>
                      <div className="btn-row" style={{ marginTop: 10 }}>
                        <Link className="button-link btn-secondary" href="/feed">Open feed</Link>
                        {taggedProduct?.slug ? (
                          <Link className="button-link btn-secondary" href={`/shop/product/${taggedProduct.slug}`}>
                            {item.post.productTags[0]?.ctaLabel || `View ${taggedProduct.name}`}
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="section-kicker">Following Creators</div>
                <h2 style={{ marginTop: 0 }}>Your active creator lane</h2>
              </div>
              <Link className="button-link btn-secondary" href="/creators">Browse creators</Link>
            </div>

            {!followedCreators.length ? (
              <div className="empty-state">
                You are not following any creators yet. Start with the public creator directory and the community feed to shape your dashboard around the personalities you care about.
              </div>
            ) : (
              <div className="panel-stack">
                {followedCreators.map((item) => (
                  <article className="card" key={item.id} style={{ padding: 18 }}>
                    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '72px minmax(0, 1fr)' }}>
                      <img
                        src={item.creatorProfile.imageUrl || '/assets/resurgence-logo.jpg'}
                        alt={item.creatorProfile.name}
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 18 }}
                      />
                      <div>
                        <div className="btn-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{item.creatorProfile.name}</strong>
                            <div className="helper">{item.creatorProfile.roleLabel}</div>
                          </div>
                          <span className={`status-chip ${item.creatorProfile.isActive ? 'tone-success' : 'tone-danger'}`}>
                            {item.creatorProfile.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="helper" style={{ marginTop: 8 }}>{truncateText(item.creatorProfile.platformFocus, 120)}</div>
                        <div className="helper" style={{ marginTop: 8 }}>Following since {formatDate(item.createdAt)}</div>
                        <div className="btn-row" style={{ marginTop: 12 }}>
                          <Link className="button-link btn-secondary" href={`/creators/${item.creatorProfile.slug}`}>Open profile</Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="section-kicker">Community Highlights</div>
                <h2 style={{ marginTop: 0 }}>Latest creator and event energy</h2>
              </div>
              <Link className="button-link btn-secondary" href="/feed">See full feed</Link>
            </div>

            {!communityFeed.items.length ? (
              <div className="empty-state">
                Community highlights are temporarily quiet. Check back soon for creator posts, event media, and merch-linked stories.
              </div>
            ) : (
              <div className="panel-stack">
                {communityFeed.items.map((post) => (
                  <article className="activity-item" key={post.id}>
                    <div className="activity-item-header">
                      <span className={`status-chip ${post.isFeatured ? 'tone-success' : 'tone-info'}`}>
                        {post.isFeatured ? 'Featured' : feedSourceLabel}
                      </span>
                      <span className="helper">{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <strong>{truncateText(post.caption, 88)}</strong>
                    <div className="helper">
                      {post.creator?.name ? `${post.creator.name} | ${post.creator.roleLabel}` : 'Community highlight'}
                    </div>
                    <div className="helper">{truncateText(post.summary || post.caption, 145)}</div>
                    <div className="helper">
                      {post.metrics.likes} likes | {post.metrics.comments} comments | {post.metrics.views} views
                    </div>
                    <div className="btn-row" style={{ marginTop: 10 }}>
                      <Link className="button-link btn-secondary" href="/feed">Open in feed</Link>
                      {post.productTags[0]?.slug ? (
                        <Link className="button-link btn-secondary" href={`/shop/product/${post.productTags[0].slug}`}>
                          {post.productTags[0].ctaLabel || 'View merch'}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="card" style={{ marginTop: 20 }}>
          <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="section-kicker">Merch Recommendations</div>
              <h2 style={{ marginTop: 0 }}>Featured drops inside the member experience</h2>
              <p className="section-copy" style={{ marginBottom: 0 }}>
                Official merch and premium basketball apparel are surfaced here so member activity can convert cleanly into purchase or quotation intent.
              </p>
            </div>
            <Link className="button-link btn-secondary" href="/shop">Open shop</Link>
          </div>

          {!featuredProducts.length ? (
            <div className="empty-state">No featured products are live right now. The merch catalog will appear here as soon as new drops are active.</div>
          ) : (
            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              {featuredProducts.map((product) => (
                <article className="card" key={product.id}>
                  <img
                    src={product.imageUrl || '/assets/resurgence-poster.jpg'}
                    alt={product.name}
                    style={{ width: '100%', borderRadius: 18, aspectRatio: '16 / 10', objectFit: 'cover', marginBottom: 16 }}
                  />
                  <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div className="helper">{product.category?.name || 'Official Merch'}</div>
                      <h3 style={{ marginBottom: 0 }}>{product.name}</h3>
                    </div>
                    <span className={`status-pill ${product.stock > 0 ? 'status-DELIVERED' : 'status-CANCELLED'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                    </span>
                  </div>
                  <p className="helper">{truncateText(product.shortDescription || product.description, 140)}</p>
                  <div className="btn-row" style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    <strong style={{ fontSize: '1.2rem' }}>{formatPeso(product.price)}</strong>
                    <Link className="button-link" href={`/shop/product/${product.slug}`}>View product</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Member alerts and automation"
            notifications={inbox.notifications}
            emails={inbox.emails}
            degradedMessage={inbox.degradedReason ?? null}
          />
        </div>
      </RoleShell>
    </main>
  );
}
