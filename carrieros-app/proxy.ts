import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { deriveVerifiedSupabaseIdentity } from "@/lib/auth/supabase-claims";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function isProtectedAppPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return ["/alerts","/analytics","/brokers","/dispatch","/documents","/driver","/drivers","/expenses","/finance","/fleet","/ifta","/maintenance","/nova","/payroll","/profitability","/settings","/api/documents"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function copyCookies(source: NextResponse, target: NextResponse): void {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next();
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
          response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtectedAppPath(request.nextUrl.pathname)) {
      const identity = deriveVerifiedSupabaseIdentity(user);
      if (!identity.ok) {
        const destination = request.nextUrl.clone();
        if (
          identity.reason === "missing_company" ||
          identity.reason === "invalid_company"
        ) {
          destination.pathname = "/auth/missing-company";
          destination.search = "";
        } else if (
          identity.reason === "missing_role" ||
          identity.reason === "unauthorized_role"
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
  } else if (isProtectedAppPath(request.nextUrl.pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.search = "";
    destination.searchParams.set("error", "configuration");
    response = NextResponse.redirect(destination);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
