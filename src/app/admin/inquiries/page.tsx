import { AdminShell } from '@/components/admin-shell';
import { InquiryStatusManager } from '@/components/forms/inquiry-status-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main>
      <AdminShell title="Inquiries" description="Review every sponsor, apparel, and event inquiry captured by the website." currentPath="/admin/inquiries">
        <InquiryStatusManager initialInquiries={inquiries.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} />
      </AdminShell>
    </main>
  );
}
