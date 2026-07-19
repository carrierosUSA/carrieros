/**
 * Request correlation ID helpers for `/api/v1`.
 * Prefer client-supplied `X-Request-Id` when well-formed; otherwise generate.
 */

const REQUEST_ID_HEADER = "x-request-id";
const MAX_CLIENT_ID_LENGTH = 128;
const SAFE_ID = /^[A-Za-z0-9_.:-]+$/;

export function getRequestIdHeaderName(): string {
  return "X-Request-Id";
}

export function createRequestId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `req_${rand}`;
}

export function normalizeRequestId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_CLIENT_ID_LENGTH) return null;
  if (!SAFE_ID.test(trimmed)) return null;
  return trimmed;
}

export function resolveRequestId(request: Request): string {
  const fromHeader = normalizeRequestId(request.headers.get(REQUEST_ID_HEADER));
  return fromHeader ?? createRequestId();
}

export function withRequestIdHeaders(
  requestId: string,
  init?: HeadersInit,
): Headers {
  const headers = new Headers(init);
  headers.set(getRequestIdHeaderName(), requestId);
  return headers;
}
