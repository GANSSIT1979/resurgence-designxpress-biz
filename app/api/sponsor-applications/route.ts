import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/api-utils";

const sponsorApplicationSchema = z.object({
  sponsorName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  packageInterest: z.string().min(2),
  message: z.string().min(5)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = sponsorApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid sponsor application");
  }

  const item = await db.sponsorApplication.create({ data: parsed.data });
  await db.emailQueue.create({
    data: {
      toEmail: parsed.data.email,
      subject: `Sponsor application received: ${parsed.data.sponsorName}`,
      template: "sponsor_application_received",
      payload: parsed.data
    }
  });
  return ok({ item });
}
