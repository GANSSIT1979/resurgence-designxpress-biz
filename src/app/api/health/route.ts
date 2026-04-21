import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";
import { getSupportRouteStatus } from "@/lib/openai-support";
import { NextResponse } from "next/server";

export async function GET() {
  const support = getSupportRouteStatus();

  try {
    const [userCount, sponsorCount, packageCount] = await Promise.all([
      db.user.count(),
      db.sponsor.count(),
      db.sponsorPackageTemplate.count()
    ]);

    return ok({
      status: "ok",
      database: "connected",
      aiConfigured: support.apiKeyConfigured,
      support,
      counts: {
        users: userCount,
        sponsors: sponsorCount,
        packages: packageCount
      }
    });
  } catch (error) {
    console.error('[health] Database check failed.', error);
    return NextResponse.json({
      ok: false,
      status: "degraded",
      database: "unavailable",
      aiConfigured: support.apiKeyConfigured,
      support,
      counts: null,
    }, { status: 503 });
  }
}
