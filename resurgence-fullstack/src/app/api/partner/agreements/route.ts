import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { partnerAgreementSchema } from '@/lib/validation';
import { buildPartnerAgreementPayload, serializePartnerAgreement } from '@/lib/partner-api';

export async function GET() {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.partnerAgreement.findMany({
    where: { partnerProfileId: context.partnerProfile.id },
    orderBy: [{ status: 'asc' }, { startDate: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializePartnerAgreement) });
}

export async function POST(request: Request) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = partnerAgreementSchema.parse(await request.json());
    const payload = await buildPartnerAgreementPayload(parsed, context.partnerProfile.id);
    const item = await prisma.partnerAgreement.create({ data: payload });
    return NextResponse.json({ item: serializePartnerAgreement(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save agreement.' }, { status: 400 });
  }
}
