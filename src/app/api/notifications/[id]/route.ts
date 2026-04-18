import { NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/notifications';
import { getCurrentSessionUser } from '@/lib/session-server';

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSessionUser();
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const item = await markNotificationAsRead(id, context.user.role, context.user.id);

  if (!item) {
    return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      readAt: item.readAt?.toISOString() ?? null,
    },
  });
}

