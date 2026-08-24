export const PROTECTED_APP_PREFIXES = [
  "/alerts",
  "/analytics",
  "/broker-performance",
  "/brokers",
  "/claims",
  "/compliance",
  "/customers",
  "/dispatch",
  "/documents",
  "/driver",
  "/driver-requests",
  "/drivers",
  "/expenses",
  "/facilities",
  "/factoring",
  "/finance",
  "/fleet",
  "/ifta",
  "/integrations",
  "/inventory",
  "/lanes",
  "/maintenance",
  "/nova",
  "/payroll",
  "/profitability",
  "/providers",
  "/receivables-aging",
  "/reefer",
  "/schedule",
  "/settings",
  "/system-readiness",
  "/year-end",
  "/api/documents",
] as const;

export function isProtectedAppPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PROTECTED_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function safeAppReturnPath(value: unknown, fallback = "/documents"): string {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\r\n]/.test(value)
  ) return fallback;

  try {
    const base = new URL("https://transpo.invalid");
    const destination = new URL(value, base);
    if (destination.origin !== base.origin || !isProtectedAppPath(destination.pathname)) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
