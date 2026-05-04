import { AdminShell } from '@/components/admin-shell';
import { ContentManager } from '@/components/forms/content-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const content = await prisma.pageContent.findMany({ orderBy: { key: 'asc' } });

  return (
    <main>
      <AdminShell title="Content CMS" description="Manage public page copy, TikTok discovery cards, event sections, support content, and calls to action." currentPath="/admin/content">
        <ContentManager initialContent={content.map((item) => ({
          id: item.id,
          key: item.key,
          title: item.title,
          subtitle: item.subtitle,
          body: item.body,
          ctaLabel: item.ctaLabel,
          ctaHref: item.ctaHref,
        }))} />
      </AdminShell>
    </main>
  );
}
