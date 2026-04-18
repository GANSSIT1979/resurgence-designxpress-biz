import { AdminShell } from '@/components/admin-shell';
import { CreatorProfileManager } from '@/components/forms/creator-profile-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CreatorNetworkPage() {
  const initialItems = await prisma.creatorProfile.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <AdminShell
        title="Creator Network CMS"
        description="Manage the six high-engagement creators used in the 2026 sponsorship proposal and sponsor-facing opportunity summary."
        currentPath="/admin/creator-network"
      >
        <CreatorProfileManager initialItems={initialItems} />
      </AdminShell>
    </main>
  );
}
