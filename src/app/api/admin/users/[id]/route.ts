import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminUserUpdateSchema } from '@/lib/validation';
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = adminUserUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid user payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.user.update({
      where: { id },
      data: {
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        title: parsed.data.title || null,
        role: parsed.data.role,
        isActive: parsed.data.isActive,
        ...(parsed.data.password ? { password: hashPassword(parsed.data.password) } : {}),
      },
    });
    return NextResponse.json({ item: serializeUser(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to update user.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete user.' }, { status: 400 });
  }
}
