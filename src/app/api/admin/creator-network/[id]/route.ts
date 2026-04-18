<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { creatorProfileSchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = creatorProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.creatorProfile.update({
      where: { id },
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
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update creator profile.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.creatorProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete creator profile.' }, { status: 400 });
  }
=======
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { parsePayload } from "@/lib/parse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const data = parsePayload(body);
  const item = await (db as any).creatorProfile.update({ where: { id }, data });
  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await (db as any).creatorProfile.delete({ where: { id } });
  return ok({ success: true });
>>>>>>> parent of d975526 (commit)
}
