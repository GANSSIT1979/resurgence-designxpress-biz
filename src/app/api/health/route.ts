import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";
import { getSupportRouteStatus } from "@/lib/openai-support";

export async function GET() {
  const [userCount, sponsorCount, packageCount] = await Promise.all([
    db.user.count(),
    db.sponsor.count(),
    db.sponsorPackageTemplate.count()
  ]);
  const support = getSupportRouteStatus();

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
}
