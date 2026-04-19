import { NextResponse } from 'next/server';
import { updateAdminFeedPost } from '@/lib/admin-feed-moderation';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const result = await updateAdminFeedPost(id, payload);
    if ('error' in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    return NextResponse.json({ item: result.item });
  } catch {
    return NextResponse.json({ error: 'Unable to moderate feed post.' }, { status: 400 });
  }
}
