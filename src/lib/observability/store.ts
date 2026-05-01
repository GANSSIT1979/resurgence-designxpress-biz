import { prisma } from '@/lib/prisma';
import { ApiLogEvent, logApiEvent, sanitizeLogMetadata } from '@/lib/api/logger';

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export async function persistApiLog(event: ApiLogEvent) {
  try {
    const delegate = (prisma as any).observabilityLog;
    if (!delegate?.create) return;

    await delegate.create({
      data: {
        level: event.level || 'info',
        event: event.event,
        requestId: event.requestId || null,
        route: event.route || null,
        method: event.method || null,
        status: event.status || null,
        durationMs: event.durationMs || null,
        actorId: event.actorId || null,
        actorRole: event.actorRole || null,
        resourceType: event.resourceType || null,
        resourceId: event.resourceId || null,
        provider: event.provider || null,
        metadataJson: json(sanitizeLogMetadata(event.metadata)),
      },
    });
  } catch (error) {
    logApiEvent({ level: 'warn', event: 'observability.persist_log_failed', metadata: { error } });
  }
}

export async function persistMetric(name: string, value?: number, tags?: Record<string, unknown>) {
  try {
    const delegate = (prisma as any).observabilityMetric;
    if (!delegate?.create) return;

    await delegate.create({
      data: {
        name,
        value: value ?? null,
        tagsJson: json(tags || {}),
      },
    });
  } catch (error) {
    logApiEvent({ level: 'warn', event: 'observability.persist_metric_failed', metadata: { error } });
  }
}

export async function persistAlert(payload: {
  severity: string;
  title: string;
  message: string;
  requestId?: string;
  route?: string;
  provider?: string;
  resourceType?: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const delegate = (prisma as any).observabilityAlert;
    if (!delegate?.create) return;

    await delegate.create({
      data: {
        severity: payload.severity,
        title: payload.title,
        message: payload.message,
        requestId: payload.requestId || null,
        route: payload.route || null,
        provider: payload.provider || null,
        resourceType: payload.resourceType || null,
        resourceId: payload.resourceId || null,
        metadataJson: json(sanitizeLogMetadata(payload.metadata)),
      },
    });
  } catch (error) {
    logApiEvent({ level: 'warn', event: 'observability.persist_alert_failed', metadata: { error } });
  }
}
