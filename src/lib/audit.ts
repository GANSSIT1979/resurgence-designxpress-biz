import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

type AuditContext = {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
};

type AuditLogInput = AuditContext & {
  request?: Request;
  action: string;
  resource: string;
  resourceId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown> | null;
};

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }

  return null;
}

function getIpAddress(request?: Request) {
  if (!request) return null;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip");
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(normalizeValue);

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
      output[key] = normalizeValue(inner);
    }
    return output;
  }

  return value;
}

function pickAuditFields(source: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!source) return null;

  const output: Record<string, unknown> = {};
  for (const key of keys) {
    output[key] = normalizeValue(source[key]);
  }
  return output;
}

export function summarizeChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  const changedFields: string[] = [];

  for (const key of keys) {
    const previous = JSON.stringify(normalizeValue(before?.[key]));
    const next = JSON.stringify(normalizeValue(after?.[key]));
    if (previous !== next) {
      changedFields.push(key);
    }
  }

  return {
    changedFields,
    before: pickAuditFields(before, changedFields),
    after: pickAuditFields(after, changedFields),
  };
}

async function resolveActorFromRequest(request?: Request): Promise<AuditContext> {
  if (!request) return {};

  const token = getCookieValue(request.headers.get("cookie"), SESSION_COOKIE);
  const payload = token ? verifySession(token) : null;

  if (!payload) return {};

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  return {
    actorId: user?.id || payload.userId,
    actorEmail: user?.email || payload.email,
    actorRole: user?.role || payload.role,
  };
}

export async function logActivity(input: AuditLogInput) {
  const activityDelegate = (db as unknown as {
    activityLog?: {
      create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    };
  }).activityLog;

  if (!activityDelegate?.create) {
    return null;
  }

  const resolved = input.actorEmail
    ? {
        actorId: input.actorId || null,
        actorEmail: input.actorEmail,
        actorRole: input.actorRole || null,
      }
    : await resolveActorFromRequest(input.request);

  return activityDelegate.create({
    data: {
      actorId: resolved.actorId || null,
      actorEmail: resolved.actorEmail || "anonymous@local",
      actorRole: resolved.actorRole || null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId || null,
      targetLabel: input.targetLabel || null,
      metadataJson: input.metadata ? JSON.stringify(normalizeValue(input.metadata)) : null,
      ipAddress: getIpAddress(input.request),
      userAgent: input.request?.headers.get("user-agent") || null,
    },
  });
}