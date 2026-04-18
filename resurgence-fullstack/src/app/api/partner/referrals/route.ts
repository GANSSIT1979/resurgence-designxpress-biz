import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { partnerReferralSchema } from '@/lib/validation';
import { buildPartnerReferralPayload, serializePartnerReferral } from '@/lib/partner-api';

export async function GET() {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.partnerReferral.findMany({
    where: { partnerProfileId: context.partnerProfile.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializePartnerReferral) });
}

export async function POST(request: Request) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = partnerReferralSchema.parse(await request.json());
    const payload = await buildPartnerReferralPayload(parsed, context.partnerProfile.id);
    const item = await prisma.partnerReferral.create({ data: payload });
    return NextResponse.json({ item: serializePartnerReferral(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save referral.' }, { status: 400 });
  }
}
