import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pageContentSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = pageContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.pageContent.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Content key must be unique.' }, { status: 400 });
  }
}
