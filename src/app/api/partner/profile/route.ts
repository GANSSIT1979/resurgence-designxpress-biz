import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { partnerProfileSchema } from '@/lib/validation';

export async function GET() {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    item: {
      ...context.partnerProfile,
      phone: context.partnerProfile.phone ?? null,
      websiteUrl: context.partnerProfile.websiteUrl ?? null,
      address: context.partnerProfile.address ?? null,
      companySummary: context.partnerProfile.companySummary ?? null,
      assetLink: context.partnerProfile.assetLink ?? null,
      preferredServices: context.partnerProfile.preferredServices ?? null,
    },
  });
}

export async function PUT(request: Request) {
  const context = await getCurrentPartnerContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = partnerProfileSchema.parse(await request.json());
    const item = await prisma.partnerProfile.update({
      where: { id: context.partnerProfile.id },
      data: {
        partnerId: parsed.partnerId || null,
        companyName: parsed.companyName,
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail,
        phone: parsed.phone || null,
        websiteUrl: parsed.websiteUrl || null,
        address: parsed.address || null,
        companySummary: parsed.companySummary || null,
        assetLink: parsed.assetLink || null,
        preferredServices: parsed.preferredServices || null,
      },
      include: { partner: true },
    });

    return NextResponse.json({
      item: {
        ...item,
        phone: item.phone ?? null,
        websiteUrl: item.websiteUrl ?? null,
        address: item.address ?? null,
        companySummary: item.companySummary ?? null,
        assetLink: item.assetLink ?? null,
        preferredServices: item.preferredServices ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to update partner profile.' }, { status: 400 });
  }
}
