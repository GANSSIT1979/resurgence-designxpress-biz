import { NextRequest } from 'next/server';

export type ApiLogLevel = 'info' | 'warn' | 'error';

export type ApiLogEvent = {
  level?: ApiLogLevel;
  event: string;
  requestId?: string;
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  actorId?: string | null;
  actorRole?: string | null;
  resourceType?: string;
  resourceId?: string | null;
  provider?: 'paypal' | 'openai' | 'cloudflare' | 'internal' | string;
  metadata?: Record<string, unknown>;
};

const SECRET_KEYS = ['secret', 'password', 'token', 'authorization', 'cookie', 'key', 'client_secret', 'access_token'];

export function createRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getRequestId(req: NextRequest) {
  return req.headers.get('x-request-id') || req.headers.get('x-vercel-id') || createRequestId();
}

function redactValue(key: string, value: unknown): unknown {
  const normalized = key.toLowerCase();
  if (SECRET_KEYS.some((secretKey) => normalized.includes(secretKey))) {
    return '[REDACTED]';
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return sanitizeLogMetadata(value as Record<string, unknown>);
  }

  if (Array.isArray(value)) {
    return value.map((item) => (item && typeof item === 'object' ? sanitizeLogMetadata(item as Record<string, unknown>) : item));
  }

  return value;
}

export function sanitizeLogMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, redactValue(key, value)]));
}

export function logApiEvent(event: ApiLogEvent) {
  const level = event.level || 'info';
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event: event.event,
    requestId: event.requestId,
    route: event.route,
    method: event.method,
    status: event.status,
    durationMs: event.durationMs,
    actorId: event.actorId || null,
    actorRole: event.actorRole || null,
    resourceType: event.resourceType,
    resourceId: event.resourceId || null,
    provider: event.provider,
    metadata: sanitizeLogMetadata(event.metadata),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export function logAuditEvent(event: Omit<ApiLogEvent, 'level'>) {
  logApiEvent({ ...event, level: 'info', event: `audit.${event.event}` });
}
