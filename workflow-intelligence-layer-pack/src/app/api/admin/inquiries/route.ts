import { NextRequest } from "next/server";
import { InquiryStatus, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim()
  const subject = String(body.subject || "").trim()
  const message = String(body.message || "").trim()

  if (!name || !email || !subject || !message) {
    return fail("Name, email, subject, and message are required.", 400);
  }

  const item = await db.inquiry.create({
    data: {
      name,
      email,
      phone: body.phone ? String(body.phone) : null,
      company: body.company ? String(body.company) : null,
      subject,
      message,
      status: body.status && Object.values(InquiryStatus).includes(body.status) ? body.status : InquiryStatus.NEW,
    },
  });

  return ok({ item }, 201);
}
