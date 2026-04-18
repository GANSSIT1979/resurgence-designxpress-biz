<<<<<<< HEAD
import { AdminShell } from '@/components/admin-shell';
import { ContentManager } from '@/components/forms/content-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const content = await prisma.pageContent.findMany({ orderBy: { key: 'asc' } });

  return (
    <main>
      <AdminShell title="Content CMS" description="Edit hero sections, page intros, and calls to action from the dashboard." currentPath="/admin/content">
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
=======
import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Content CMS"
      endpoint="/api/admin/content"
      fields={[{"key": "key", "label": "Key", "type": "text", "required": true}, {"key": "title", "label": "Title", "type": "text", "required": true}, {"key": "subtitle", "label": "Subtitle", "type": "text"}, {"key": "body", "label": "Body", "type": "textarea", "required": true}, {"key": "ctaLabel", "label": "CTA Label", "type": "text"}, {"key": "ctaHref", "label": "CTA Href", "type": "text"}, {"key": "active", "label": "Active", "type": "checkbox"}]}
    />
>>>>>>> parent of d975526 (commit)
  );
}
