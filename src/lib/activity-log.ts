import type { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";

type ActivityLogInput = {
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  scope?: string | null;
  metadata?: Record<string, unknown> | null;
  request?: NextRequest;
};

function getIpAddress(request?: NextRequest) {
  if (!request) return null;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return null;
}

export async function logActivity(db: PrismaClient, input: ActivityLogInput) {
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

  return db.activityLog.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId || null,
      scope: input.scope || null,
      metadataJson,
      ipAddress: getIpAddress(input.request),
      userAgent: input.request?.headers.get("user-agent") || null,
    },
  });
}
