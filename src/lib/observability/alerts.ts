import { logApiEvent } from '@/lib/api/logger';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertPayload = {
  severity: AlertSeverity;
  title: string;
  message: string;
  requestId?: string;
  route?: string;
  provider?: string;
  resourceType?: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function sendAlert(alert: AlertPayload) {
  logApiEvent({
    level: alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warn' : 'info',
    event: 'alert.triggered',
    requestId: alert.requestId,
    route: alert.route,
    provider: alert.provider,
    resourceType: alert.resourceType,
    resourceId: alert.resourceId,
    metadata: {
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      ...alert.metadata,
    },
  });

  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
  } catch (error) {
    logApiEvent({
      level: 'error',
      event: 'alert.delivery_failed',
      requestId: alert.requestId,
      metadata: { error },
    });
  }
}

export async function alertPaymentFailure(payload: Omit<AlertPayload, 'severity' | 'title'>) {
  return sendAlert({
    ...payload,
    severity: 'critical',
    title: 'Payment failure detected',
  });
}

export async function alertWebhookFailure(payload: Omit<AlertPayload, 'severity' | 'title'>) {
  return sendAlert({
    ...payload,
    severity: 'warning',
    title: 'Webhook processing failure detected',
  });
}
