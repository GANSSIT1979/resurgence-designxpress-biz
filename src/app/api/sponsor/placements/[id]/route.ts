import { NextResponse } from 'next/server';
import { cancelSponsorPlacement, updateSponsorPlacement } from '@/lib/sponsor-placements';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const result = await updateSponsorPlacement(context.sponsorProfile, id, payload);
    if ('error' in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    return NextResponse.json({ item: result.item });
  } catch {
    return NextResponse.json({ error: 'Unable to update feed placement request.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const result = await cancelSponsorPlacement(context.sponsorProfile.id, id);
    if ('error' in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    return NextResponse.json({ item: result.item });
  } catch {
    return NextResponse.json({ error: 'Unable to cancel feed placement request.' }, { status: 400 });
  }
}
