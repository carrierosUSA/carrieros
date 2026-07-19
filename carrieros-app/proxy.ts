import { NextResponse, type NextRequest } from "next/server";
import { resolveRequestId, getRequestIdHeaderName } from "@/lib/api/request-id";
import { applySecurityHeaders } from "@/lib/security/headers";

/**
 * Next.js 16 Proxy (formerly Middleware).
 * Adds correlation ID + baseline security headers on every matched request.
 * Does not authenticate or redirect — auth remains stub/Supabase-designed.
 *
 * @see docs/architecture/security/05-headers-rate-limit-deps.md
 */
export function proxy(request: NextRequest) {
  const requestId = resolveRequestId(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(getRequestIdHeaderName(), requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  applySecurityHeaders(response.headers);
  response.headers.set(getRequestIdHeaderName(), requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and image optimization.
     * Avoids header overhead on _next/static and common binary files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
