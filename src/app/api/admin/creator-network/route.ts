import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/audit";

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

export async function GET() {
  try {
    const items = await db.creatorProfile.findMany({
      orderBy: [{ featured: "desc" }, { fullName: "asc" }],
    });

    return NextResponse.json({ items: items.map(serializeCreator) });
  } catch (error) {
    console.error("GET /api/admin/creator-network error:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (!body) {
      return NextResponse.json({ error: "Invalid creator payload." }, { status: 400 });
    }

    const fullName = toNullableString(body.fullName);
    const slug = toNullableString(body.slug);
    if (!fullName || !slug) {
      return NextResponse.json({ error: "Full name and slug are required." }, { status: 400 });
    }

    const item = await db.creatorProfile.create({
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
        action: "CREATOR_PROFILE_CREATED",
        resource: "creator-profile",
        resourceId: item.id,
        targetLabel: item.fullName,
        metadata: {
          slug: item.slug,
          featured: item.featured,
          position: (item as any).position || null,
        },
      });
    } catch (auditError) {
      console.error("Creator create audit failed:", auditError);
    }

    return NextResponse.json({ item: serializeCreator(item) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/creator-network error:", error);
    return NextResponse.json({ error: "Unable to create creator profile." }, { status: 400 });
  }
}
