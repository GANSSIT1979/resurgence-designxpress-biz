import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const submission = await prisma.sponsorSubmission.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        interestedPackage: body.interestedPackage || 'Custom',
        category: 'DAYO Series',
        budgetRange: 'To be discussed',
        message: body.message || '',
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
