import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/api-utils";

const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  subject: z.string().min(2),
  message: z.string().min(5)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid inquiry");
  }

  const item = await db.inquiry.create({ data: parsed.data });
  await db.emailQueue.create({
    data: {
      toEmail: parsed.data.email,
      subject: `Inquiry received: ${parsed.data.subject}`,
      template: "inquiry_received",
      payload: parsed.data
    }
  });
  return ok({ item });
}
