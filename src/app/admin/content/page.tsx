import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logActivity, summarizeChanges } from "@/lib/audit";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  id?: string;
  saved?: string;
  deleted?: string;
  error?: string;
}>;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function saveContent(formData: FormData) {
  "use server";

  const id = asString(formData.get("id"));
  const key = asString(formData.get("key"));
  const title = asString(formData.get("title"));
  const subtitle = asString(formData.get("subtitle"));
  const body = asString(formData.get("body"));
  const ctaLabel = asString(formData.get("ctaLabel"));
  const ctaHref = asString(formData.get("ctaHref"));

  if (!key || !title) {
    redirect("/admin/content?error=Key%20and%20title%20are%20required");
  }

  try {
    const actor = await getCurrentUser();

    if (id) {
      const before = await db.pageContent.findUnique({ where: { id } });

      if (!before) {
        redirect("/admin/content?error=Content%20record%20not%20found");
      }

      const item = await db.pageContent.update({
        where: { id },
        data: {
          key,
          title,
          subtitle: subtitle || null,
          body: body || null,
          ctaLabel: ctaLabel || null,
          ctaHref: ctaHref || null,
        },
      });

      try {
        await logActivity({
          actorId: actor?.id || null,
          actorEmail: actor?.email || "unknown@local",
          actorRole: actor?.role || null,
          action: "CONTENT_UPDATED",
          resource: "page-content",
          resourceId: item.id,
          targetLabel: item.key,
          metadata: summarizeChanges(
            before as unknown as Record<string, unknown>,
            item as unknown as Record<string, unknown>,
            ["key", "title", "subtitle", "body", "ctaLabel", "ctaHref"]
          ),
        });
      } catch (auditError) {
        console.error("Content update audit failed:", auditError);
      }

      revalidatePath("/admin/content");
      redirect(`/admin/content?id=${item.id}&saved=1`);
    }

    const item = await db.pageContent.create({
      data: {
        key,
        title,
        subtitle: subtitle || null,
        body: body || null,
        ctaLabel: ctaLabel || null,
        ctaHref: ctaHref || null,
      },
    });

    try {
      await logActivity({
        actorId: actor?.id || null,
        actorEmail: actor?.email || "unknown@local",
        actorRole: actor?.role || null,
        action: "CONTENT_CREATED",
        resource: "page-content",
        resourceId: item.id,
        targetLabel: item.key,
        metadata: {
          key: item.key,
          title: item.title,
          subtitle: item.subtitle,
          ctaLabel: item.ctaLabel,
          ctaHref: item.ctaHref,
        },
      });
    } catch (auditError) {
      console.error("Content create audit failed:", auditError);
    }

    revalidatePath("/admin/content");
    redirect(`/admin/content?id=${item.id}&saved=1`);
  } catch (error) {
    console.error("Save content failed:", error);
    redirect("/admin/content?error=Unable%20to%20save%20content");
  }
}

