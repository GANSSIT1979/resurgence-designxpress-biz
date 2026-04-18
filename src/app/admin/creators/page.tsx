import { AdminShell } from '@/components/admin-shell';
import { CreatorProfileManager } from '@/components/forms/creator-profile-manager';
import { serializeCreatorProfile } from '@/lib/creators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCreatorsPage() {
  const initialItems = await prisma.creatorProfile.findMany({
    include: { user: true },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  return (
    <main>
      <AdminShell
        title="Creators Management"
        description="Create creator users, update creator profiles, manage social links, review stats, and keep the public creator directory production-ready."
        currentPath="/admin/creators"
      >
        <CreatorProfileManager initialItems={initialItems.map((item) => serializeCreatorProfile(item))} />
      </AdminShell>
    </main>
  );
}
