import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { pageContentSchema } from '@/lib/validation';
import { logActivity } from '@/lib/audit';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = pageContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 });
  }

  try {
    const item = await db.pageContent.create({ data: parsed.data });

    await logActivity({
      request,
      action: 'CONTENT_CREATED',
      resource: 'page-content',
      resourceId: item.id,
      targetLabel: item.key,
      metadata: {
        key: item.key,
        title: item.title,
        subtitle: item.subtitle,
        ctaLabel: item.ctaLabel,
        ctaHref: item.ctaHref,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Content key must be unique.' }, { status: 400 });
  }
}

