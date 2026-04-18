import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorProfileSchema } from '@/lib/validation';

export async function GET() {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    item: {
      ...context.sponsorProfile,
      phone: context.sponsorProfile.phone ?? null,
      websiteUrl: context.sponsorProfile.websiteUrl ?? null,
      address: context.sponsorProfile.address ?? null,
      brandSummary: context.sponsorProfile.brandSummary ?? null,
      assetLink: context.sponsorProfile.assetLink ?? null,
    },
  });
}

export async function PUT(request: Request) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = sponsorProfileSchema.parse(await request.json());
    const item = await prisma.sponsorProfile.update({
      where: { id: context.sponsorProfile.id },
      data: {
        sponsorId: parsed.sponsorId || null,
        preferredPackageId: parsed.preferredPackageId || null,
        companyName: parsed.companyName,
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail,
        phone: parsed.phone || null,
        websiteUrl: parsed.websiteUrl || null,
        address: parsed.address || null,
        brandSummary: parsed.brandSummary || null,
        assetLink: parsed.assetLink || null,
      },
      include: {
        sponsor: true,
        preferredPackage: true,
      },
    });

    return NextResponse.json({
      item: {
        ...item,
        phone: item.phone ?? null,
        websiteUrl: item.websiteUrl ?? null,
        address: item.address ?? null,
        brandSummary: item.brandSummary ?? null,
        assetLink: item.assetLink ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to update sponsor profile.' }, { status: 400 });
  }
}
