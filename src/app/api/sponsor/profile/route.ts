import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorProfileSchema } from '@/lib/validation';

function serializeProfile(item: Awaited<ReturnType<typeof prisma.sponsorProfile.findFirstOrThrow>>) {
  return {
    ...item,
    sponsorId: item.sponsorId ?? null,
    preferredPackageId: item.preferredPackageId ?? null,
    phone: item.phone ?? null,
    websiteUrl: item.websiteUrl ?? null,
    address: item.address ?? null,
    brandSummary: item.brandSummary ?? null,
    assetLink: item.assetLink ?? null,
  };
}

export async function GET() {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ item: serializeProfile(context.sponsorProfile) });
}

export async function PUT(request: Request) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = sponsorProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid sponsor profile payload.' }, { status: 400 });

  const item = await prisma.sponsorProfile.update({
    where: { id: context.sponsorProfile.id },
    data: {
      sponsorId: parsed.data.sponsorId || null,
      preferredPackageId: parsed.data.preferredPackageId || null,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      phone: parsed.data.phone || null,
      websiteUrl: parsed.data.websiteUrl || null,
      address: parsed.data.address || null,
      brandSummary: parsed.data.brandSummary || null,
      assetLink: parsed.data.assetLink || null,
    },
  });

  return NextResponse.json({ item: serializeProfile(item) });
}
