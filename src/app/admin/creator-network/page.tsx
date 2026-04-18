<<<<<<< HEAD
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
=======
import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Creator Network"
      endpoint="/api/admin/creator-network"
      fields={[{"key": "fullName", "label": "Full Name", "type": "text", "required": true}, {"key": "slug", "label": "Slug", "type": "text", "required": true}, {"key": "biography", "label": "Biography", "type": "textarea", "required": true}, {"key": "journeyStory", "label": "Journey Story", "type": "textarea", "required": true}, {"key": "pointsPerGame", "label": "Points Per Game", "type": "number", "required": true}, {"key": "assistsPerGame", "label": "Assists Per Game", "type": "number", "required": true}, {"key": "reboundsPerGame", "label": "Rebounds Per Game", "type": "number", "required": true}, {"key": "image", "label": "Image", "type": "image"}, {"key": "socialLinks", "label": "Social Links JSON", "type": "json", "required": true}, {"key": "featured", "label": "Featured", "type": "checkbox"}]}
    />
>>>>>>> parent of d975526 (commit)
  );
}
