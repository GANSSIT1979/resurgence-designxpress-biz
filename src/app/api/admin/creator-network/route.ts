<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { creatorProfileSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = creatorProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.creatorProfile.create({
      data: {
        ...parsed.data,
        biography: parsed.data.biography || null,
        journeyStory: parsed.data.journeyStory || null,
        pointsPerGame: parsed.data.pointsPerGame ?? null,
        assistsPerGame: parsed.data.assistsPerGame ?? null,
        reboundsPerGame: parsed.data.reboundsPerGame ?? null,
        imageUrl: parsed.data.imageUrl || null,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Creator name must be unique.' }, { status: 400 });
  }
=======
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { parsePayload } from "@/lib/parse";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await (db as any).creatorProfile.findMany({
    orderBy: { createdAt: "desc" }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const data = parsePayload(body);
  const item = await (db as any).creatorProfile.create({ data });
  return ok({ item });
>>>>>>> parent of d975526 (commit)
}
