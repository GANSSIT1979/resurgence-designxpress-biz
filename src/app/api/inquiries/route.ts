import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWorkflowAutomation } from '@/lib/notifications';
import { inquirySchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Please complete all required inquiry fields.' }, { status: 400 });
  }

  const item = await prisma.inquiry.create({ data: parsed.data });
  await createWorkflowAutomation({
    notifications: [
      {
        recipientRole: 'SYSTEM_ADMIN',
        title: `New inquiry from ${item.name}`,
        message: `${item.inquiryType} inquiry submitted by ${item.email}.`,
        level: 'INFO',
        href: '/admin/inquiries',
        metadata: { inquiryId: item.id },
      },
      {
        recipientRole: 'STAFF',
        title: `Inquiry ready for follow-up`,
        message: `${item.name} from ${item.organization || 'an independent brand'} is waiting for response.`,
        level: 'WARNING',
        href: '/staff/inquiries',
        metadata: { inquiryId: item.id },
      },
    ],
    emails: [
      {
        recipientRole: 'SYSTEM_ADMIN',
        toEmail: process.env.ADMIN_EMAIL || 'admin@resurgence.local',
        subject: `RESURGENCE inquiry: ${item.inquiryType}`,
        bodyText: `${item.name} (${item.email}) submitted a new inquiry.\n\nMessage:\n${item.message}`,
        eventKey: 'inquiry.created.admin',
        relatedType: 'Inquiry',
        relatedId: item.id,
      },
      {
        toEmail: item.email,
        toName: item.name,
        subject: 'We received your RESURGENCE inquiry',
        bodyText: `Hi ${item.name},\n\nThanks for reaching out to RESURGENCE Powered by DesignXpress. Our team has received your inquiry and will follow up soon.`,
        eventKey: 'inquiry.created.contact',
        relatedType: 'Inquiry',
        relatedId: item.id,
      },
    ],
  });

  return NextResponse.json({ success: true, item }, { status: 201 });
}
