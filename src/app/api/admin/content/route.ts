<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pageContentSchema } from '@/lib/validation';
=======
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { parsePayload } from "@/lib/parse";
>>>>>>> parent of d975526 (commit)

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await (db as any).contentSection.findMany({
    orderBy: { createdAt: "desc" }
  });

<<<<<<< HEAD
  try {
    const item = await prisma.pageContent.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Content key must be unique.' }, { status: 400 });
  }
}
=======
  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const data = parsePayload(body);
  const item = await (db as any).contentSection.create({ data });
  return ok({ item });
}
>>>>>>> parent of d975526 (commit)
