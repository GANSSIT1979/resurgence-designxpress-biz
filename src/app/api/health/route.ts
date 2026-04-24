import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";
import { getSupportRouteStatus } from "@/lib/openai-support";
import { formatPrismaSchemaDrift } from "@/lib/prisma-schema-health";
import { NextResponse } from "next/server";

async function runSchemaChecks() {
  const probes = [
    {
      scope: "content-post analytics column probe failed",
      query: db.contentPost.findFirst({
        select: {
          id: true,
          title: true,
          slug: true,
          lastCommentedAt: true,
          viewCount: true,
          uniqueViewCount: true,
          watchTimeSeconds: true,
          completedViewCount: true,
          avgWatchTimeSeconds: true,
          completionRate: true,
          firstViewedAt: true,
          lastViewedAt: true,
          metadataJson: true,
        },
      }),
    },
    {
      scope: "post-comment moderation probe failed",
      query: db.postComment.findFirst({
        select: {
          id: true,
          bodyPlain: true,
          status: true,
          visibility: true,
          isPinned: true,
          isEdited: true,
          likeCount: true,
          replyCount: true,
          sortOrder: true,
          moderationReason: true,
          moderationNotes: true,
          moderatedById: true,
          moderatedAt: true,
          editedAt: true,
          deletedAt: true,
          publishedAt: true,
        },
      }),
    },
    {
      scope: "content-post analytics-day table probe failed",
      query: db.contentPostAnalyticsDay.findFirst({
        select: {
          id: true,
          contentPostId: true,
          creatorProfileId: true,
          date: true,
          viewCount: true,
        },
      }),
    },
    {
      scope: "creator analytics-day table probe failed",
      query: db.creatorAnalyticsDay.findFirst({
        select: {
          id: true,
          creatorProfileId: true,
          date: true,
          viewCount: true,
        },
      }),
    },
    {
      scope: "content-post view-session table probe failed",
      query: db.contentPostViewSession.findFirst({
        select: {
          id: true,
          contentPostId: true,
          viewerSessionKey: true,
          watchTimeSeconds: true,
        },
      }),
    },
    {
      scope: "media-asset cloudflare probe failed",
      query: db.mediaAsset.findFirst({
        select: {
          id: true,
          originalFileName: true,
          storageProvider: true,
          storageKey: true,
        },
      }),
    },
    {
      scope: "notification actor probe failed",
      query: db.platformNotification.findFirst({ select: { id: true, actorUserId: true } }),
    },
  ] as const;

  const checks = await Promise.allSettled(probes.map((probe) => probe.query));

  const issues = checks.flatMap((result, index) => {
    if (result.status === "fulfilled") return [];

    return [
      formatPrismaSchemaDrift(
        probes[index]?.scope ?? "schema probe failed",
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
