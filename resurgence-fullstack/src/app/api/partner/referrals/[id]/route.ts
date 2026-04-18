import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { partnerReferralSchema } from '@/lib/validation';
import { buildPartnerReferralPayload, serializePartnerReferral } from '@/lib/partner-api';

async function getOwnedRecord(id: string, partnerProfileId: string) {
  return prisma.partnerReferral.findFirst({ where: { id, partnerProfileId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.partnerProfile.id);
    if (!existing) return NextResponse.json({ error: 'Referral not found.' }, { status: 404 });

    const parsed = partnerReferralSchema.parse(await request.json());
    const item = await prisma.partnerReferral.update({
      where: { id },
      data: await buildPartnerReferralPayload(parsed, context.partnerProfile.id),
    });
    return NextResponse.json({ item: serializePartnerReferral(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update referral.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.partnerProfile.id);
    if (!existing) return NextResponse.json({ error: 'Referral not found.' }, { status: 404 });

    await prisma.partnerReferral.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete referral.' }, { status: 400 });
  }
}
