/**
 * Baseline HTTP security headers for Transpo.ai / CarrierOS.
 * Applied via next.config.ts and proxy.ts. Keep CSP Report-Only until
 * production CSP is validated against Leaflet/maps and third-party assets.
 *
 * @see docs/architecture/security/05-headers-rate-limit-deps.md
 */

export const SECURITY_HEADER_NAMES = {
  frameOptions: "X-Frame-Options",
  contentTypeOptions: "X-Content-Type-Options",
  referrerPolicy: "Referrer-Policy",
  permissionsPolicy: "Permissions-Policy",
  xssProtection: "X-XSS-Protection",
  cspReportOnly: "Content-Security-Policy-Report-Only",
} as const;

/** Enforced headers — safe for localhost and production without breaking login. */
export const BASELINE_SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(self), geolocation=(self), payment=(), usb=()",
  // Legacy browsers; modern XSS mitigated by CSP + framework escaping.
  "X-XSS-Protection": "0",
};

/**
 * Report-Only CSP — does not block. Tighten to enforce after measuring reports.
 * Allows self + common Next/React patterns; maps/tiles via https: and data:/blob:.
 */
export const CSP_REPORT_ONLY =
  [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(BASELINE_SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  headers.set(SECURITY_HEADER_NAMES.cspReportOnly, CSP_REPORT_ONLY);
}
