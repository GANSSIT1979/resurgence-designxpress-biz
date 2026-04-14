export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN, Role.SPONSOR, Role.CASHIER]);
  if (auth.error) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("File is required");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return fail("Unsupported file type", 415);
  }

  if (file.size > MAX_FILE_SIZE) {
    return fail("File exceeds 5 MB limit", 413);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const fullPath = path.join(dir, filename);

  await writeFile(fullPath, bytes);

  return ok({ path: `/uploads/${filename}` });
}
