import { NextRequest } from "next/server";
import { ok } from "@/lib/api-utils";

export async function POST(_request: NextRequest) {
  return ok({
    received: true,
    ready: true,
    message: "Webhook placeholder endpoint is active."
  });
}
