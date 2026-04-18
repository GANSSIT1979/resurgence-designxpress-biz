<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pageContentSchema } from '@/lib/validation';
=======
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { parsePayload } from "@/lib/parse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;
>>>>>>> parent of d975526 (commit)

  const { id } = await params;
<<<<<<< HEAD
  const body = await request.json().catch(() => null);
  const parsed = pageContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.pageContent.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update content.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.pageContent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete content.' }, { status: 400 });
  }
=======
  const body = await request.json();
  const data = parsePayload(body);
  const item = await (db as any).contentSection.update({ where: { id }, data });
  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await (db as any).contentSection.delete({ where: { id } });
  return ok({ success: true });
>>>>>>> parent of d975526 (commit)
}
