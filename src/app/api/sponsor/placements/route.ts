import { NextRequest, NextResponse } from 'next/server';
import { createSponsorPlacement, listSponsorPlacements } from '@/lib/sponsor-placements';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export async function GET(_: NextRequest) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const items = await listSponsorPlacements(context.sponsorProfile.id);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Unable to load feed placement requests.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await request.json().catch(() => null);
    const result = await createSponsorPlacement(context.sponsorProfile, payload);
    if ('error' in result && result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ item: result.item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create feed placement request.' }, { status: 400 });
  }
}
