import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { partnerCampaignSchema } from '@/lib/validation';
import { buildPartnerCampaignPayload, serializePartnerCampaign } from '@/lib/partner-api';

export async function GET() {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.partnerCampaign.findMany({
    where: { partnerProfileId: context.partnerProfile.id },
    orderBy: [{ status: 'asc' }, { startDate: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializePartnerCampaign) });
}

export async function POST(request: Request) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = partnerCampaignSchema.parse(await request.json());
    const payload = await buildPartnerCampaignPayload(parsed, context.partnerProfile.id);
    const item = await prisma.partnerCampaign.create({ data: payload });
    return NextResponse.json({ item: serializePartnerCampaign(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save campaign.' }, { status: 400 });
  }
}
