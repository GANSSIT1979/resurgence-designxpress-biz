import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorSubmissionSchema } from '@/lib/validation';

function serializeSubmission(item: Awaited<ReturnType<typeof prisma.sponsorSubmission.findFirstOrThrow>>) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    phone: item.phone ?? null,
    websiteUrl: item.websiteUrl ?? null,
    timeline: item.timeline ?? null,
    internalNotes: item.internalNotes ?? null,
  };
}

export async function GET(_: NextRequest) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.sponsorSubmission.findMany({
    where: { sponsorProfileId: context.sponsorProfile.id },
    orderBy: [{ createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializeSubmission) });
}

export async function POST(request: Request) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = sponsorSubmissionSchema.parse(await request.json());
    const item = await prisma.sponsorSubmission.create({
      data: {
        sponsorProfileId: context.sponsorProfile.id,
        companyName: parsed.companyName,
        contactName: parsed.contactName,
        email: parsed.email,
        phone: parsed.phone || null,
        websiteUrl: parsed.websiteUrl || null,
        category: parsed.category,
        interestedPackage: parsed.interestedPackage,
        budgetRange: parsed.budgetRange,
        timeline: parsed.timeline || null,
        message: parsed.message,
      },
    });

    return NextResponse.json({ item: serializeSubmission(item) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create sponsor application.' }, { status: 400 });
  }
}
