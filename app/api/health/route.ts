import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

export async function GET() {
  const [userCount, sponsorCount, packageCount] = await Promise.all([
    db.user.count(),
    db.sponsor.count(),
    db.sponsorPackage.count()
  ]);

  return ok({
    status: "ok",
    database: "connected",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    counts: {
      users: userCount,
      sponsors: sponsorCount,
      packages: packageCount
    }
  });
}
