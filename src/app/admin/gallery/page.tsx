import Link from "next/link";
import { db } from "@/lib/db";
import { CrudManager } from "@/components/crud-manager";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const rawItems = await db.galleryMedia.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const media = rawItems.map((item) => ({
    ...item,
    createdAt: item.createdAt?.toISOString?.() ?? String(item.createdAt ?? ""),
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
  }));

  const featured = rawItems.filter((item) => Boolean(item.featured)).length;

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
        { href: "/admin/settings", label: "Settings" },
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
        savedViewScope="/api/admin/gallery"
        initialItems={media}
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
          {
            name: "featured",
            label: "Featured",
            type: "select",
            options: ["true", "false"],
          },
        ]}
        emptyMessage="No gallery media is available yet."
        statusField="featured"
      />
    </DashboardPageOrchestrator>
  );
}