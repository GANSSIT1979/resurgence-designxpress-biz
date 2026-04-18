import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorProfileSchema } from '@/lib/validation';
import { logActivity, summarizeChanges } from '@/lib/audit';

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

    const before = {
      sponsorId: context.sponsorProfile.sponsorId,
      preferredPackageId: context.sponsorProfile.preferredPackageId,
      companyName: context.sponsorProfile.companyName,
      contactName: context.sponsorProfile.contactName,
      contactEmail: context.sponsorProfile.contactEmail,
      phone: context.sponsorProfile.phone,
      websiteUrl: context.sponsorProfile.websiteUrl,
      address: context.sponsorProfile.address,
      brandSummary: context.sponsorProfile.brandSummary,
      assetLink: context.sponsorProfile.assetLink,
    };

    const item = await db.sponsorProfile.update({
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

    const after = {
      sponsorId: item.sponsorId,
      preferredPackageId: item.preferredPackageId,
      companyName: item.companyName,
      contactName: item.contactName,
      contactEmail: item.contactEmail,
      phone: item.phone,
      websiteUrl: item.websiteUrl,
      address: item.address,
      brandSummary: item.brandSummary,
      assetLink: item.assetLink,
    };

    await logActivity({
      request,
      action: 'SPONSOR_PROFILE_UPDATED',
      resource: 'sponsor-profile',
      resourceId: item.id,
      targetLabel: item.companyName,
      metadata: summarizeChanges(before, after, [
        'sponsorId',
        'preferredPackageId',
        'companyName',
        'contactName',
        'contactEmail',
        'phone',
        'websiteUrl',
        'address',
        'brandSummary',
        'assetLink',
      ]),
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

