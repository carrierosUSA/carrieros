/**
 * Idempotency-Key interface for money, bulk, imports, webhooks, and jobs.
 * Phase B: interface + in-memory placeholder. Persist to DB before production money paths.
 *
 * @see docs/architecture/api/07-idempotency.md
 */

export type IdempotencyRecord = {
  companyId: string;
  key: string;
  requestHash: string;
  responseStatus: number;
  responseBody: unknown;
  createdAt: string;
  expiresAt: string;
};

export type IdempotencyLookupResult =
  | { status: "miss" }
  | { status: "hit"; record: IdempotencyRecord }
  | { status: "conflict"; record: IdempotencyRecord }
  | { status: "in_flight" };

export interface IdempotencyStore {
  /** Begin or resume an idempotent operation. */
  begin(input: {
    companyId: string;
    key: string;
    requestHash: string;
    ttlSeconds: number;
  }): Promise<IdempotencyLookupResult>;

  complete(input: {
    companyId: string;
    key: string;
    requestHash: string;
    responseStatus: number;
    responseBody: unknown;
    ttlSeconds: number;
  }): Promise<void>;
}

/** Hash helper for canonical JSON bodies (stable key order recommended by caller). */
export async function hashRequestBody(canonicalBody: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(canonicalBody);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for environments without subtle crypto
  let h = 0;
  for (let i = 0; i < canonicalBody.length; i += 1) {
    h = (h * 31 + canonicalBody.charCodeAt(i)) | 0;
  }
  return `fallback_${Math.abs(h)}`;
}

export function getIdempotencyKey(request: Request): string | null {
  const key = request.headers.get("idempotency-key")?.trim();
  return key || null;
}

/**
 * In-memory placeholder — single-node / dev only.
 * Replace with Postgres `idempotency_keys` before payments/payroll.
 */
export class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly map = new Map<string, IdempotencyRecord & { inFlight?: boolean }>();

  private storageKey(companyId: string, key: string): string {
    return `${companyId}::${key}`;
  }

  async begin(input: {
    companyId: string;
    key: string;
    requestHash: string;
    ttlSeconds: number;
  }): Promise<IdempotencyLookupResult> {
    const sk = this.storageKey(input.companyId, input.key);
    const existing = this.map.get(sk);
    const now = Date.now();

    if (existing && new Date(existing.expiresAt).getTime() > now) {
      if (existing.inFlight) return { status: "in_flight" };
      if (existing.requestHash !== input.requestHash) {
        return { status: "conflict", record: existing };
      }
      return { status: "hit", record: existing };
    }

    const expiresAt = new Date(now + input.ttlSeconds * 1000).toISOString();
    this.map.set(sk, {
      companyId: input.companyId,
      key: input.key,
      requestHash: input.requestHash,
      responseStatus: 0,
      responseBody: null,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      inFlight: true,
    });
    return { status: "miss" };
  }

  async complete(input: {
    companyId: string;
    key: string;
    requestHash: string;
    responseStatus: number;
    responseBody: unknown;
    ttlSeconds: number;
  }): Promise<void> {
    const sk = this.storageKey(input.companyId, input.key);
    const now = Date.now();
    this.map.set(sk, {
      companyId: input.companyId,
      key: input.key,
      requestHash: input.requestHash,
      responseStatus: input.responseStatus,
      responseBody: input.responseBody,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + input.ttlSeconds * 1000).toISOString(),
      inFlight: false,
    });
  }
}
