import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sponsorPackageTemplateSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = sponsorPackageTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.sponsorPackageTemplate.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Package template name must be unique.' }, { status: 400 });
  }
}
