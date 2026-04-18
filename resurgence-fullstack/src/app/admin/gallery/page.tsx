import { AdminShell } from '@/components/admin-shell';
import { GalleryEventManager } from '@/components/forms/gallery-event-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
  );
}
