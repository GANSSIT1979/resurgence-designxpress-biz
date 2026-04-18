import { NextRequest } from 'next/server';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createWorkflowAutomation } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { getPublicSettings } from '@/lib/settings';

const schema = z.object({
  conversationId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  organization: z.string().max(160).optional().or(z.literal('')),
  email: z.string().email(),
  mobile: z.string().min(7).max(40),
  summary: z.string().min(5).max(2000)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || 'Invalid lead payload' }, { status: 400 });
  }

  const { conversationId, fullName, organization, email, mobile, summary } = parsed.data;
  const [settings, inquiry] = await Promise.all([
    getPublicSettings(),
    prisma.inquiry.create({
      data: {
        name: fullName,
        organization: organization || null,
        email,
        phone: mobile,
        inquiryType: 'AI Support Lead',
        message: `${summary}\n\nConversation ID: ${conversationId}`,
        status: 'NEW',
      },
    }),
  ]);

  await createWorkflowAutomation({
    notifications: [
      {
        recipientRole: 'SYSTEM_ADMIN',
        title: `New AI support lead: ${fullName}`,
        message: `${organization || 'Independent contact'} submitted business details through the support desk.`,
        level: 'SUCCESS',
        href: '/admin/inquiries',
        metadata: { inquiryId: inquiry.id, conversationId },
      },
      {
        recipientRole: 'STAFF',
        title: 'AI support lead ready for follow-up',
        message: `${fullName} is waiting for a business response from RESURGENCE.`,
        level: 'WARNING',
        href: '/staff/inquiries',
        metadata: { inquiryId: inquiry.id, conversationId },
      },
    ],
    emails: [
      {
        recipientRole: 'SYSTEM_ADMIN',
        toEmail: process.env.ADMIN_EMAIL || settings.contactEmail,
        subject: `New ${settings.brandName} AI lead: ${fullName}`,
        bodyText: `Conversation ID: ${conversationId}\nName: ${fullName}\nOrganization: ${organization || 'N/A'}\nEmail: ${email}\nMobile: ${mobile}\n\nSummary:\n${summary}`,
        eventKey: 'support.lead.admin',
        relatedType: 'Inquiry',
        relatedId: inquiry.id,
      },
      {
        toEmail: email,
        toName: fullName,
        subject: `We received your ${settings.brandName} support details`,
        bodyText: `Hi ${fullName},\n\nThanks for sharing your business details with ${settings.brandName}. Our team at ${settings.companyName} has your inquiry and will follow up using the contact information you provided.`,
        eventKey: 'support.lead.contact',
        relatedType: 'Inquiry',
        relatedId: inquiry.id,
      },
    ],
  });

  return NextResponse.json({
    ok: true,
    leadCaptured: true,
    conversationId,
    lead: {
      visitorName: fullName,
      organization: organization || null,
      email,
      mobile,
      summary,
    },
  });
}
