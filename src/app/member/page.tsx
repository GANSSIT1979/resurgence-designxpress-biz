import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NotificationCenter } from '@/components/notification-center';
import { RoleShell } from '@/components/role-shell';
import { getLoginRedirect } from '@/lib/auth';
import { canCreateFeedPost } from '@/lib/feed/authorization';
import { getPublicFeed } from '@/lib/feed/queries';
import { type AppRole } from '@/lib/resurgence';
import { getAutomationInbox, type AutomationInbox } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import {
  formatAuthProvider,
  formatDate,
  formatDateTime,
  formatEnumLabel,
  formatRelativeTime,
  getFeedSourceLabel,
  getMemberProfileCompletion,
  getMemberReferralShareCode,
  isSyntheticMemberEmail,
  memberNavItems,
} from '@/lib/member';
import { formatPaymentMethod, formatPeso, getFeaturedShopProducts } from '@/lib/shop';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

const openOrderStatuses = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED'] as const;

const emptyInbox = {
  notifications: [],
  emails: [],
  degradedReason: null,
} satisfies AutomationInbox;

type TimelineItem = {
  id: string;
  timestamp: number;
  occurredAt: Date | string;
  badge: string;
  tone: string;
  title: string;
  detail: string;
  href?: string;
};

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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function getTimelineTimestamp(value: Date | string | null | undefined) {
  if (!value) return 0;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getMetricTone(percentage: number) {
  if (percentage >= 85) return 'tone-success';
  if (percentage >= 60) return 'tone-info';
  if (percentage >= 40) return 'tone-warning';
  return 'tone-danger';
}

function isOpenOrderStatus(value: string) {
  return openOrderStatuses.some((status) => status === value);
}

function mapNotificationTone(level: string | null | undefined) {
  switch (String(level || '').toUpperCase()) {
    case 'SUCCESS':
      return 'tone-success';
    case 'WARNING':
      return 'tone-warning';
    case 'URGENT':
      return 'tone-danger';
    default:
      return 'tone-info';
  }
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
      body: 'Build your dashboard around the basketball personalities, coaches, and creators you want to keep tabs on first.',
      href: '/creators',
      cta: 'Explore creators',
    };
  }

  if (!saveCount) {
    return {
      title: 'Save the posts you want to revisit',
      body: 'Use the community feed to bookmark drops, highlights, and creator content so your member dashboard keeps learning your interests.',
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
  const referralShareCode = getMemberReferralShareCode({
    id: context.user.id,
    displayName: context.user.displayName,
  });
  const feedPublishingEnabled = canCreateFeedPost(context.user.role as AppRole);

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
    prisma.contentPost.aggregate({
      where: {
        authorUserId: context.user.id,
        status: { not: 'DELETED' },
      },
      _count: { _all: true },
      _sum: {
        likeCount: true,
        commentCount: true,
        saveCount: true,
        shareCount: true,
        viewCount: true,
      },
    }),
    prisma.contentPost.findMany({
      where: {
        authorUserId: context.user.id,
        status: { not: 'DELETED' },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: {
        id: true,
        caption: true,
        summary: true,
        status: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        likeCount: true,
        commentCount: true,
        saveCount: true,
        shareCount: true,
        viewCount: true,
        creatorProfile: {
          select: {
            name: true,
            slug: true,
          },
        },
        mediaAssets: {
          take: 1,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          select: {
            mediaType: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    }),
    prisma.creatorProfile.findUnique({
      where: { userId: context.user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        _count: {
          select: {
            followers: true,
            contentPosts: true,
          },
        },
      },
    }),
    prisma.user.count({
      where: {
        referralCode: {
          equals: referralShareCode,
          mode: 'insensitive',
        },
      },
    }),
    prisma.user.findMany({
      where: {
        referralCode: {
          equals: referralShareCode,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    }),
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
  const uploadedPostAggregate = getResultValue(results[11], {
    _count: { _all: 0 },
    _sum: {
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      shareCount: 0,
      viewCount: 0,
    },
  });
  const uploadedPosts = getResultValue(results[12], []);
  const linkedCreatorProfile = getResultValue(results[13], null);
  const referredSignupCount = getResultValue(results[14], 0);
  const referredMembers = getResultValue(results[15], []);

  const orderCount = orderAggregate._count._all;
  const totalOrderValue = orderAggregate._sum.totalAmount ?? 0;
  const unreadNotificationCount = inbox.notifications.filter((item) => !item.isRead).length;
  const feedSourceLabel = getFeedSourceLabel(communityFeed.source);
  const nextAction = getNextAction({ orderCount, followCount, saveCount: savedPostCount });
  const isAdminPreview = context.user.role === 'SYSTEM_ADMIN';

  const profileCompletion = getMemberProfileCompletion(context.user);
  const profileCompletionTone = getMetricTone(profileCompletion.percentage);
  const authoredPostCount = uploadedPostAggregate._count._all;
  const uploadedViews = uploadedPostAggregate._sum.viewCount ?? 0;
  const uploadedLikes = uploadedPostAggregate._sum.likeCount ?? 0;
  const uploadedComments = uploadedPostAggregate._sum.commentCount ?? 0;
  const uploadedSaves = uploadedPostAggregate._sum.saveCount ?? 0;
  const creatorFollowerCount = linkedCreatorProfile?._count.followers ?? 0;
  const primaryIdentity = isSyntheticMemberEmail(context.user.email)
    ? context.user.phoneNumber || 'Mobile signup account'
    : context.user.email;
  const secondaryIdentity = !isSyntheticMemberEmail(context.user.email) && context.user.phoneNumber ? context.user.phoneNumber : null;
  const joinedWithReferralCode =
    context.user.referralCode && context.user.referralCode.toUpperCase() !== referralShareCode
      ? context.user.referralCode
      : null;

  const topMetrics = [
    { label: 'Profile completion', value: `${profileCompletion.percentage}%` },
    { label: 'Orders tracked', value: String(orderCount) },
    { label: 'Following creators', value: String(followCount) },
    { label: 'Saved content', value: String(savedPostCount) },
    { label: 'Uploaded posts', value: String(authoredPostCount) },
    { label: 'Referral signups', value: String(referredSignupCount) },
    { label: 'Unread alerts', value: String(unreadNotificationCount) },
    { label: 'Tracked order value', value: formatPeso(totalOrderValue) },
  ];

  const overviewMetrics = [
    {
      label: 'Profile',
      value: `${profileCompletion.percentage}%`,
      helper: `${profileCompletion.completed}/${profileCompletion.total} setup checkpoints completed`,
    },
    {
      label: 'Creators followed',
      value: String(followCount),
      helper: 'Live follows connected to this signed-in member',
    },
    {
      label: 'Saved posts',
      value: String(savedPostCount),
      helper: 'Public feed posts bookmarked by this account',
    },
    {
      label: 'Uploads',
      value: String(authoredPostCount),
      helper: feedPublishingEnabled
        ? 'Posts or videos currently tied to this user'
        : 'Publishing is currently limited to creator, staff, or admin roles',
    },
    {
      label: 'Referrals',
      value: String(referredSignupCount),
      helper: 'Signups that entered your member referral code',
    },
    {
      label: 'Unread alerts',
      value: String(unreadNotificationCount),
      helper: 'Notifications still open in your inbox',
    },
  ];

  const engagementBars = [
    { label: 'Views on uploads', value: uploadedViews, display: formatCompactNumber(uploadedViews) },
    { label: 'Likes on uploads', value: uploadedLikes, display: formatCompactNumber(uploadedLikes) },
    { label: 'Comments on uploads', value: uploadedComments, display: formatCompactNumber(uploadedComments) },
    { label: 'Saves on uploads', value: uploadedSaves, display: formatCompactNumber(uploadedSaves) },
  ];
  const maxEngagementValue = Math.max(1, ...engagementBars.map((item) => item.value));
  const hasEngagementData = engagementBars.some((item) => item.value > 0);

  const accountStatusItems = [
    {
      label: 'Account access',
      value: context.user.isActive ? 'Active' : 'Inactive',
      helper: 'Current dashboard access state',
      tone: context.user.isActive ? 'tone-success' : 'tone-danger',
    },
    {
      label: 'Auth provider',
      value: formatAuthProvider(context.user.authProvider),
      helper: 'Primary sign-in path currently attached',
      tone: 'tone-info',
    },
    {
      label: 'Email verification',
      value: context.user.isEmailVerified ? 'Verified' : 'Pending',
      helper: isSyntheticMemberEmail(context.user.email) ? 'Synthetic mobile email is used for account identity.' : context.user.email,
      tone: context.user.isEmailVerified ? 'tone-success' : 'tone-warning',
    },
    {
      label: 'Mobile verification',
      value: context.user.isPhoneVerified ? 'Verified' : 'Pending',
      helper: context.user.phoneNumber || 'No verified mobile number on file yet.',
      tone: context.user.isPhoneVerified ? 'tone-success' : 'tone-warning',
    },
    {
      label: 'Terms record',
      value: context.user.termsAcceptedAt ? 'Accepted' : 'Missing',
      helper: context.user.termsAcceptedAt ? `Accepted ${formatDate(context.user.termsAcceptedAt)}` : 'Terms acceptance was not recorded.',
      tone: context.user.termsAcceptedAt ? 'tone-success' : 'tone-danger',
    },
    {
      label: 'Last login',
      value: formatDateTime(context.user.lastLoginAt),
      helper: formatRelativeTime(context.user.lastLoginAt),
      tone: context.user.lastLoginAt ? 'tone-info' : 'tone-warning',
    },
  ];

  const activityTimeline: TimelineItem[] = [
    {
      id: `member-created-${context.user.id}`,
      timestamp: getTimelineTimestamp(context.user.createdAt),
      occurredAt: context.user.createdAt,
      badge: 'Account',
      tone: 'tone-success',
      title: 'Member account opened',
      detail: `Joined through ${formatAuthProvider(context.user.authProvider)} and landed in the member dashboard.`,
      href: '/member',
    },
    ...(context.user.lastLoginAt
      ? [
          {
            id: `member-login-${context.user.id}`,
            timestamp: getTimelineTimestamp(context.user.lastLoginAt),
            occurredAt: context.user.lastLoginAt,
            badge: 'Login',
            tone: 'tone-info',
            title: 'Recent sign-in recorded',
            detail: `Latest sign-in was captured ${formatRelativeTime(context.user.lastLoginAt)}.`,
            href: '/member',
          } satisfies TimelineItem,
        ]
      : []),
    ...recentOrders.map(
      (order) =>
        ({
          id: `order-${order.id}`,
          timestamp: getTimelineTimestamp(order.createdAt),
          occurredAt: order.createdAt,
          badge: 'Order',
          tone: isOpenOrderStatus(order.status) ? 'tone-info' : 'tone-success',
          title: `Order ${order.orderNumber} is ${formatEnumLabel(order.status).toLowerCase()}`,
          detail: `${order.items.length} item(s) | ${formatPeso(order.totalAmount)} | ${formatEnumLabel(order.paymentStatus)}`,
          href: orderLookupHref,
        }) satisfies TimelineItem,
    ),
    ...followedCreators.map(
      (item) =>
        ({
          id: `follow-${item.id}`,
          timestamp: getTimelineTimestamp(item.createdAt),
          occurredAt: item.createdAt,
          badge: 'Follow',
          tone: 'tone-info',
          title: `Started following ${item.creatorProfile.name}`,
          detail: `${item.creatorProfile.roleLabel} | ${truncateText(item.creatorProfile.platformFocus, 100)}`,
          href: `/creators/${item.creatorProfile.slug}`,
        }) satisfies TimelineItem,
    ),
    ...savedPosts.map(
      (item) =>
        ({
          id: `save-${item.id}`,
          timestamp: getTimelineTimestamp(item.createdAt),
          occurredAt: item.createdAt,
          badge: 'Saved',
          tone: 'tone-info',
          title: truncateText(item.post.caption, 72),
          detail: item.post.creatorProfile?.name ? `Saved from ${item.post.creatorProfile.name}` : 'Saved from the community feed',
          href: '/feed',
        }) satisfies TimelineItem,
    ),
    ...uploadedPosts.map(
      (item) =>
        ({
          id: `upload-${item.id}`,
          timestamp: getTimelineTimestamp(item.publishedAt || item.updatedAt || item.createdAt),
          occurredAt: item.publishedAt || item.updatedAt || item.createdAt,
          badge: 'Upload',
          tone: item.status === 'PUBLISHED' ? 'tone-success' : 'tone-warning',
          title: truncateText(item.caption, 72),
          detail: `${formatEnumLabel(item.status)} | ${item.viewCount} views | ${item.likeCount} likes`,
          href: '/feed',
        }) satisfies TimelineItem,
    ),
    ...inbox.notifications.slice(0, 4).map(
      (item) =>
        ({
          id: `notification-${item.id}`,
          timestamp: getTimelineTimestamp(item.createdAt),
          occurredAt: item.createdAt,
          badge: 'Alert',
          tone: mapNotificationTone(item.level),
          title: item.title,
          detail: truncateText(item.message, 120),
          href: item.href || '/member',
        }) satisfies TimelineItem,
    ),
  ]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 10);

  return (
    <main>
      <RoleShell
        roleLabel="Member"
        title={`${context.user.displayName} Dashboard`}
        description="Track your live member profile, account status, referrals, saved content, uploads, notifications, merch orders, and creator activity from one basketball-focused home base."
        navItems={[...memberNavItems]}
        currentPath="/member"
      >
        {isAdminPreview ? (
          <div className="notice" style={{ marginBottom: 20, background: 'rgba(77, 192, 255, 0.12)', color: '#cfeeff' }}>
            You are previewing the member dashboard with an admin account, so live activity reflects the current signed-in user rather than a dedicated member profile.
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
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' }}>
            <div>
              <div className="section-kicker">Live Member Workspace</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.1rem)', lineHeight: 1, margin: '0 0 12px' }}>
                Your account now has a deeper member command center.
              </h2>
              <p className="section-copy" style={{ color: 'rgba(242, 247, 255, 0.8)', marginBottom: 0 }}>
                Gmail and mobile signups now flow into a fuller dashboard with live profile progress, account health, referral visibility, upload analytics, notifications, and member-safe fallback states where subscriptions, payouts, or rewards are not enabled yet.
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
              <div className="helper">{primaryIdentity}</div>
              {secondaryIdentity ? <div className="helper">{secondaryIdentity}</div> : null}

              <div style={{ marginTop: 18 }}>
                <div className="activity-item" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="activity-item-header">
                    <span className={`status-chip ${profileCompletionTone}`}>Profile completion</span>
                    <strong>{profileCompletion.percentage}%</strong>
                  </div>
                  <div className="metric-bar-track" style={{ marginTop: 12 }}>
                    <div className="metric-bar-fill" style={{ width: `${profileCompletion.percentage}%` }} />
                  </div>
                  <div className="helper" style={{ marginTop: 10 }}>
                    {profileCompletion.completed} of {profileCompletion.total} live setup checkpoints are complete for this account.
                  </div>
                </div>
              </div>

              <div className="card-grid grid-2" style={{ marginTop: 18 }}>
                <div className="panel" style={{ padding: 16 }}>
                  <strong>{context.user.isActive ? 'Active' : 'Inactive'}</strong>
                  <div className="helper">Access state</div>
                </div>
                <div className="panel" style={{ padding: 16 }}>
                  <strong>{formatAuthProvider(context.user.authProvider)}</strong>
                  <div className="helper">Sign-in method</div>
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
          {topMetrics.map((item) => (
            <div className="panel" key={item.label}>
              <strong>{item.value}</strong>
              <div className="helper">{item.label}</div>
            </div>
          ))}
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
              <div className="helper">If checkout used a different address, use the order lookup page to search manually.</div>
            </div>
          </section>

          <section className="card">
            <div className="section-kicker">Analytics Overview</div>
            <h2 style={{ marginTop: 0 }}>How your account is performing</h2>
            <p className="section-copy">
              These live metrics are derived from the signed-in member account, including saves, follows, uploads, referrals, orders, and notifications.
            </p>

            <div className="card-grid grid-3" style={{ marginTop: 18 }}>
              {overviewMetrics.map((item) => (
                <div className="panel" key={item.label}>
                  <strong>{item.value}</strong>
                  <div className="helper" style={{ fontWeight: 700, color: '#f8fbff' }}>{item.label}</div>
                  <div className="helper">{item.helper}</div>
                </div>
              ))}
            </div>

            {!hasEngagementData ? (
              <div className="empty-state" style={{ marginTop: 18 }}>
                {feedPublishingEnabled
                  ? 'Upload engagement metrics will appear here after this account publishes posts or videos.'
                  : 'Publishing analytics will appear here if this member is later granted creator, staff, or admin posting access.'}
              </div>
            ) : (
              <div className="metric-bar-chart" style={{ marginTop: 18 }}>
                {engagementBars.map((item) => (
                  <div className="metric-bar-row" key={item.label}>
                    <div className="metric-bar-meta">
                      <span>{item.label}</span>
                      <strong>{item.display}</strong>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill" style={{ width: `${(item.value / maxEngagementValue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="card-grid grid-3" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Account Status</div>
            <h2 style={{ marginTop: 0 }}>Live verification and setup health</h2>
            <p className="section-copy">
              Account status is tied directly to the current member record, so Gmail verification, mobile verification, terms acceptance, and access state stay visible here.
            </p>

            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              {accountStatusItems.map((item) => (
                <div className="panel" key={item.label} style={{ padding: 16 }}>
                  <span className={`status-chip ${item.tone}`}>{item.label}</span>
                  <strong style={{ display: 'block', marginTop: 12 }}>{item.value}</strong>
                  <div className="helper">{item.helper}</div>
                </div>
              ))}
            </div>

            {profileCompletion.missingItems.length ? (
              <div className="panel" style={{ marginTop: 18 }}>
                <strong>Remaining setup gaps</strong>
                <div className="panel-stack" style={{ marginTop: 12 }}>
                  {profileCompletion.missingItems.map((item) => (
                    <div className="activity-item" key={item.label}>
                      <div className="activity-item-header">
                        <span className="status-chip tone-warning">Pending</span>
                        <span className="helper">{item.label}</span>
                      </div>
                      <div className="helper">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="card">
            <div className="section-kicker">Membership Plan</div>
            <h2 style={{ marginTop: 0 }}>Free member access</h2>
            <p className="section-copy">
              This account is on the platform&apos;s free member lane. The current schema does not attach a paid subscription, recurring renewal, or member billing ledger.
            </p>
            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              <div className="panel">
                <strong>{context.user.isActive ? 'Active' : 'Paused'}</strong>
                <div className="helper">Plan state</div>
              </div>
              <div className="panel">
                <strong>None</strong>
                <div className="helper">Recurring subscription</div>
              </div>
            </div>
            <div className="helper" style={{ marginTop: 16 }}>
              If premium member plans are introduced later, a human team member should still confirm pricing, access changes, and billing behavior.
            </div>
          </section>

          <section className="card">
            <div className="section-kicker">Wallet and Rewards</div>
            <h2 style={{ marginTop: 0 }}>Not enabled yet</h2>
            <p className="section-copy">
              The current member model does not store wallet balance, points, cash credits, or redemption history, so this section stays transparent instead of showing placeholder amounts.
            </p>
            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              <div className="panel">
                <strong>Not enabled</strong>
                <div className="helper">Wallet balance</div>
              </div>
              <div className="panel">
                <strong>Not enabled</strong>
                <div className="helper">Rewards points</div>
              </div>
            </div>
            <div className="helper" style={{ marginTop: 16 }}>
              When a wallet or rewards program is added to the data model, balance, history, and redemption details can surface here.
            </div>
          </section>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Referral Dashboard</div>
            <h2 style={{ marginTop: 0 }}>Share your live member code</h2>
            <p className="section-copy">
              New Gmail or mobile signups can use this code during registration. Referred signups are counted from the same referral field captured by the live auth flow.
            </p>

            <div className="panel" style={{ background: 'rgba(77, 192, 255, 0.08)', borderColor: 'rgba(77, 192, 255, 0.22)' }}>
              <div className="helper">Your member referral code</div>
              <strong style={{ display: 'block', fontSize: '1.7rem', letterSpacing: '0.08em', marginTop: 8 }}>{referralShareCode}</strong>
            </div>

            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              <div className="panel">
                <strong>{referredSignupCount}</strong>
                <div className="helper">Tracked referred signups</div>
              </div>
              <div className="panel">
                <strong>{joinedWithReferralCode || '--'}</strong>
                <div className="helper">Code used when you joined</div>
              </div>
            </div>

            {!referredMembers.length ? (
              <div className="empty-state" style={{ marginTop: 18 }}>
                No signups have used your member code yet. Once someone registers with it, they will appear here automatically.
              </div>
            ) : (
              <div className="panel-stack" style={{ marginTop: 18 }}>
                {referredMembers.map((item) => (
                  <article className="activity-item" key={item.id}>
                    <div className="activity-item-header">
                      <span className="status-chip tone-success">Referral</span>
                      <span className="helper">{formatDate(item.createdAt)}</span>
                    </div>
                    <strong>{item.displayName}</strong>
                    <div className="helper">{formatEnumLabel(item.role)} signup</div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-kicker">Earnings and Commissions</div>
            <h2 style={{ marginTop: 0 }}>Not applicable for this member account yet</h2>
            <p className="section-copy">
              The current member schema does not include a commission ledger, payout status, withdrawal workflow, or affiliate settlement data. This card stays explicit until those records actually exist.
            </p>
            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              <div className="panel">
                <strong>{referredSignupCount}</strong>
                <div className="helper">Referral signups tracked</div>
              </div>
              <div className="panel">
                <strong>Not enabled</strong>
                <div className="helper">Commission payouts</div>
              </div>
            </div>
            <div className="helper" style={{ marginTop: 16 }}>
              If a referral, ambassador, or creator commission program is activated later, earnings and payout history can surface here without changing the current member-safe behavior.
            </div>
          </section>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="btn-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="section-kicker">Followers and Following</div>
                <h2 style={{ marginTop: 0 }}>Network snapshot</h2>
              </div>
              <Link className="button-link btn-secondary" href="/creators">Browse creators</Link>
            </div>

            <div className="card-grid grid-2" style={{ marginTop: 18 }}>
              <div className="panel">
                <strong>{followCount}</strong>
                <div className="helper">Creators followed</div>
              </div>
              <div className="panel">
                <strong>{linkedCreatorProfile ? String(creatorFollowerCount) : '--'}</strong>
                <div className="helper">
                  {linkedCreatorProfile ? 'Followers on linked creator profile' : 'Followers unlock with a linked creator profile'}
                </div>
              </div>
            </div>

            <div className="helper" style={{ marginTop: 16 }}>
              {linkedCreatorProfile
                ? `This account is also linked to creator profile ${linkedCreatorProfile.name}, so follower counts are available here.`
                : 'Member accounts can follow creators immediately. Follower counts appear if this user is later linked to a creator profile.'}
            </div>

            {!followedCreators.length ? (
              <div className="empty-state" style={{ marginTop: 18 }}>
                You are not following any creators yet. Start with the creator directory and the community feed to shape your network.
              </div>
            ) : (
              <div className="panel-stack" style={{ marginTop: 18 }}>
                {followedCreators.map((item) => (
                  <article className="activity-item" key={item.id}>
                    <div className="activity-item-header">
                      <span className={`status-chip ${item.creatorProfile.isActive ? 'tone-success' : 'tone-warning'}`}>
                        {item.creatorProfile.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="helper">{formatDate(item.createdAt)}</span>
                    </div>
                    <strong>{item.creatorProfile.name}</strong>
                    <div className="helper">{item.creatorProfile.roleLabel}</div>
                    <div className="helper">{truncateText(item.creatorProfile.platformFocus, 120)}</div>
                    <div className="btn-row" style={{ marginTop: 10 }}>
                      <Link className="button-link btn-secondary" href={`/creators/${item.creatorProfile.slug}`}>Open profile</Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-kicker">Recent Activity Timeline</div>
            <h2 style={{ marginTop: 0 }}>Latest account movement</h2>
            <p className="section-copy">
              This timeline combines member signup/login history, orders, follows, saves, uploads, and notifications tied directly to the current account.
            </p>

            {!activityTimeline.length ? (
              <div className="empty-state" style={{ marginTop: 18 }}>
                Activity will appear here as soon as the account starts interacting with creators, content, or merch workflows.
              </div>
            ) : (
              <div className="panel-stack" style={{ marginTop: 18 }}>
                {activityTimeline.map((item) => (
                  <article className="activity-item" key={item.id}>
                    <div className="activity-item-header">
                      <span className={`status-chip ${item.tone}`}>{item.badge}</span>
                      <span className="helper">{formatDateTime(item.occurredAt)}</span>
                    </div>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.detail}</div>
                    <div className="helper" style={{ marginTop: 8 }}>{formatRelativeTime(item.occurredAt)}</div>
                    {item.href ? (
                      <div className="btn-row" style={{ marginTop: 10 }}>
                        <Link className="button-link btn-secondary" href={item.href}>Open</Link>
                      </div>
                    ) : null}
                  </article>
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
                <div className="section-kicker">Saved Content</div>
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
                <div className="section-kicker">Uploaded Videos and Posts</div>
                <h2 style={{ marginTop: 0 }}>Content tied to this account</h2>
              </div>
              <Link className="button-link btn-secondary" href="/feed">Open feed</Link>
            </div>

            {!uploadedPosts.length ? (
              <div className="empty-state">
                {feedPublishingEnabled
                  ? 'No uploads are tied to this account yet. Posts and videos will appear here automatically after publishing.'
                  : 'Member publishing is not enabled in the current feed permissions. Uploads will appear here if this account later receives creator, staff, or admin posting access.'}
              </div>
            ) : (
              <div className="panel-stack">
                {uploadedPosts.map((item) => {
                  const media = item.mediaAssets[0];
                  const previewUrl =
                    media?.thumbnailUrl || (media?.mediaType === 'IMAGE' ? media.url : '/assets/resurgence-poster.jpg');

                  return (
                    <article className="card" key={item.id} style={{ padding: 18 }}>
                      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '88px minmax(0, 1fr)' }}>
                        <img
                          src={previewUrl || '/assets/resurgence-poster.jpg'}
                          alt={media?.altText || item.caption}
                          style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 18 }}
                        />
                        <div>
                          <div className="activity-item-header" style={{ marginBottom: 6 }}>
                            <span className={`status-chip ${item.status === 'PUBLISHED' ? 'tone-success' : 'tone-warning'}`}>
                              {formatEnumLabel(item.status)}
                            </span>
                            <span className="helper">{formatDate(item.publishedAt || item.updatedAt || item.createdAt)}</span>
                          </div>
                          <strong>{truncateText(item.caption, 96)}</strong>
                          <div className="helper" style={{ marginTop: 6 }}>
                            {item.creatorProfile?.name ? `Posted with ${item.creatorProfile.name}` : 'User-authored content'} | {formatEnumLabel(item.visibility)}
                          </div>
                          <div className="helper" style={{ marginTop: 6 }}>{truncateText(item.summary || item.caption, 130)}</div>
                          <div className="helper" style={{ marginTop: 6 }}>
                            {item.viewCount} views | {item.likeCount} likes | {item.commentCount} comments | {item.saveCount} saves
                          </div>
                          <div className="btn-row" style={{ marginTop: 10 }}>
                            <Link className="button-link btn-secondary" href="/feed">Open in feed</Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
