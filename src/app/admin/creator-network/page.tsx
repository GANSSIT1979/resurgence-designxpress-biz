import Link from "next/link";
import { db } from "@/lib/db";
import { CrudManager } from "@/components/crud-manager";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AdminCreatorNetworkPage() {
  const rawItems = await db.creatorProfile.findMany({
    orderBy: [{ featured: "desc" }, { fullName: "asc" }],
  });

  const items = rawItems.map((item) => ({
    ...item,
    createdAt: item.createdAt?.toISOString?.() ?? String(item.createdAt ?? ""),
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
  }));

  const featuredCount = rawItems.filter((item) => Boolean(item.featured)).length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Creator Network"
      title="Creator profile management"
      subtitle="Manage creator identity, social reach, profile details, and public-facing athlete/influencer pages from one workspace."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/creator-network", label: "Creator Network", exact: true, count: items.length },
        { href: "/admin/sponsor-submissions", label: "Applications" },
        { href: "/admin/gallery", label: "Gallery" },
        { href: "/admin/settings", label: "Settings" },
      ]}
      actions={
        <Link href="/admin" className="button button-small">
          Back to Admin
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{items.length}</div>
            <div className="dashboard-stat-label">Creator profiles</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{featuredCount}</div>
            <div className="dashboard-stat-label">Featured creators</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              <StatusBadge label={featuredCount ? "Roster Active" : "Needs Curation"} />
            </div>
            <div className="dashboard-stat-label">Network status</div>
          </div>
        </div>
      }
    >
      <CrudManager
        title="Creator Profiles"
        subtitle="Edit creator bios, performance metrics, public links, contact details, and platform reach."
        endpoint="/api/admin/creator-network"
        savedViewScope="/api/admin/creator-network"
        initialItems={items}
        columns={[
          { key: "fullName", label: "Name" },
          { key: "position", label: "Position" },
          { key: "jobDescription", label: "Role" },
          { key: "facebookFollowers", label: "Facebook Reach" },
          { key: "youtubeFollowers", label: "YouTube Reach" },
          { key: "featured", label: "Featured" },
        ]}
        fields={[
          { name: "fullName", label: "Full Name", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "image", label: "Hero Image", type: "image" },
          { name: "biography", label: "Biography", type: "textarea" },
          { name: "journeyStory", label: "Journey Story", type: "textarea" },

          { name: "contactNumber", label: "Contact Number" },
          { name: "address", label: "Address" },
          { name: "dateOfBirth", label: "Date of Birth" },
          { name: "jobDescription", label: "Job Description" },
          { name: "position", label: "Position" },
          { name: "height", label: "Height" },

          { name: "facebookPage", label: "Facebook Page" },
          { name: "facebookFollowers", label: "Facebook Followers" },
          { name: "tiktokPage", label: "TikTok Page" },
          { name: "tiktokFollowers", label: "TikTok Followers" },
          { name: "instagramPage", label: "Instagram Page" },
          { name: "instagramFollowers", label: "Instagram Followers" },
          { name: "youtubePage", label: "YouTube Page" },
          { name: "youtubeFollowers", label: "YouTube Followers" },
          { name: "trendingVideoUrl", label: "Trending Video URL" },

          { name: "pointsPerGame", label: "Points Per Game", type: "number" },
          { name: "assistsPerGame", label: "Assists Per Game", type: "number" },
          { name: "reboundsPerGame", label: "Rebounds Per Game", type: "number" },

          {
            name: "featured",
            label: "Featured",
            type: "select",
            options: ["true", "false"],
          },
        ]}
        emptyMessage="No creator profiles are available yet."
        statusField="featured"
      />
    </DashboardPageOrchestrator>
  );
}
