import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { CreatorProfileDashboard } from '@/components/creator/creator-profile-dashboard';
import { serializeCreatorProfile } from '@/lib/creators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await prisma.creatorProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!creator) notFound();

  return (
    <main>
      <AdminShell
        title={`${creator.name} Creator Profile`}
        description="View creator details, social reach, profile completeness, public links, and admin controls."
        currentPath="/admin/creators"
      >
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <Link className="button-link btn-secondary" href="/admin/creators">Back to Manage Creators</Link>
          <Link className="button-link" href={`/creators/${creator.slug}`}>Open Public Profile</Link>
        </div>
        <CreatorProfileDashboard creator={serializeCreatorProfile(creator)} showAdminActions />
      </AdminShell>
    </main>
  );
}