async function deleteContent(formData: FormData) {
  "use server";

  const id = asString(formData.get("id"));

  if (!id) {
    redirect("/admin/content?error=Missing%20content%20ID");
  }

  try {
    const actor = await getCurrentUser();
    const before = await db.pageContent.findUnique({ where: { id } });

    if (!before) {
      redirect("/admin/content?error=Content%20record%20not%20found");
    }

    await db.pageContent.delete({ where: { id } });

    try {
      await logActivity({
        actorId: actor?.id || null,
        actorEmail: actor?.email || "unknown@local",
        actorRole: actor?.role || null,
        action: "CONTENT_DELETED",
        resource: "page-content",
        resourceId: before.id,
        targetLabel: before.key,
        metadata: {
          key: before.key,
          title: before.title,
        },
      });
    } catch (auditError) {
      console.error("Content delete audit failed:", auditError);
    }

    revalidatePath("/admin/content");
    redirect("/admin/content?deleted=1");
  } catch (error) {
    console.error("Delete content failed:", error);
    redirect("/admin/content?error=Unable%20to%20delete%20content");
  }
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const items = await db.pageContent.findMany({
    orderBy: [{ key: "asc" }],
  });

  const activeId = params.id || items[0]?.id || "";
  const activeItem =
    items.find((item) => item.id === activeId) || null;

  return (
    <DashboardPageOrchestrator
      eyebrow="Content CMS"
      title="Page content editor"
      subtitle="Manage page copy and CTA fields using a server-rendered single-record editor with server actions."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/sponsor-submissions", label: "Applications" },
        { href: "/admin/gallery", label: "Gallery" },
        { href: "/admin/inquiries", label: "Inquiries" },
        { href: "/admin/content", label: "Content", exact: true, count: items.length },
        { href: "/admin/settings", label: "Settings" },
      ]}
      actions={
        <Link href="/admin/content" className="button button-small">
          New Content Entry
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{items.length}</div>
            <div className="dashboard-stat-label">Content records</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{activeItem ? "Editing" : "New"}</div>
            <div className="dashboard-stat-label">Current mode</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{activeItem?.key || "—"}</div>
            <div className="dashboard-stat-label">Selected key</div>
          </div>
        </div>
      }
    >
      <div className="grid-2">
        <section className="form-section-card">
          <div className="form-section-head">
            <div className="eyebrow">Content Records</div>
            <h2 className="form-section-title">Available entries</h2>
            <p className="form-section-subtitle">
              Select an existing content block to edit, or start a new one.
            </p>
          </div>

          {items.length ? (
            <div className="list-stack">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/content?id=${item.id}`}
                  className="list-item"
                >
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {item.title}
                    </strong>
                    <div className="muted">{item.key}</div>
                  </div>
                  <div className="dashboard-chip">
                    {item.id === activeId ? "Selected" : "Open"}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">No content records yet.</div>
          )}
        </section>

        <section className="form-section-card">
          <div className="form-section-head">
            <div className="eyebrow">Editor</div>
            <h2 className="form-section-title">
              {activeItem ? "Edit content entry" : "Create content entry"}
            </h2>
            <p className="form-section-subtitle">
              Update core page copy and CTA fields without client-side loading states.
            </p>
          </div>

          {params.saved ? (
            <div className="success-text">Content saved successfully.</div>
          ) : null}

          {params.deleted ? (
            <div className="success-text">Content deleted successfully.</div>
          ) : null}

          {params.error ? (
            <div className="field-error">{params.error}</div>
          ) : null}

          <form action={saveContent} className="crud-form">
            <input type="hidden" name="id" defaultValue={activeItem?.id || ""} />

            <div className="form-grid">
              <div className="field-shell">
                <div className="field-label-row">
                  <label htmlFor="key">Key</label>
                </div>
                <div className="field-control">
                  <input id="key" name="key" defaultValue={activeItem?.key || ""} />
                </div>
              </div>

              <div className="field-shell">
                <div className="field-label-row">
                  <label htmlFor="title">Title</label>
                </div>
                <div className="field-control">
                  <input id="title" name="title" defaultValue={activeItem?.title || ""} />
                </div>
              </div>

              <div className="field-shell">
                <div className="field-label-row">
                  <label htmlFor="subtitle">Subtitle</label>
                </div>
                <div className="field-control">
                  <input
                    id="subtitle"
                    name="subtitle"
                    defaultValue={activeItem?.subtitle || ""}
                  />
                </div>
              </div>

              <div className="field-shell">
                <div className="field-label-row">
                  <label htmlFor="ctaLabel">CTA Label</label>
                </div>
                <div className="field-control">
                  <input
                    id="ctaLabel"
                    name="ctaLabel"
                    defaultValue={activeItem?.ctaLabel || ""}
                  />
                </div>
              </div>

              <div className="field-shell" style={{ gridColumn: "1 / -1" }}>
                <div className="field-label-row">
                  <label htmlFor="ctaHref">CTA Link</label>
                </div>
                <div className="field-control">
                  <input
                    id="ctaHref"
                    name="ctaHref"
                    defaultValue={activeItem?.ctaHref || ""}
                  />
                </div>
              </div>

              <div className="field-shell" style={{ gridColumn: "1 / -1" }}>
                <div className="field-label-row">
                  <label htmlFor="body">Body</label>
                </div>
                <div className="field-control">
                  <textarea
                    id="body"
                    name="body"
                    rows={10}
                    defaultValue={activeItem?.body || ""}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions-bar form-actions-between">
              <div className="inline-actions">
                {activeItem ? (
                  <form action={deleteContent}>
                    <input type="hidden" name="id" value={activeItem.id} />
                    <button className="button button-secondary" type="submit">
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>

              <button className="button" type="submit">
                {activeItem ? "Save Changes" : "Create Content"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </DashboardPageOrchestrator>
  );
}