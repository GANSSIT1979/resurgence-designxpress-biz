import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity, summarizeChanges } from "@/lib/audit";

function toNullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  }
  return false;
}

function buildSocialLinksJson(body: Record<string, unknown>) {
  const items = [
    { label: "Facebook", url: toNullableString(body.facebookPage) },
    { label: "TikTok", url: toNullableString(body.tiktokPage) },
    { label: "Instagram", url: toNullableString(body.instagramPage) },
    { label: "YouTube", url: toNullableString(body.youtubePage) },
  ].filter((item) => item.url);

  return JSON.stringify(items);
}

function serializeCreator(item: any) {
  return {
    ...item,
    createdAt: item.createdAt?.toISOString?.() ?? null,
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.creatorProfile.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Creator profile not found." }, { status: 404 });
    }

    return NextResponse.json({ item: serializeCreator(item) });
  } catch (error) {
    console.error("GET /api/admin/creator-network/[id] error:", error);
    return NextResponse.json({ error: "Unable to load creator profile." }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const before = await db.creatorProfile.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json({ error: "Creator profile not found." }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid creator payload." }, { status: 400 });
    }

    const fullName = toNullableString(body.fullName);
    const slug = toNullableString(body.slug);
    if (!fullName || !slug) {
      return NextResponse.json({ error: "Full name and slug are required." }, { status: 400 });
    }

    const item = await db.creatorProfile.update({
      where: { id },
      data: {
        fullName,
        slug,
        image: toNullableString(body.image),
        biography: toNullableString(body.biography),
        journeyStory: toNullableString(body.journeyStory),
        featured: toBoolean(body.featured),
        pointsPerGame: toNullableNumber(body.pointsPerGame),
        assistsPerGame: toNullableNumber(body.assistsPerGame),
        reboundsPerGame: toNullableNumber(body.reboundsPerGame),
        contactNumber: toNullableString(body.contactNumber),
        address: toNullableString(body.address),
        dateOfBirth: toNullableString(body.dateOfBirth),
        jobDescription: toNullableString(body.jobDescription),
        position: toNullableString(body.position),
        height: toNullableString(body.height),
        facebookPage: toNullableString(body.facebookPage),
        facebookFollowers: toNullableString(body.facebookFollowers),
        tiktokPage: toNullableString(body.tiktokPage),
        tiktokFollowers: toNullableString(body.tiktokFollowers),
        instagramPage: toNullableString(body.instagramPage),
        instagramFollowers: toNullableString(body.instagramFollowers),
        youtubePage: toNullableString(body.youtubePage),
        youtubeFollowers: toNullableString(body.youtubeFollowers),
        trendingVideoUrl: toNullableString(body.trendingVideoUrl),
        socialLinks: buildSocialLinksJson(body),
      } as any,
    });

    try {
      await logActivity({
        request,
        action: "CREATOR_PROFILE_UPDATED",
        resource: "creator-profile",
        resourceId: item.id,
        targetLabel: item.fullName,
        metadata: summarizeChanges(
          before as unknown as Record<string, unknown>,
          item as unknown as Record<string, unknown>,
          [
            "fullName",
            "slug",
            "image",
            "biography",
            "journeyStory",
            "featured",
            "pointsPerGame",
            "assistsPerGame",
            "reboundsPerGame",
            "contactNumber",
            "address",
            "dateOfBirth",
            "jobDescription",
            "position",
            "height",
            "facebookPage",
            "facebookFollowers",
            "tiktokPage",
            "tiktokFollowers",
            "instagramPage",
            "instagramFollowers",
            "youtubePage",
            "youtubeFollowers",
            "trendingVideoUrl",
          ]
        ),
      });
    } catch (auditError) {
      console.error("Creator update audit failed:", auditError);
    }

    return NextResponse.json({ item: serializeCreator(item) });
  } catch (error) {
    console.error("PUT /api/admin/creator-network/[id] error:", error);
    return NextResponse.json({ error: "Unable to update creator profile." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const before = await db.creatorProfile.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json({ error: "Creator profile not found." }, { status: 404 });
    }

    await db.creatorProfile.delete({ where: { id } });

    try {
      await logActivity({
        request,
        action: "CREATOR_PROFILE_DELETED",
        resource: "creator-profile",
        resourceId: before.id,
        targetLabel: before.fullName,
        metadata: {
          slug: before.slug,
        },
      });
    } catch (auditError) {
      console.error("Creator delete audit failed:", auditError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/creator-network/[id] error:", error);
    return NextResponse.json({ error: "Unable to delete creator profile." }, { status: 400 });
  }
}
