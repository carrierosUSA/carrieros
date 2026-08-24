import { NextResponse } from "next/server";
import { getSystemReadiness } from "@/lib/system/readiness";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

function response(includeBody: boolean) {
  const ready = getSystemReadiness().readyForControlledTesting;
  const status = ready ? 200 : 503;
  if (!includeBody) return new NextResponse(null, { status, headers });
  return NextResponse.json({ status: ready ? "ready" : "not_ready" }, { status, headers });
}

export function GET() {
  return response(true);
}

export function HEAD() {
  return response(false);
}
