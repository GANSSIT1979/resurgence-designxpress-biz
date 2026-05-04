import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWorkflowAutomation } from '@/lib/notifications';

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let payload: {
      eventSlug?: string;
      companyName: string;
      contactName: string;
      email: string;
      phone?: string;
      websiteUrl?: string;
      category: string;
      interestedPackage: string;
      budgetRange: string;
      timeline?: string;
      message: string;
    };

    if (contentType.includes('application/json')) {
      const body = await request.json();

      payload = {
        eventSlug: String(body.eventSlug || '').trim(),
        companyName: String(body.companyName || '').trim(),
        contactName: String(body.contactName || '').trim(),
        email: String(body.email || '').trim(),
        phone: String(body.phone || '').trim(),
        websiteUrl: String(body.websiteUrl || '').trim(),
        category: String(body.category || 'Events Sponsorship').trim(),
        interestedPackage: String(body.interestedPackage || 'General Sponsorship').trim(),
        budgetRange: String(body.budgetRange || 'To be discussed').trim(),
        timeline: String(body.timeline || '').trim(),
        message: String(body.message || '').trim(),
      };
    } else {
      const formData = await request.formData();

      payload = {
        eventSlug: readFormValue(formData, 'eventSlug'),
        companyName: readFormValue(formData, 'companyName'),
        contactName: readFormValue(formData, 'contactName'),
        email: readFormValue(formData, 'email'),
        phone: readFormValue(formData, 'phone'),
        websiteUrl: readFormValue(formData, 'websiteUrl'),
        category: readFormValue(formData, 'category') || 'Events Sponsorship',
        interestedPackage:
          readFormValue(formData, 'interestedPackage') || 'General Sponsorship',
        budgetRange: readFormValue(formData, 'budgetRange') || 'To be discussed',
        timeline: readFormValue(formData, 'timeline'),
        message: readFormValue(formData, 'message'),
      };
    }

    if (!payload.companyName || !payload.contactName || !payload.email) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Company name, contact name, and email are required.',
        },
        { status: 400 },
      );
    }

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
        message:
          payload.message ||
          `Sponsor application submitted from event: ${payload.eventSlug || 'N/A'}`,
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

    const redirectUrl = new URL('/sponsors/thank-you', request.url);
    redirectUrl.searchParams.set('id', item.id);

    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error('[sponsor-submit] failed', error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to submit sponsor application.',
      },
      { status: 500 },
    );
  }
}
