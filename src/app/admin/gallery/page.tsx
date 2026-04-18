import { AdminShell } from '@/components/admin-shell';
import { GalleryEventManager } from '@/components/forms/gallery-event-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

<<<<<<< HEAD
export default async function GalleryPage() {
  const [events, creators] = await Promise.all([
    prisma.mediaEvent.findMany({
      include: { mediaItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
      orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.creatorProfile.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
  ]);

  return (
    <main>
      <AdminShell
        title="Homepage Gallery"
        description="Manage homepage media events, add images or embedded media, and connect gallery content to creator dashboards."
        currentPath="/admin/gallery"
      >
        <GalleryEventManager
          initialItems={events.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            eventDate: item.eventDate ? item.eventDate.toISOString() : null,
            creatorId: item.creatorId,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
            mediaItems: item.mediaItems.map((media) => ({
              id: media.id,
              mediaType: media.mediaType,
              url: media.url,
              thumbnailUrl: media.thumbnailUrl,
              caption: media.caption,
              sortOrder: media.sortOrder,
            })),
          }))}
          creators={creators.map((creator) => ({ id: creator.id, label: creator.name }))}
        />
      </AdminShell>
    </main>
=======
export default async function AdminGalleryPage() {
  const media = await db.galleryMedia.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const featured = media.filter((item) => Boolean(item.featured)).length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Gallery CMS"
      title="Media gallery management"
      subtitle="Control featured visuals, event media, captions, and sponsor-facing storytelling assets."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/gallery", label: "Gallery", exact: true, count: media.length },
        { href: "/admin/sponsor-submissions", label: "Applications" },
        { href: "/admin/inquiries", label: "Inquiries" },
      ]}
      actions={
        <Link href="/admin" className="button button-secondary button-small">
          Back to Admin
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{media.length}</div>
            <div className="dashboard-stat-label">Media items</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{featured}</div>
            <div className="dashboard-stat-label">Featured items</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              <StatusBadge label={featured ? "Featured Ready" : "Needs Curation"} />
            </div>
            <div className="dashboard-stat-label">Homepage readiness</div>
          </div>
        </div>
      }
    >
      <CrudManager
        title="Gallery Media"
        subtitle="Manage images, captions, descriptions, and featured media for the public website."
        endpoint="/api/admin/gallery"
        columns={[
          { key: "title", label: "Title" },
          { key: "caption", label: "Caption" },
          { key: "image", label: "Image" },
          { key: "featured", label: "Featured" },
        ]}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "caption", label: "Caption" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image", label: "Image", type: "image" },
          { name: "featured", label: "Featured", type: "select", options: ["true", "false"] },
        ]}
        emptyMessage="No gallery media is available yet."
      />
    </DashboardPageOrchestrator>
>>>>>>> parent of d975526 (commit)
  );
}
