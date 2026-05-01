import { prisma } from '@/lib/prisma';
import { logAuditEvent, logApiEvent } from '@/lib/api/logger';
import { persistMetric, persistAlert } from '@/lib/observability/store';

function delegate(name: string) {
  return (prisma as any)[name];
}

function safeJson(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export async function hasProcessedPaymentEvent(provider: string, eventId: string) {
  const d = delegate('paymentEvent');
  if (!d?.findFirst || !eventId) return false;
  const existing = await d.findFirst({ where: { provider, eventId } });
  return Boolean(existing);
}

export async function recordPaymentEvent(input: {
  provider: string;
  eventId: string;
  eventType: string;
  resourceType?: string;
  resourceId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
}) {
  const d = delegate('paymentEvent');
  if (!d?.create || !input.eventId) {
    logAuditEvent({
      event: 'payment.event_recorded',
      provider: input.provider,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata,
    });
    return { persisted: false };
  }

  try {
    const existing = await d.findFirst({ where: { provider: input.provider, eventId: input.eventId } });
    if (existing) return { persisted: true, duplicate: true, existing };

    const created = await d.create({
      data: {
        provider: input.provider,
        eventId: input.eventId,
        eventType: input.eventType,
        resourceType: input.resourceType || null,
        resourceId: input.resourceId || null,
        amount: input.amount ?? null,
        currency: input.currency || 'PHP',
        status: input.status || 'PROCESSED',
        metadataJson: safeJson(input.metadata),
      },
    });

    return { persisted: true, duplicate: false, created };
  } catch (error) {
    logApiEvent({ level: 'warn', event: 'payment.event_persist_failed', provider: input.provider, metadata: { error } });
    return { persisted: false, error };
  }
}

export async function auditFinanceEvent(input: {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  provider?: string;
  resourceType?: string;
  resourceId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
}) {
  const d = delegate('financeAuditLog');

  logAuditEvent({
    event: `finance.${input.action}`,
    actorId: input.actorId,
    actorRole: input.actorRole,
    provider: input.provider,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    metadata: { amount: input.amount, currency: input.currency, status: input.status, ...input.metadata },
  });

  if (!d?.create) return { persisted: false };

  try {
    const created = await d.create({
      data: {
        actorId: input.actorId || null,
        actorRole: input.actorRole || null,
        action: input.action,
        provider: input.provider || 'paypal',
        resourceType: input.resourceType || null,
        resourceId: input.resourceId || null,
        amount: input.amount ?? null,
        currency: input.currency || 'PHP',
        status: input.status || null,
        metadataJson: safeJson(input.metadata),
      },
    });
    return { persisted: true, created };
  } catch (error) {
    logApiEvent({ level: 'warn', event: 'finance.audit_persist_failed', metadata: { error } });
    return { persisted: false, error };
  }
}

export async function trackPaymentDropoff(step: string, metadata?: Record<string, unknown>) {
  await persistMetric(`funnel.${step}`, 1, metadata);
}

export async function recordRevenue(amount: number, currency = 'PHP', source = 'paypal', metadata?: Record<string, unknown>) {
  await persistMetric('revenue.recorded', amount, { currency, source, ...metadata });
}

export async function notifyPaymentNudge(input: {
  channel: 'whatsapp' | 'sms' | 'email';
  to?: string | null;
  message: string;
  invoiceId?: string | null;
  sponsorSubmissionId?: string | null;
}) {
  await auditFinanceEvent({
    action: `nudge.${input.channel}`,
    provider: 'manual',
    resourceType: input.invoiceId ? 'invoice' : input.sponsorSubmissionId ? 'sponsorSubmission' : 'payment_nudge',
    resourceId: input.invoiceId || input.sponsorSubmissionId || null,
    status: 'QUEUED',
    metadata: { to: input.to, message: input.message },
  });

  const webhookUrl = input.channel === 'whatsapp' ? process.env.WHATSAPP_WEBHOOK_URL : input.channel === 'sms' ? process.env.SMS_WEBHOOK_URL : process.env.EMAIL_WEBHOOK_URL;
  if (!webhookUrl) return { delivered: false, reason: 'webhook_not_configured' };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return { delivered: true };
  } catch (error) {
    await persistAlert({ severity: 'warning', title: 'Payment nudge failed', message: `Failed to send ${input.channel} nudge`, resourceType: input.invoiceId ? 'invoice' : 'sponsorSubmission', resourceId: input.invoiceId || input.sponsorSubmissionId || null, metadata: { error } });
    return { delivered: false, error };
  }
}
