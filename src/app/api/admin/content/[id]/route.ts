import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { pageContentSchema } from '@/lib/validation';
import { logActivity, summarizeChanges } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = pageContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 });
  }

  try {
    const before = await db.pageContent.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    const item = await db.pageContent.update({ where: { id }, data: parsed.data });

    await logActivity({
      request,
      action: 'CONTENT_UPDATED',
      resource: 'page-content',
      resourceId: item.id,
      targetLabel: item.key,
      metadata: summarizeChanges(before as unknown as Record<string, unknown>, item as unknown as Record<string, unknown>, [
        'key',
        'title',
        'subtitle',
        'body',
        'ctaLabel',
        'ctaHref',
      ]),
    });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update content.' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const before = await db.pageContent.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    await db.pageContent.delete({ where: { id } });

    await logActivity({
      request,
      action: 'CONTENT_DELETED',
      resource: 'page-content',
      resourceId: before.id,
      targetLabel: before.key,
      metadata: {
        key: before.key,
        title: before.title,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete content.' }, { status: 400 });
  }
}

