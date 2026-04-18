import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { getCurrentUser } from "@/lib/auth";
import { logActivity, summarizeChanges } from "@/lib/audit";
import { getPublicSettings, upsertAppSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  saved?: string;
  error?: string;
}>;

async function saveSettings(formData: FormData) {
  "use server";

  const before = await getPublicSettings();

  const nextSettings = {
    contactName: String(formData.get("contactName") || "").trim(),
    contactEmail: String(formData.get("contactEmail") || "").trim(),
    contactPhone: String(formData.get("contactPhone") || "").trim(),
    contactAddress: String(formData.get("contactAddress") || "").trim(),
    adminTitle: String(formData.get("adminTitle") || "").trim(),
    adminSubtitle: String(formData.get("adminSubtitle") || "").trim(),
    reportFooter: String(formData.get("reportFooter") || "").trim(),
  };

  if (
    !nextSettings.contactName ||
    !nextSettings.contactEmail ||
    !nextSettings.contactPhone ||
    !nextSettings.contactAddress ||
    !nextSettings.adminTitle ||
    !nextSettings.adminSubtitle ||
    !nextSettings.reportFooter
  ) {
    redirect("/admin/settings?error=Please%20complete%20all%20fields");
  }

  try {
    const saved = await upsertAppSettings(nextSettings);

    try {
      const actor = await getCurrentUser();

      await logActivity({
        actorId: actor?.id || null,
        actorEmail: actor?.email || "unknown@local",
        actorRole: actor?.role || null,
        action: "SETTINGS_UPDATED",
        resource: "app-setting",
        targetLabel: "public-admin-settings",
        metadata: summarizeChanges(
          before as unknown as Record<string, unknown>,
          saved as unknown as Record<string, unknown>,
          [
            "contactName",
            "contactEmail",
            "contactPhone",
            "contactAddress",
            "adminTitle",
            "adminSubtitle",
            "reportFooter",
          ]
        ),
      });
    } catch (auditError) {
      console.error("Settings audit log failed:", auditError);
    }

    revalidatePath("/admin/settings");
    redirect("/admin/settings?saved=1");
  } catch (error) {
    console.error("Save settings failed:", error);
    redirect("/admin/settings?error=Unable%20to%20save%20settings");
  }
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const settings = await getPublicSettings();

  return (
    <DashboardPageOrchestrator
      eyebrow="Platform Settings"
      title="Admin and public site defaults"
      subtitle="Update business contact details, admin labels, and report footer defaults without a client-side loading state."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/sponsor-submissions", label: "Applications" },
        { href: "/admin/gallery", label: "Gallery" },
        { href: "/admin/inquiries", label: "Inquiries" },
        { href: "/admin/settings", label: "Settings", exact: true },
      ]}
    >
      <section className="form-section-card">
        <div className="form-section-head">
          <div className="eyebrow">Settings Workspace</div>
          <h2 className="form-section-title">Editable configuration</h2>
          <p className="form-section-subtitle">
            These values drive admin labels, public contact defaults, and report footer text.
          </p>
        </div>

        {params?.saved ? (
          <div className="success-text">Settings saved successfully.</div>
        ) : null}

        {params?.error ? (
          <div className="field-error">{params.error}</div>
        ) : null}

        <form action={saveSettings} className="crud-form">
          <div className="form-grid">
            <div className="field-shell">
              <div className="field-label-row">
                <label htmlFor="contactName">Contact Name</label>
              </div>
              <div className="field-control">
                <input
                  id="contactName"
                  name="contactName"
                  defaultValue={settings.contactName}
                />
              </div>
            </div>

            <div className="field-shell">
              <div className="field-label-row">
                <label htmlFor="contactEmail">Contact Email</label>
              </div>
              <div className="field-control">
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={settings.contactEmail}
                />
              </div>
            </div>

            <div className="field-shell">
              <div className="field-label-row">
                <label htmlFor="contactPhone">Contact Phone</label>
              </div>
              <div className="field-control">
                <input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={settings.contactPhone}
                />
              </div>
            </div>

            <div className="field-shell">
              <div className="field-label-row">
                <label htmlFor="contactAddress">Contact Address</label>
              </div>
              <div className="field-control">
                <input
                  id="contactAddress"
                  name="contactAddress"
                  defaultValue={settings.contactAddress}
                />
              </div>
            </div>

            <div className="field-shell">
              <div className="field-label-row">
                <label htmlFor="adminTitle">Admin Title</label>
              </div>
              <div className="field-control">
                <input
                  id="adminTitle"
                  name="adminTitle"
                  defaultValue={settings.adminTitle}
                />
              </div>
            </div>

            <div className="field-shell">
              <div className="field-label-row">
                <label htmlFor="adminSubtitle">Admin Subtitle</label>
              </div>
              <div className="field-control">
                <input
                  id="adminSubtitle"
                  name="adminSubtitle"
                  defaultValue={settings.adminSubtitle}
                />
              </div>
            </div>

            <div className="field-shell" style={{ gridColumn: "1 / -1" }}>
              <div className="field-label-row">
                <label htmlFor="reportFooter">Report Footer</label>
              </div>
              <div className="field-control">
                <textarea
                  id="reportFooter"
                  name="reportFooter"
                  rows={4}
                  defaultValue={settings.reportFooter}
                />
              </div>
            </div>
          </div>

          <div className="form-actions-bar form-actions-right">
            <button className="button" type="submit">
              Save Settings
            </button>
          </div>
        </form>
      </section>
    </DashboardPageOrchestrator>
  );
}