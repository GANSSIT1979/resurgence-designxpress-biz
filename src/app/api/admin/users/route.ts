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
}
