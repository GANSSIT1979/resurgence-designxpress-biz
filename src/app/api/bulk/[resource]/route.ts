import { NextRequest } from "next/server";
import { Role, InquiryStatus, InvoiceStatus, SubmissionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseBoolean, requireApiRole } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity-log";

type ResourceConfig = {
  roles: Role[];
  resourceLabel: string;
  deleteMany: (ids: string[]) => Promise<unknown>;
  updateMany?: (ids: string[], value: string) => Promise<unknown>;
};

const resources: Record<string, ResourceConfig> = {
  "sponsor-applications": {
    roles: [Role.SYSTEM_ADMIN],
    resourceLabel: "sponsor-application",
    deleteMany: (ids) => db.sponsorApplication.deleteMany({ where: { id: { in: ids } } }),
    updateMany: (ids, value) =>
      Object.values(SubmissionStatus).includes(value as SubmissionStatus)
        ? db.sponsorApplication.updateMany({
            where: { id: { in: ids } },
            data: { status: value as SubmissionStatus },
          })
        : Promise.reject(new Error("Invalid submission status.")),
  },
  "admin-inquiries": {
    roles: [Role.SYSTEM_ADMIN],
    resourceLabel: "inquiry",
    deleteMany: (ids) => db.inquiry.deleteMany({ where: { id: { in: ids } } }),
    updateMany: (ids, value) =>
      Object.values(InquiryStatus).includes(value as InquiryStatus)
        ? db.inquiry.updateMany({
            where: { id: { in: ids } },
            data: { status: value as InquiryStatus },
          })
        : Promise.reject(new Error("Invalid inquiry status.")),
  },
  "admin-gallery": {
    roles: [Role.SYSTEM_ADMIN],
    resourceLabel: "gallery-media",
    deleteMany: (ids) => db.galleryMedia.deleteMany({ where: { id: { in: ids } } }),
    updateMany: (ids, value) =>
      db.galleryMedia.updateMany({
        where: { id: { in: ids } },
        data: { featured: parseBoolean(value, false) },
      }),
  },
  "cashier-invoices": {
    roles: [Role.SYSTEM_ADMIN, Role.CASHIER],
    resourceLabel: "invoice",
    deleteMany: (ids) => db.invoice.deleteMany({ where: { id: { in: ids } } }),
    updateMany: (ids, value) =>
      Object.values(InvoiceStatus).includes(value as InvoiceStatus)
        ? db.invoice.updateMany({
            where: { id: { in: ids } },
            data: { status: value as InvoiceStatus },
          })
        : Promise.reject(new Error("Invalid invoice status.")),
  },
  "cashier-receipts": {
    roles: [Role.SYSTEM_ADMIN, Role.CASHIER],
    resourceLabel: "receipt",
    deleteMany: (ids) => db.receipt.deleteMany({ where: { id: { in: ids } } }),
  },
};

type Params = { params: Promise<{ resource: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { resource } = await params;
  const config = resources[resource];
  if (!config) return fail("Unsupported bulk resource.", 404);

  const auth = await requireApiRole(request, config.roles);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const ids = Array.isArray(body.ids) ? body.ids.map((item) => String(item)) : [];
  const action = String(body.action || "").trim();
  const value = String(body.value || "").trim();

  if (!ids.length) return fail("At least one ID is required.", 400);

  try {
    if (action === "delete") {
      await config.deleteMany(ids);

      await logActivity(db, {
        actorId: auth.user!.id,
        actorRole: auth.user!.role,
        action: "BULK_DELETE",
        resource: config.resourceLabel,
        scope: resource,
        metadata: {
          ids,
          count: ids.length,
        },
        request,
      });

      return ok({ deleted: ids.length });
    }

    if (action === "status") {
      if (!config.updateMany) return fail("Bulk status update is not supported for this resource.", 400);
      await config.updateMany(ids, value);

      await logActivity(db, {
        actorId: auth.user!.id,
        actorRole: auth.user!.role,
        action: "BULK_STATUS_UPDATE",
        resource: config.resourceLabel,
        scope: resource,
        metadata: {
          ids,
          count: ids.length,
          value,
        },
        request,
      });

      return ok({ updated: ids.length, value });
    }

    return fail("Unsupported bulk action.", 400);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Bulk operation failed.", 400);
  }
}
