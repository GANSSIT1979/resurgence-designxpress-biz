import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sponsorSubmissionSchema } from '@/lib/validation';

export async function GET() {
  const items = await prisma.sponsorSubmission.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const payload = sponsorSubmissionSchema.parse(await request.json());
    const item = await prisma.sponsorSubmission.create({
      data: {
        companyName: payload.companyName,
        contactName: payload.contactName,
        email: payload.email,
        phone: payload.phone || null,
        websiteUrl: payload.websiteUrl || null,
        category: payload.category,
        interestedPackage: payload.interestedPackage,
        budgetRange: payload.budgetRange,
        timeline: payload.timeline || null,
        message: payload.message,
      },
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
