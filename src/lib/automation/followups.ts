import { notifyPaymentNudge, auditFinanceEvent } from '@/lib/payments/enterprise';

export type FollowUpContext = {
  companyName?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  packageName?: string | null;
  amount?: number | null;
  currency?: string | null;
  invoiceId?: string | null;
  sponsorSubmissionId?: string | null;
};

export function buildFallbackFollowUp(ctx: FollowUpContext) {
  const company = ctx.companyName || ctx.customerName || 'there';
  const amount = ctx.amount ? `${ctx.currency || 'PHP'} ${Number(ctx.amount).toLocaleString('en-PH')}` : 'your pending invoice';
  const packageText = ctx.packageName ? ` for ${ctx.packageName}` : '';

  return `Hi ${company}, this is a friendly follow-up from RESURGENCE Powered by DesignXpress. Your sponsorship payment${packageText} is still pending (${amount}). Please complete the payment when convenient so we can finalize your sponsor placement and activation schedule.`;
}

export async function generateAiFollowUp(ctx: FollowUpContext) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return buildFallbackFollowUp(ctx);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4.1-mini',
        input: `Write a concise professional payment follow-up message for a sponsor. Keep it friendly, direct, and under 600 characters. Context: ${JSON.stringify(ctx)}`,
      }),
    });

    if (!response.ok) return buildFallbackFollowUp(ctx);
    const data: any = await response.json();
    const text = data.output_text || data.output?.[0]?.content?.[0]?.text;
    return typeof text === 'string' && text.trim() ? text.trim() : buildFallbackFollowUp(ctx);
  } catch {
    return buildFallbackFollowUp(ctx);
  }
}

export async function sendAutomatedFollowUp(ctx: FollowUpContext) {
  const message = await generateAiFollowUp(ctx);
  const preferredChannel = ctx.customerPhone ? 'whatsapp' : 'email';

  const result = await notifyPaymentNudge({
    channel: preferredChannel,
    to: ctx.customerPhone || ctx.customerEmail || undefined,
    message,
    invoiceId: ctx.invoiceId,
    sponsorSubmissionId: ctx.sponsorSubmissionId,
  });

  await auditFinanceEvent({
    action: 'followup.automated',
    provider: 'internal',
    resourceType: ctx.invoiceId ? 'invoice' : 'sponsorSubmission',
    resourceId: ctx.invoiceId || ctx.sponsorSubmissionId || null,
    amount: ctx.amount,
    currency: ctx.currency || 'PHP',
    status: result.delivered ? 'DELIVERED' : 'QUEUED_OR_SKIPPED',
    metadata: { channel: preferredChannel, message },
  });

  return { message, channel: preferredChannel, result };
}
