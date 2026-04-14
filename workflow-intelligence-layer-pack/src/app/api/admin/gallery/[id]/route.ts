import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseBoolean, requireApiRole } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const item = await db.galleryMedia.findUnique({ where: { id } });
  if (!item) return fail("Gallery item not found.", 404);

  return ok({ item });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const item = await db.galleryMedia.update({
    where: { id },
    data: {
      title: body.title ? String(body.title) : undefined,
      caption: body.caption === null ? null : body.caption ? String(body.caption) : undefined,
      description: body.description === null ? null : body.description ? String(body.description) : undefined,
      image: body.image ? String(body.image) : undefined,
      featured: body.featured === undefined ? undefined : parseBoolean(body.featured, false),
      eventId: body.eventId === null ? null : body.eventId ? String(body.eventId) : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.galleryMedia.delete({ where: { id } });

  return ok({ deleted: true });
}
