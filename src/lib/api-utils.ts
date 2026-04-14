import { NextRequest, NextResponse } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { getApiUser } from "@/lib/auth";
import { db } from "@/lib/db";

export function ok(data: Record<string, unknown>, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiRole(request: NextRequest, roles?: Role[]) {
  const user = await getApiUser(request);
  if (!user) return { error: fail("Unauthorized", 401), user: null };

  if (roles && !roles.includes(user.role)) {
    return { error: fail("Forbidden", 403), user: null };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      sponsorId: true,
      partnerId: true
    }
  });

  if (!dbUser || dbUser.status !== UserStatus.ACTIVE) {
    return { error: fail("Unauthorized", 401), user: null };
  }

  return { error: null, user: dbUser };
}
