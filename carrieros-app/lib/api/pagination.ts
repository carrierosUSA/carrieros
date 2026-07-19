/**
 * Pagination helpers for `/api/v1` list endpoints.
 * Prefer cursor pagination for hot paths; offset allowed for small admin lists.
 */

export type CursorPaginationQuery = {
  limit?: number;
  cursor?: string | null;
};

export type OffsetPaginationQuery = {
  page?: number;
  perPage?: number;
};

export type CursorPaginationMeta = {
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
  limit: number;
};

export type OffsetPaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
};

export const DEFAULT_PAGE_LIMIT = 25;
export const MAX_PAGE_LIMIT = 100;

export function clampLimit(
  value: number | undefined,
  fallback = DEFAULT_PAGE_LIMIT,
  max = MAX_PAGE_LIMIT,
): number {
  if (value === undefined || Number.isNaN(value)) return fallback;
  const n = Math.floor(value);
  if (n < 1) return fallback;
  return Math.min(n, max);
}

export function parseLimitParam(
  searchParams: URLSearchParams,
  fallback = DEFAULT_PAGE_LIMIT,
): number {
  const raw = searchParams.get("limit");
  if (!raw) return fallback;
  return clampLimit(Number(raw), fallback);
}

export function parseCursorParam(searchParams: URLSearchParams): string | null {
  const cursor = searchParams.get("cursor");
  return cursor && cursor.trim() ? cursor.trim() : null;
}

export function parseOffsetParams(searchParams: URLSearchParams): {
  page: number;
  perPage: number;
} {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const perRaw = Number(searchParams.get("per_page") ?? String(DEFAULT_PAGE_LIMIT));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const perPage = clampLimit(perRaw);
  return { page, perPage };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(cursor: string): Uint8Array {
  const padded = cursor.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  const binary =
    typeof atob === "function"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Opaque cursor: base64url(JSON). Not signed — do not put secrets inside. */
export function encodeCursor(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  return toBase64Url(new TextEncoder().encode(json));
}

export function decodeCursor<T extends Record<string, unknown>>(
  cursor: string,
): T | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(cursor));
    const parsed = JSON.parse(json) as T;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildCursorPage<T>(
  items: T[],
  limit: number,
  getCursor: (item: T) => Record<string, unknown>,
  options?: { prevCursor?: string | null },
): { data: T[]; pagination: CursorPaginationMeta } {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const last = data[data.length - 1];

  return {
    data,
    pagination: {
      next_cursor: hasMore && last ? encodeCursor(getCursor(last)) : null,
      prev_cursor: options?.prevCursor ?? null,
      has_more: hasMore,
      limit,
    },
  };
}

export function buildOffsetMeta(
  page: number,
  perPage: number,
  total: number,
): OffsetPaginationMeta {
  return {
    page,
    per_page: perPage,
    total,
    has_more: page * perPage < total,
  };
}

export function offsetToSkip(page: number, perPage: number): number {
  return (page - 1) * perPage;
}
