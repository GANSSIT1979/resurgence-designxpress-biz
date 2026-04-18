import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseBoolean, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.galleryMedia.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const title = String(body.title || "").trim();
  const image = String(body.image || "").trim();

  if (!title || !image) return fail("Title and image are required.", 400);

  const item = await db.galleryMedia.create({
    data: {
      title,
      caption: body.caption ? String(body.caption) : null,
      description: body.description ? String(body.description) : null,
      image,
      featured: parseBoolean(body.featured, false),
      eventId: body.eventId ? String(body.eventId) : null,
    },
  });

  return ok({ item }, 201);
}
