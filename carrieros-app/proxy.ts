import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { deriveVerifiedSupabaseIdentity } from "@/lib/auth/supabase-claims";
import { resolveRequestId, getRequestIdHeaderName } from "@/lib/api/request-id";
import { applySecurityHeaders } from "@/lib/security/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function isProtectedDocumentPath(pathname: string): boolean {
  return pathname === "/documents" ||
    pathname.startsWith("/documents/") ||
    pathname.startsWith("/api/documents/");
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
}

/**
 * Next.js 16 Proxy (formerly Middleware).
 * Adds correlation ID + baseline security headers on every matched request,
 * refreshes Supabase cookies, and validates protected document requests.
 *
 * @see docs/architecture/security/05-headers-rate-limit-deps.md
 */
export async function proxy(request: NextRequest) {
  const requestId = resolveRequestId(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(getRequestIdHeaderName(), requestId);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtectedDocumentPath(request.nextUrl.pathname)) {
      const identityResult = deriveVerifiedSupabaseIdentity(user);
      if (!identityResult.ok) {
        const destination = request.nextUrl.clone();
        if (
          identityResult.reason === "missing_company" ||
          identityResult.reason === "invalid_company"
        ) {
          destination.pathname = "/auth/missing-company";
          destination.search = "";
        } else if (
          identityResult.reason === "missing_role" ||
          identityResult.reason === "unauthorized_role"
        ) {
          destination.pathname = "/auth/unauthorized";
          destination.search = "";
        } else {
          destination.pathname = "/login";
          destination.search = "";
          destination.searchParams.set(
            "next",
            `${request.nextUrl.pathname}${request.nextUrl.search}`,
          );
        }
        const redirectResponse = NextResponse.redirect(destination);
        copyCookies(response, redirectResponse);
        response = redirectResponse;
      }
    }
  } else if (isProtectedDocumentPath(request.nextUrl.pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.search = "";
    destination.searchParams.set("error", "configuration");
    response = NextResponse.redirect(destination);
  }

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
