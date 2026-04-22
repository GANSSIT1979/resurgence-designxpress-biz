import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";
import { getSupportRouteStatus } from "@/lib/openai-support";
import { formatPrismaSchemaDrift } from "@/lib/prisma-schema-health";
import { NextResponse } from "next/server";

async function runSchemaChecks() {
  const checks = await Promise.allSettled([
    db.contentPost.findFirst({ select: { id: true } }),
    db.platformNotification.findFirst({ select: { id: true, actorUserId: true } }),
  ]);

  const issues = checks.flatMap((result, index) => {
    if (result.status === "fulfilled") return [];

    return [
      formatPrismaSchemaDrift(
        index === 0 ? "content-post probe failed" : "notification actor probe failed",
        result.reason,
      ),
    ];
  });

  return {
    status: issues.length ? "schema-mismatch" : "ok",
    issues,
  };
}

export async function GET() {
  const support = getSupportRouteStatus();

  try {
    const [userCount, sponsorCount, packageCount, schema] = await Promise.all([
      db.user.count(),
      db.sponsor.count(),
      db.sponsorPackageTemplate.count(),
      runSchemaChecks(),
    ]);

    if (schema.issues.length) {
      return NextResponse.json({
        ok: false,
        status: "degraded",
        database: "schema-mismatch",
        aiConfigured: support.apiKeyConfigured,
        support,
        counts: {
          users: userCount,
          sponsors: sponsorCount,
          packages: packageCount,
        },
        schema,
      }, { status: 503 });
    }

    return ok({
      status: "ok",
      database: "connected",
      aiConfigured: support.apiKeyConfigured,
      support,
      schema,
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
      schema: {
        status: "unchecked",
        issues: [],
      },
      counts: null,
    }, { status: 503 });
  }
}
