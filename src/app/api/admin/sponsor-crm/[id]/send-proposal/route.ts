import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://www.resurgence-dx.biz'
  );
}

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

async function sendViaResend(input: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'RESURGENCE x DesignXpress <onboarding@resend.dev>';

  if (!apiKey) {
    return { sent: false, response: 'RESEND_API_KEY not configured. Email queued only.' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  const body = await response.text();
  return { sent: response.ok, response: body };
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const submission = await prisma.sponsorSubmission.findUnique({ where: { id } });
    if (!submission) {
      return NextResponse.json({ error: 'Sponsor submission not found' }, { status: 404 });
    }

    const baseUrl = getBaseUrl();
    const proposalUrl = `${baseUrl}/admin/sponsor-crm/proposal/${submission.id}`;
    const whatsappText = encodeURIComponent(
      `Hi ${submission.contactName}, your DAYO Series sponsorship proposal for ${submission.companyName} is ready: ${proposalUrl}`,
    );
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
    const subject = `DAYO Series Sponsorship Proposal for ${submission.companyName}`;
    const text = `Hi ${submission.contactName},\n\nThank you for your interest in DAYO Series OFW All-Star 2026. Your sponsorship proposal is ready here:\n${proposalUrl}\n\nYou can also share it through WhatsApp:\n${whatsappUrl}\n\nRESURGENCE x DesignXpress`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>DAYO Series Sponsorship Proposal</h1>
        <p>Hi ${submission.contactName},</p>
        <p>Thank you for your interest in <strong>DAYO Series OFW All-Star 2026</strong>.</p>
        <p>Your proposal for <strong>${submission.companyName}</strong> is ready.</p>
        <p><a href="${proposalUrl}" style="display:inline-block;background:#D4AF37;color:#0B0E14;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:800">View Proposal</a></p>
        <p><a href="${whatsappUrl}">Share via WhatsApp</a></p>
        <p>RESURGENCE x DesignXpress</p>
      </div>
    `;

    const emailResult = await sendViaResend({ to: submission.email, subject, html, text });

    await prisma.automatedEmail.create({
      data: {
        toEmail: submission.email,
        toName: submission.contactName,
        subject,
        bodyText: text,
        bodyHtml: html,
        eventKey: 'SPONSOR_PROPOSAL_SENT',
        relatedType: 'SponsorSubmission',
        relatedId: submission.id,
        status: emailResult.sent ? 'SENT' : 'QUEUED',
        deliveryResponse: emailResult.response,
        sentAt: emailResult.sent ? new Date() : null,
      },
    });

    await prisma.sponsorSubmission.update({
      where: { id: submission.id },
      data: {
        internalNotes: [
          submission.internalNotes,
          `Proposal email ${emailResult.sent ? 'sent' : 'queued'}: ${new Date().toISOString()}`,
          `Proposal URL: ${proposalUrl}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    });

    return NextResponse.json({
      success: true,
      sent: emailResult.sent,
      proposalUrl,
      whatsappUrl,
    });
  } catch (error) {
    console.error('[sponsor-proposal-email] Failed to send proposal.', error);
    return NextResponse.json({ error: 'Failed to send proposal' }, { status: 500 });
  }
}
