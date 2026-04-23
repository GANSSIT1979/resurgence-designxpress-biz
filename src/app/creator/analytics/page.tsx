import Link from 'next/link';
import CreatorAnalyticsDashboard from '@/components/resurgence/CreatorAnalyticsDashboard';
import { RoleShell } from '@/components/role-shell';
import { getCreatorAnalyticsDashboard } from '@/lib/creator-analytics/getCreatorAnalyticsDashboard';
import { creatorNavItems } from '@/lib/creators';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

export default async function CreatorAnalyticsPage() {
  const context = await getCurrentSessionUser();

  if (!context || context.user.role !== 'CREATOR') {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Analytics"
          description="Unable to load creator analytics without an active creator session."
          navItems={[...creatorNavItems]}
          currentPath="/creator/analytics"
        >
          <section className="card">
            <p className="section-copy">Please sign in with a creator account to continue.</p>
          </section>
        </RoleShell>
      </main>
    );
  }

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: context.user.id },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!creator) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Analytics"
          description="Your creator user is active, but no creator profile has been linked yet."
          navItems={[...creatorNavItems]}
          currentPath="/creator/analytics"
        >
          <section className="card">
            <div className="section-kicker">Profile Not Linked</div>
            <h2 style={{ marginTop: 0 }}>Ask an admin to link your creator account.</h2>
            <p className="section-copy">
              The admin can connect your creator login to a CreatorProfile so analytics can load your live post and rollup data.
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

  const [snapshot7d, snapshot30d] = await Promise.all([
    getCreatorAnalyticsDashboard(creator.id, '7d'),
    getCreatorAnalyticsDashboard(creator.id, '30d'),
  ]);

  return (
    <main>
      <RoleShell
        roleLabel="Creator"
        title={`${creator.name} Analytics`}
        description="Review seven-day and thirty-day creator performance, retention, and top-post signals without leaving the creator workspace."
        navItems={[...creatorNavItems]}
        currentPath="/creator/analytics"
      >
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <Link className="button-link" href="/creator/posts/new">Create New Post</Link>
          <Link className="button-link btn-secondary" href="/creator/posts">Manage Posts</Link>
          <Link className="button-link btn-secondary" href="/creator/dashboard">Back to Dashboard</Link>
          <Link className="button-link btn-secondary" href={`/creators/${creator.slug}`}>Open Public Profile</Link>
        </div>

        <CreatorAnalyticsDashboard
          creatorName={creator.name}
          snapshots={{ '7d': snapshot7d, '30d': snapshot30d }}
        />
      </RoleShell>
    </main>
  );
}
