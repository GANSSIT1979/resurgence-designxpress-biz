import Link from "next/link";
import { db } from "@/lib/db";
import { CrudManager } from "@/components/crud-manager";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

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
        { href: "/admin/creator-network", label: "Creators" },
        { href: "/admin/products-services", label: "Products" },
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
          {
            name: "featured",
            label: "Featured",
            type: "select",
            options: ["true", "false"],
          },
        ]}
        emptyMessage="No gallery media is available yet."
      />
    </DashboardPageOrchestrator>
  );
}
