import Link from 'next/link';
import { CreatorAnalyticsPanel } from '@/components/creator-analytics-panel';
import { CreatorDashboardOverview } from '@/components/creator/creator-dashboard-overview';
import { CreatorProfileDashboard } from '@/components/creator/creator-profile-dashboard';
import { NotificationCenter } from '@/components/notification-center';
import { RoleShell } from '@/components/role-shell';
import { creatorNavItems } from '@/lib/creators';
import { getCreatorStats } from '@/lib/creators';
import { serializeCreatorProfile } from '@/lib/creators';
import { getAutomationInbox } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

export default async function CreatorDashboardPage() {
  const context = await getCurrentSessionUser();

  if (!context || context.user.role !== 'CREATOR') {
    return (
      <main>
        <RoleShell roleLabel="Creator" title="Creator Dashboard" description="Unable to load creator session." navItems={[...creatorNavItems]} currentPath="/creator/dashboard">
          <section className="card">
            <p className="section-copy">Please sign in with a creator account to continue.</p>
          </section>
        </RoleShell>
      </main>
    );
  }

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: context.user.id },
    include: {
      user: true,
      mediaEvents: {
        where: { isActive: true },
        include: { mediaItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
        orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!creator) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Dashboard"
          description="Your creator user is active, but no creator profile has been linked yet."
          navItems={[...creatorNavItems]}
          currentPath="/creator/dashboard"
        >
          <section className="card">
            <div className="section-kicker">Profile Not Linked</div>
            <h2 style={{ marginTop: 0 }}>Ask an admin to link your creator account.</h2>
            <p className="section-copy">
              The admin can open Manage Creators, edit your profile, and add your creator login email so this dashboard can load your stats and public profile.
            </p>
            <div className="btn-row">
              <Link className="button-link" href="/creators">View Public Creators</Link>
              <Link className="button-link btn-secondary" href="/contact">Contact Support</Link>
            </div>
          </section>
        </RoleShell>
      </main>
    );
  }

  const creatorProfile = serializeCreatorProfile(creator);
  const creatorStats = getCreatorStats(creatorProfile);
  const [inbox, creatorPosts] = await Promise.all([
    getAutomationInbox(context.user.role, context.user.id, 6),
    prisma.contentPost.findMany({
      where: {
        creatorProfileId: creator.id,
        status: { not: 'DELETED' },
      },
      select: {
        id: true,
        caption: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        likeCount: true,
        commentCount: true,
        saveCount: true,
        shareCount: true,
        viewCount: true,
        productTags: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);
  const publishedCount = creatorPosts.filter((post) => post.status === 'PUBLISHED').length;
  const draftCount = creatorPosts.filter((post) => post.status === 'DRAFT').length;
  const unreadAlerts = inbox.notifications.filter((item) => !item.isRead).length;
  const taggedProductsMap = new Map<string, { id: string; name: string; slug: string; imageUrl: string | null; tagCount: number }>();

  creatorPosts.forEach((post) => {
    post.productTags.forEach((tag) => {
      if (!tag.product) return;

      const existing = taggedProductsMap.get(tag.product.id);
      taggedProductsMap.set(tag.product.id, {
        id: tag.product.id,
        name: tag.product.name,
        slug: tag.product.slug,
        imageUrl: tag.product.imageUrl,
        tagCount: (existing?.tagCount || 0) + 1,
      });
    });
  });

  return (
    <main>
      <RoleShell
        roleLabel="Creator"
        title={`${creator.name} Dashboard`}
        description="Review your public creator profile, social links, content readiness, and sponsor-facing presentation."
        navItems={[...creatorNavItems]}
        currentPath="/creator/dashboard"
      >
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <Link className="button-link" href={`/creators/${creator.slug}`}>Open Public Profile</Link>
          <Link className="button-link btn-secondary" href="/contact">Request Profile Update</Link>
        </div>
        <CreatorDashboardOverview
          profileCompleteness={creatorStats.completeness}
          totalFollowersLabel={creatorStats.totalFollowersLabel}
          linkedPlatformCount={creatorStats.linkedPlatformCount}
          totalPosts={creatorPosts.length}
          publishedCount={publishedCount}
          draftCount={draftCount}
          taggedProductsCount={Array.from(taggedProductsMap.values()).reduce((sum, item) => sum + item.tagCount, 0)}
          unreadAlerts={unreadAlerts}
          recentPosts={creatorPosts.slice(0, 4).map((post) => ({
            id: post.id,
            caption: post.caption,
            status: post.status,
            publishedAt: post.publishedAt?.toISOString() ?? null,
            updatedAt: post.updatedAt.toISOString(),
            metrics: {
              views: post.viewCount,
              likes: post.likeCount,
              comments: post.commentCount,
              saves: post.saveCount,
              shares: post.shareCount,
            },
            productTagCount: post.productTags.length,
          }))}
          taggedProducts={Array.from(taggedProductsMap.values()).sort((left, right) => right.tagCount - left.tagCount).slice(0, 4)}
        />
        <CreatorProfileDashboard creator={creatorProfile} />
        <CreatorAnalyticsPanel creator={creator} events={creator.mediaEvents.map((event) => ({
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          mediaItems: event.mediaItems.map((item) => ({ mediaType: item.mediaType })),
        }))} />
        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Creator alerts and automation"
            notifications={inbox.notifications}
            emails={inbox.emails}
            degradedMessage={inbox.degradedReason ?? null}
          />
        </div>
      </RoleShell>
    </main>
  );
}
