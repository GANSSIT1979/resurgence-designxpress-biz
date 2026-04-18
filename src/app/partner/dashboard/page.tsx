import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function parseJsonList(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getEmbedUrl(url: string) {
  if (!url) return "";

  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  if (url.includes("/embed/")) {
    return url;
  }

  return "";
}

export default async function PartnerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/partner/dashboard");
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  const partnerId = (dbUser as any)?.partnerId;

  if (!partnerId) {
    notFound();
  }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
  });

  if (!partner) {
    notFound();
  }

  const gallery = parseJsonList((partner as any).galleryJson);
  const videoLinks = parseJsonList((partner as any).videoLinksJson);
  const socialLinks = parseJsonList((partner as any).socialLinksJson);

  return (
    <div className="page-shell">
      <div className="container">
        <section className="dashboard-surface" style={{ marginBottom: 20 }}>
          <div className="eyebrow">Partner Dashboard</div>
          <h1 className="dashboard-section-title">{(partner as any).name || (partner as any).companyName || "Partner"}</h1>
          <p className="dashboard-section-subtitle">
            Manage partner brand data, media, collaboration materials, and creator-facing campaign assets.
          </p>

          <div className="inline-actions">
            <Link href="/contact" className="button">
              Contact Team
            </Link>
            <Link href="/support" className="button button-secondary">
              Support Desk
            </Link>
          </div>
        </section>

        <section className="grid-4" style={{ marginBottom: 20 }}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{gallery.length}</div>
            <div className="dashboard-stat-label">Gallery Items</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{videoLinks.length}</div>
            <div className="dashboard-stat-label">Video Links</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{socialLinks.length}</div>
            <div className="dashboard-stat-label">Social Links</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{(partner as any).creatorFocus || "—"}</div>
            <div className="dashboard-stat-label">Creator Focus</div>
          </div>
        </section>

        <section className="grid-2">
          <div className="form-section-card">
            <div className="eyebrow">Partner Details</div>
            <h2 className="form-section-title">Business information</h2>
            <div className="list-stack">
              {[
                ["Contact Name", (partner as any).contactName],
                ["Contact Email", (partner as any).contactEmail],
                ["Contact Phone", (partner as any).contactPhone],
                ["Address", (partner as any).address],
                ["Website", (partner as any).websiteUrl],
                ["Brand Story", (partner as any).brandStory],
                ["Creator Focus", (partner as any).creatorFocus],
              ].map(([label, value]) => (
                <div key={String(label)} className="list-item" style={{ padding: "16px 18px" }}>
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>{label}</strong>
                    <div className="muted">{String(value || "To be updated")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section-card">
            <div className="eyebrow">Social Presence</div>
            <h2 className="form-section-title">Public links</h2>
            {socialLinks.length ? (
              <div className="list-stack">
                {socialLinks.map((item: any, index: int) => (
                  <a
                    key={index}
                    href={item?.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="list-item"
                    style={{ padding: "16px 18px", alignItems: "center" }}
                  >
                    <div>
                      <strong style={{ display: "block", marginBottom: 6 }}>{item?.label || "Social Link"}</strong>
                      <div className="muted">{item?.url || "No URL"}</div>
                    </div>
                    <span className="button button-secondary button-small">Open</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">No social links added yet.</div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="grid-2">
            <div className="form-section-card">
              <div className="eyebrow">Image Gallery</div>
              <h2 className="form-section-title">Brand media</h2>

              {gallery.length ? (
                <div className="grid-2">
                  {gallery.map((item: any, index: int) => (
                    <div key={index} className="card" style={{ padding: 12 }}>
                      <img
                        src={typeof item === "string" ? item : item?.url || ""}
                        alt={typeof item === "object" ? item?.label || "Partner media" : "Partner media"}
                        style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 16 }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No gallery images added yet.</div>
              )}
            </div>

            <div className="form-section-card">
              <div className="eyebrow">Video Links</div>
              <h2 className="form-section-title">Realtime viewing / live preview</h2>

              {videoLinks.length ? (
                <div className="list-stack">
                  {videoLinks.map((item: any, index: int) => {
                    const rawUrl = typeof item === "string" ? item : item?.url || "";
                    const embedUrl = getEmbedUrl(rawUrl);

                    return (
                      <div key={index} className="card" style={{ padding: 16 }}>
                        <strong style={{ display: "block", marginBottom: 10 }}>
                          {typeof item === "object" ? item?.label || "Video Link" : "Video Link"}
                        </strong>

                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={`partner-video-${index}`}
                            style={{ width: "100%", height: 240, border: 0, borderRadius: 16 }}
                            allowFullScreen
                          />
                        ) : (
                          <div className="muted" style={{ marginBottom: 12 }}>
                            Preview not embeddable for this link. Open directly below.
                          </div>
                        )}

                        <a href={rawUrl} target="_blank" rel="noreferrer" className="button button-secondary button-small">
                          Open Video
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">No video links added yet.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
