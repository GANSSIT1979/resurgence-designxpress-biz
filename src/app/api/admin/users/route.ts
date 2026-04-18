<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminUserSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/passwords';

function serializeUser(item: {
  id: string;
  email: string;
  displayName: string;
  title: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: item.id,
    email: item.email,
    displayName: item.displayName,
    title: item.title,
    role: item.role,
    isActive: item.isActive,
    lastLoginAt: item.lastLoginAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid user payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.user.create({
      data: {
        ...parsed.data,
        password: hashPassword(parsed.data.password),
      },
    });
    return NextResponse.json({ item: serializeUser(item) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Email must be unique.' }, { status: 400 });
  }
=======
import { NextRequest } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      sponsorId: true,
      partnerId: true,
      createdAt: true
    }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const passwordHash = await hashPassword(body.password || "ChangeMe123!");

  const item = await db.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
      status: body.status || UserStatus.ACTIVE,
      sponsorId: body.sponsorId || null,
      partnerId: body.partnerId || null
    }
  });

  return ok({ item });
>>>>>>> parent of d975526 (commit)
}
