import { NextResponse } from "next/server";

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200, headers });
}

export function HEAD() {
  return new NextResponse(null, { status: 200, headers });
}
