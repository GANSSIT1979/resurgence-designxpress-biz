import { NextRequest } from "next/server";
import { ok } from "@/lib/api-utils";
import { getApiUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  return ok({ user });
}
