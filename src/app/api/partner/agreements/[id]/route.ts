import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { partnerAgreementSchema } from '@/lib/validation';
import { buildPartnerAgreementPayload, serializePartnerAgreement } from '@/lib/partner-api';

async function getOwnedRecord(id: string, partnerProfileId: string) {
  return prisma.partnerAgreement.findFirst({ where: { id, partnerProfileId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.partnerProfile.id);
    if (!existing) return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 });

    const parsed = partnerAgreementSchema.parse(await request.json());
    const item = await prisma.partnerAgreement.update({
      where: { id },
      data: await buildPartnerAgreementPayload(parsed, context.partnerProfile.id),
    });
    return NextResponse.json({ item: serializePartnerAgreement(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update agreement.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.partnerProfile.id);
    if (!existing) return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 });

    await prisma.partnerAgreement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete agreement.' }, { status: 400 });
  }
}
