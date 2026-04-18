import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWorkflowAutomation } from '@/lib/notifications';
import { sponsorSubmissionSchema } from '@/lib/validation';

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

    await createWorkflowAutomation({
      notifications: [
        {
          recipientRole: 'SYSTEM_ADMIN',
          title: `New sponsor submission: ${item.companyName}`,
          message: `${item.contactName} requested the ${item.interestedPackage} package.`,
          level: 'SUCCESS',
          href: '/admin/sponsor-submissions',
          metadata: { sponsorSubmissionId: item.id },
        },
        {
          recipientRole: 'STAFF',
          title: 'Sponsor submission needs review',
          message: `${item.companyName} entered the sponsorship pipeline at ${item.budgetRange}.`,
          level: 'WARNING',
          href: '/staff/inquiries',
          metadata: { sponsorSubmissionId: item.id },
        },
      ],
      emails: [
        {
          recipientRole: 'SYSTEM_ADMIN',
          toEmail: process.env.ADMIN_EMAIL || 'admin@resurgence.local',
          subject: `New sponsor submission from ${item.companyName}`,
          bodyText: `${item.contactName} submitted a sponsorship application for ${item.interestedPackage}.\n\nMessage:\n${item.message}`,
          eventKey: 'sponsor-submission.created.admin',
          relatedType: 'SponsorSubmission',
          relatedId: item.id,
        },
        {
          toEmail: item.email,
          toName: item.contactName,
          subject: 'Your RESURGENCE sponsorship submission is in review',
          bodyText: `Hi ${item.contactName},\n\nThanks for your interest in partnering with RESURGENCE Powered by DesignXpress. We received your submission for ${item.interestedPackage} and our team will follow up with next steps.`,
          eventKey: 'sponsor-submission.created.contact',
          relatedType: 'SponsorSubmission',
          relatedId: item.id,
        },
      ],
    });

    return NextResponse.json({ ok: true, itemId: item.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
