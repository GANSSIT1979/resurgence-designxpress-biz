import { NextResponse } from "next/server";
import { adminSettingsSchema } from "@/lib/validation";
import { getPublicSettings, upsertAppSettings } from "@/lib/settings";
import { logActivity, summarizeChanges } from "@/lib/audit";

export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);

    return NextResponse.json(
      {
        settings: {
          contactName: "RESURGENCE Team",
          contactEmail: "support@resurgence.designxpress.biz",
          contactPhone: "+63 966 405 7004",
          contactAddress: "Caloocan City, Philippines",
          adminTitle: "RESURGENCE Admin",
          adminSubtitle: "Powered by DesignXpress",
          reportFooter: "RESURGENCE Powered by DesignXpress",
        },
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings payload." },
      { status: 400 }
    );
  }

  try {
    const before = await getPublicSettings();
    const settings = await upsertAppSettings(parsed.data);
    const after = { ...before, ...settings };

    await logActivity({
      request,
      action: "SETTINGS_UPDATED",
      resource: "app-setting",
      targetLabel: "public-admin-settings",
      metadata: summarizeChanges(
        before as unknown as Record<string, unknown>,
        after as unknown as Record<string, unknown>,
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

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);

    return NextResponse.json(
      { error: "Unable to save settings." },
      { status: 400 }
    );
  }
}